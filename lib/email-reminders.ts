import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { differenceInCalendarDays, format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { getReminderInfo } from "@/lib/date";
import { sendEmail } from "@/lib/mail";

const outboxDirectory = path.join(process.cwd(), "data", "email-outbox");

type ReminderDispatchResult = {
  checked: number;
  eligible: number;
  sent: number;
  skipped: number;
  mode: "gmail" | "outbox" | "disabled";
  outboxFiles: string[];
};

function formatExpiryDate(date: Date) {
  return format(date, "d MMM yyyy");
}

async function writeOutboxEmail(payload: Record<string, unknown>) {
  await mkdir(outboxDirectory, { recursive: true });

  const fileName = `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID()}.json`;
  const absolutePath = path.join(outboxDirectory, fileName);

  await writeFile(absolutePath, JSON.stringify(payload, null, 2), "utf8");

  console.info("[Warranty Tracker] Reminder email written to outbox", {
    absolutePath
  });

  return absolutePath;
}

async function sendReminderEmail(input: {
  email: string;
  productName: string;
  retailer: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  productId: string;
}) {
  const subject = "Garancija uskoro istice";
  const text = [
    "Garancija uskoro istice.",
    "",
    `Proizvod: ${input.productName}`,
    `Prodavnica: ${input.retailer}`,
    `Datum isteka garancije: ${formatExpiryDate(input.expiryDate)}`,
    `Preostalo dana: ${input.daysUntilExpiry}`,
    "",
    "Proveri racun i detalje proizvoda u aplikaciji Warranty Tracker."
  ].join("\n");

  const mailResult = await sendEmail(input.email, subject, text);

  if (mailResult.ok) {
    return {
      mode: "gmail" as const,
      outboxFile: null
    };
  }

  const outboxFile = await writeOutboxEmail({
    to: input.email,
    subject,
    text,
    productId: input.productId,
    mode: "outbox",
    mailError: mailResult.error ?? "Unknown mail error"
  });

  return {
    mode: "outbox" as const,
    outboxFile
  };
}

export async function runEmailReminderCheck(source: string): Promise<ReminderDispatchResult> {
  const user = await getCurrentUser();

  if (!user.wantsEmailReminders || !user.email) {
    console.info("[Warranty Tracker] Email reminders disabled for current user", {
      source,
      email: user.email,
      wantsEmailReminders: user.wantsEmailReminders
    });

    return {
      checked: 0,
      eligible: 0,
      sent: 0,
      skipped: 0,
      mode: "disabled",
      outboxFiles: []
    };
  }

  const now = new Date();
  const products = await prisma.product.findMany({
    where: {
      reminderEnabled: true
    },
    orderBy: {
      expiryDate: "asc"
    }
  });

  const dueProducts = products.filter((product) => {
    const reminder = getReminderInfo(product.expiryDate, product.reminderEnabled, product.reminderDaysBefore, now);

    if (!reminder.isReminderActive) {
      return false;
    }

    if (product.lastReminderSentAt) {
      return false;
    }

    return true;
  });

  const outboxFiles: string[] = [];
  let sent = 0;
  let skipped = 0;
  let mode: ReminderDispatchResult["mode"] = process.env.EMAIL_USER && process.env.EMAIL_PASS ? "gmail" : "outbox";

  for (const product of dueProducts) {
    try {
      const daysUntilExpiry = differenceInCalendarDays(product.expiryDate, now);
      const emailResult = await sendReminderEmail({
        email: user.email,
        productName: product.name,
        retailer: product.retailer,
        expiryDate: product.expiryDate,
        daysUntilExpiry,
        productId: product.id
      });

      if (emailResult.outboxFile) {
        outboxFiles.push(emailResult.outboxFile);
      }

      mode = emailResult.mode;

      await prisma.product.update({
        where: { id: product.id },
        data: {
          lastReminderSentAt: now
        }
      });

      console.info("[Warranty Tracker] Reminder dispatch recorded", {
        source,
        productId: product.id,
        email: user.email,
        lastReminderSentAt: now.toISOString()
      });

      sent += 1;
    } catch (error) {
      skipped += 1;
      console.error("[Warranty Tracker] Reminder dispatch failed", {
        source,
        productId: product.id,
        email: user.email,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return {
    checked: products.length,
    eligible: dueProducts.length,
    sent,
    skipped,
    mode,
    outboxFiles
  };
}

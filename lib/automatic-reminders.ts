import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { runEmailReminderCheckForUser } from "@/lib/email-reminders";

export async function maybeRunAutomaticReminderCheckForUser(userId: string) {
  const user = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      firstName: true,
      lastName: true,
      email: true,
      plan: true,
      role: true,
      verified: true,
      isPremium: true,
      wantsEmailReminders: true,
      lastReminderCheckAt: true
    }
  });

  if (!user) {
    return;
  }

  const now = new Date();
  const lastAllowedCheck = subDays(now, 30);

  if (user.lastReminderCheckAt && user.lastReminderCheckAt > lastAllowedCheck) {
    return;
  }

  await prisma.userProfile.update({
    where: { id: user.id },
    data: {
      lastReminderCheckAt: now
    }
  });

  await runEmailReminderCheckForUser(
    {
      ...user,
      plan: user.plan === "pro" || user.isPremium ? "pro" : "free",
      role: user.role === "admin" ? "admin" : "user",
      verified: user.plan === "pro" || user.isPremium,
      isPremium: user.plan === "pro" || user.isPremium
    },
    "automatic-30d"
  );
}

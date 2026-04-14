import { NextResponse } from "next/server";
import { runGlobalEmailReminderCheck } from "@/lib/email-reminders";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.REMINDER_CRON_SECRET;

  if (!secret) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runGlobalEmailReminderCheck("api");
  return NextResponse.json(result);
}

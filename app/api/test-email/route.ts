import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { sendEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const emailUser = process.env.EMAIL_USER;

  if (!emailUser) {
    console.error("[Warranty Tracker] Cannot send test email because EMAIL_USER is missing");
    return NextResponse.json(
      {
        ok: false,
        error: "EMAIL_USER nije podesen."
      },
      { status: 400 }
    );
  }

  const result = await sendEmail(emailUser, "Test email", "Radi");

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error ?? "Slanje nije uspelo."
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: `Test email je poslat na ${emailUser}.`
  });
}

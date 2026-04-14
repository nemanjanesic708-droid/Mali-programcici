import nodemailer from "nodemailer";

type SendEmailResult = {
  ok: boolean;
  error?: string;
};

function getMailConfig() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.error("[Warranty Tracker] Missing EMAIL_USER or EMAIL_PASS in environment");
    return null;
  }

  return { user, pass };
}

export async function sendEmail(to: string, subject: string, text: string): Promise<SendEmailResult> {
  const config = getMailConfig();

  if (!config) {
    return {
      ok: false,
      error: "Email credentials are missing."
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.user,
        pass: config.pass
      }
    });

    await transporter.sendMail({
      from: config.user,
      to,
      subject,
      text
    });

    console.info("[Warranty Tracker] Email sent", {
      to,
      subject
    });

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Warranty Tracker] Email send failed", {
      to,
      subject,
      error: message
    });

    return {
      ok: false,
      error: message
    };
  }
}

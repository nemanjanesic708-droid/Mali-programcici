import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "warranty_tracker_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

function getAuthSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "warranty-tracker-dev-secret");
}

export type AuthSession = {
  userId: string;
};

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getAuthSecret());

  cookies().set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS
  });
}

export function clearSession() {
  cookies().delete(AUTH_COOKIE_NAME);
}

export async function getSession(): Promise<AuthSession | null> {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, getAuthSecret());
    const userId = typeof verified.payload.userId === "string" ? verified.payload.userId : null;

    if (!userId) {
      return null;
    }

    return { userId };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export { AUTH_COOKIE_NAME };

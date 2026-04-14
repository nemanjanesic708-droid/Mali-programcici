import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureUserProfiles, getAdminConfig } from "@/lib/current-user";

const ADMIN_SESSION_COOKIE = "admin-session";

function readTextField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getSessionSecret(password: string) {
  return process.env.ADMIN_SESSION_SECRET?.trim() || password;
}

function createSessionValue(adminId: string, email: string, password: string) {
  const payload = `${adminId}:${email}`;
  const signature = createHmac("sha256", getSessionSecret(password)).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

function parseSessionValue(value: string, password: string) {
  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  const expectedSignature = createHmac("sha256", getSessionSecret(password)).update(payload).digest("hex");

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  const [adminId, email] = payload.split(":");

  if (!adminId || !email) {
    return null;
  }

  return { adminId, email };
}

function getAdminLoginErrorUrl(message: string) {
  return `/admin/login?error=${encodeURIComponent(message)}`;
}

export async function getAdminSessionUser() {
  const adminConfig = getAdminConfig();

  if (!adminConfig) {
    return null;
  }

  await ensureUserProfiles();

  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return null;
  }

  const session = parseSessionValue(sessionCookie, adminConfig.password);

  if (!session || session.adminId !== adminConfig.id || session.email !== adminConfig.email) {
    return null;
  }

  const adminUser = await prisma.userProfile.findUnique({
    where: { id: adminConfig.id }
  });

  if (!adminUser || adminUser.role !== "admin") {
    return null;
  }

  return adminUser;
}

export async function hasAdminSession() {
  const adminUser = await getAdminSessionUser();
  return Boolean(adminUser);
}

export async function requireAdminSession() {
  const adminUser = await getAdminSessionUser();

  if (!adminUser) {
    redirect("/admin/login");
  }

  return adminUser;
}

export async function loginAdminAction(formData: FormData) {
  "use server";

  const adminConfig = getAdminConfig();

  if (!adminConfig) {
    redirect(getAdminLoginErrorUrl("Admin nalog nije konfigurisan u env fajlu."));
  }

  const email = readTextField(formData, "email").toLowerCase();
  const password = readTextField(formData, "password");

  if (!safeEqual(email, adminConfig.email) || !safeEqual(password, adminConfig.password)) {
    redirect(getAdminLoginErrorUrl("Neispravni admin podaci."));
  }

  await ensureUserProfiles();

  cookies().set(ADMIN_SESSION_COOKIE, createSessionValue(adminConfig.id, adminConfig.email, adminConfig.password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });

  redirect("/admin");
}

export async function logoutAdminAction() {
  "use server";

  cookies().delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

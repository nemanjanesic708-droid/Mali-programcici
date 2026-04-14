import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const ADMIN_USER_ID = "admin-user";

export type UserRole = "admin" | "user";

function normalizeEnvValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeUserRole(role: string | null | undefined): UserRole {
  return role === "admin" ? "admin" : "user";
}

export function getAdminConfig() {
  const email = normalizeEnvValue(process.env.ADMIN_EMAIL)?.toLowerCase();
  const password = normalizeEnvValue(process.env.ADMIN_PASSWORD);

  if (!email || !password) {
    return null;
  }

  return {
    id: ADMIN_USER_ID,
    fullName: normalizeEnvValue(process.env.ADMIN_NAME) ?? "Admin",
    email,
    password
  };
}

export type CurrentUser = {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  plan: "free" | "pro";
  role: UserRole;
  verified: boolean;
  isPremium: boolean;
  wantsEmailReminders: boolean;
};

function mapUser(user: {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  plan: string;
  role: string | null;
  verified: boolean;
  isPremium: boolean;
  wantsEmailReminders: boolean;
}): CurrentUser {
  const plan = user.plan === "pro" || user.isPremium ? "pro" : "free";

  return {
    id: user.id,
    fullName: user.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    plan,
    role: normalizeUserRole(user.role),
    verified: user.verified || plan === "pro",
    isPremium: user.isPremium || plan === "pro",
    wantsEmailReminders: user.wantsEmailReminders
  };
}

export async function ensureUserProfiles() {
  const adminConfig = getAdminConfig();

  if (!adminConfig) {
    return {
      adminUser: null
    };
  }

  const adminUser = await prisma.userProfile.upsert({
    where: { id: adminConfig.id },
    update: {
      fullName: adminConfig.fullName,
      email: adminConfig.email,
      role: "admin",
      verified: true,
      plan: "pro",
      isPremium: true
    },
    create: {
      id: adminConfig.id,
      firstName: adminConfig.fullName,
      lastName: null,
      fullName: adminConfig.fullName,
      email: adminConfig.email,
      passwordHash: null,
      plan: "pro",
      role: "admin",
      verified: true,
      isPremium: true,
      wantsEmailReminders: false
    }
  });

  return {
    adminUser
  };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.userProfile.findUnique({
    where: { id: session.userId },
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
      wantsEmailReminders: true
    }
  });

  return user ? mapUser(user) : null;
}

export async function getAdminUserProfile() {
  const { adminUser } = await ensureUserProfiles();
  return adminUser;
}

export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

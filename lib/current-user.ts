import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export type CurrentUser = {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  plan: "free" | "pro";
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
    verified: plan === "pro",
    isPremium: plan === "pro",
    wantsEmailReminders: user.wantsEmailReminders
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
      verified: true,
      isPremium: true,
      wantsEmailReminders: true
    }
  });

  return user ? mapUser(user) : null;
}

export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

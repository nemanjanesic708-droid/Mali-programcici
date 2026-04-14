import { prisma } from "@/lib/prisma";

const DEFAULT_USER_ID = "default-user";

const DEFAULT_USER = {
  id: DEFAULT_USER_ID,
  fullName: "Nikola Jovanovic",
  email: null,
  verified: true,
  isPremium: true,
  wantsEmailReminders: false
};

export type CurrentUser = {
  id: string;
  fullName: string;
  email: string | null;
  verified: boolean;
  isPremium: boolean;
  wantsEmailReminders: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser> {
  const user = await prisma.userProfile.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: DEFAULT_USER
  });

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    verified: user.verified,
    isPremium: user.isPremium,
    wantsEmailReminders: user.wantsEmailReminders
  };
}

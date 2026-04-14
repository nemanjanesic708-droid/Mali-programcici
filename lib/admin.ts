import { prisma } from "@/lib/prisma";
import { ensureUserProfiles } from "@/lib/current-user";

export async function getAdminDashboardMetrics() {
  await ensureUserProfiles();

  const [totalUsers, totalWarranties, premiumInterestCount] = await Promise.all([
    prisma.userProfile.count(),
    prisma.product.count(),
    prisma.premiumInterest.count()
  ]);

  return {
    totalUsers,
    totalWarranties,
    premiumInterestCount
  };
}

export async function listAdminUsers() {
  await ensureUserProfiles();

  return prisma.userProfile.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      verified: true,
      plan: true,
      createdAt: true
    }
  });
}

export async function updateUserVerifiedStatus(userId: string, verified: boolean) {
  await ensureUserProfiles();

  return prisma.userProfile.update({
    where: { id: userId },
    data: { verified },
    select: {
      id: true,
      verified: true
    }
  });
}

export async function listPremiumInterestEntries() {
  await ensureUserProfiles();

  return prisma.premiumInterest.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      source: true,
      createdAt: true
    }
  });
}

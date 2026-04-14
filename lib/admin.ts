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

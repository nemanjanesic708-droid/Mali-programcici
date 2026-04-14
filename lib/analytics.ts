import { prisma } from "@/lib/prisma";

type AnalyticsInput = {
  name: string;
  entityId?: string;
  source?: string;
  feature?: string;
  email?: string;
  payload?: Record<string, unknown>;
};

export async function trackEvent(input: AnalyticsInput) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        name: input.name,
        entityId: input.entityId,
        source: input.source,
        feature: input.feature,
        email: input.email,
        payload: input.payload ? JSON.stringify(input.payload) : null
      }
    });
  } catch (error) {
    console.error("Failed to track analytics event", error);
  }
}

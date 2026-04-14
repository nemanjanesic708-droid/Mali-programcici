import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

let bootstrapPromise: Promise<void> | null = null;

export async function ensureSeedData() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const existingProducts = await prisma.product.findMany({
        select: {
          id: true,
          priceCents: true,
          priceAmount: true,
          priceCurrency: true,
          productImage: true,
          productImageUrl: true,
          reminderEnabled: true,
          reminderDaysBefore: true,
          userId: true
        }
      });

      await Promise.all(
        existingProducts.map((product) => {
          const nextData: Record<string, unknown> = {};

          if (!product.priceAmount) {
            nextData.priceAmount = new Prisma.Decimal((product.priceCents / 100).toFixed(2));
          }

          if (!product.priceCurrency) {
            nextData.priceCurrency = "EUR";
          }

          if (!product.productImage && product.productImageUrl) {
            nextData.productImage = product.productImageUrl;
          }

          if (!product.reminderEnabled && product.reminderDaysBefore) {
            nextData.reminderEnabled = true;
          }

          if (!product.userId) {
            nextData.userId = null;
          }

          if (Object.keys(nextData).length === 0) {
            return Promise.resolve();
          }

          return prisma.product.update({
            where: { id: product.id },
            data: nextData
          });
        })
      );
    })().finally(() => {
      bootstrapPromise = null;
    });
  }

  await bootstrapPromise;
}

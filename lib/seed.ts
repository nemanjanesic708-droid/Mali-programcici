import { Prisma } from "@prisma/client";
import { subDays, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { calculateExpiryDate } from "@/lib/date";

let bootstrapPromise: Promise<void> | null = null;

function seedItems() {
  const now = new Date();

  const products = [
    {
      name: "Sony WH-1000XM5",
      retailer: "TechMart",
      priceCents: 38999,
      priceAmount: new Prisma.Decimal("389.99"),
      priceCurrency: "EUR",
      purchaseDate: subMonths(now, 7),
      warrantyMonths: 24,
      notes: "Original box stored in the hallway cabinet.",
      productImage:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Dyson V15 Detect",
      retailer: "Home Studio",
      priceCents: 72900,
      priceAmount: new Prisma.Decimal("729.00"),
      priceCurrency: "EUR",
      purchaseDate: subMonths(subDays(now, 12), 23),
      warrantyMonths: 24,
      notes: "Battery serial noted on the invoice.",
      productImage:
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "Samsung Frame TV 55",
      retailer: "Nova Electronics",
      priceCents: 139900,
      priceAmount: new Prisma.Decimal("139900"),
      priceCurrency: "RSD",
      purchaseDate: subMonths(subDays(now, 10), 11),
      warrantyMonths: 12,
      notes: "Keep wall-mount paperwork together with the receipt.",
      productImage:
        "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80"
    },
    {
      name: "KitchenAid Artisan Mixer",
      retailer: "Cook & Co",
      priceCents: 45900,
      priceAmount: new Prisma.Decimal("459.00"),
      priceCurrency: "EUR",
      purchaseDate: subMonths(subDays(now, 5), 1),
      warrantyMonths: 12,
      notes: "Gift receipt uploaded separately by family account later.",
      productImage:
        "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80"
    }
  ].map((item) => ({
    ...item,
    expiryDate: calculateExpiryDate(item.purchaseDate, item.warrantyMonths),
    reminderEnabled: true,
    reminderDaysBefore: item.name === "Samsung Frame TV 55" ? 14 : 30
  }));

  return prisma.product.createMany({
    data: products
  });
}

export async function ensureSeedData() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const count = await prisma.product.count();

      if (count === 0) {
        await seedItems();
      }

      const existingProducts = await prisma.product.findMany({
        select: {
          id: true,
          priceCents: true,
          priceAmount: true,
          priceCurrency: true,
          productImage: true,
          productImageUrl: true,
          reminderEnabled: true,
          reminderDaysBefore: true
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

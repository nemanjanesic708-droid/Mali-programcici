import { Prisma, Product } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ensureSeedData } from "@/lib/seed";
import { getDaysUntilExpiry, getReminderInfo, getWarrantyStatus, type WarrantyStatus } from "@/lib/date";
import type { SupportedCurrency } from "@/lib/format";

export type ItemRecord = Product & {
  status: WarrantyStatus;
  daysUntilExpiry: number;
  displayPriceAmount: Prisma.Decimal | number;
  displayPriceCurrency: SupportedCurrency;
  displayProductImage: string | null;
  reminderDate: Date | null;
  reminderActive: boolean;
  reminderDueToday: boolean;
  daysUntilReminder: number | null;
};

function mapItem(product: Product): ItemRecord {
  const reminder = getReminderInfo(product.expiryDate, product.reminderEnabled, product.reminderDaysBefore);

  return {
    ...product,
    status: getWarrantyStatus(product.expiryDate),
    daysUntilExpiry: getDaysUntilExpiry(product.expiryDate),
    displayPriceAmount: product.priceAmount ?? new Prisma.Decimal(product.priceCents / 100),
    displayPriceCurrency: (product.priceCurrency || "EUR") as SupportedCurrency,
    displayProductImage: product.productImage ?? product.productImageUrl ?? null,
    reminderDate: reminder.reminderDate,
    reminderActive: reminder.isReminderActive,
    reminderDueToday: reminder.isReminderDueToday,
    daysUntilReminder: reminder.daysUntilReminder
  };
}

export async function getDashboardItems() {
  await ensureSeedData();

  const products = await prisma.product.findMany({
    orderBy: [{ expiryDate: "asc" }, { createdAt: "desc" }]
  });

  return products.map(mapItem);
}

export async function getItemById(id: string) {
  await ensureSeedData();

  const product = await prisma.product.findUnique({
    where: { id }
  });

  return product ? mapItem(product) : null;
}

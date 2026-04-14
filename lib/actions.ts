"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { trackEvent } from "@/lib/analytics";
import { calculateExpiryDate, parseDateInput } from "@/lib/date";
import { getCurrentUser } from "@/lib/current-user";
import { runEmailReminderCheck } from "@/lib/email-reminders";
import {
  deleteProductImageFile,
  deleteReceiptFile,
  saveProductImageUpload,
  saveReceiptUpload
} from "@/lib/uploads";
import { PRO_FEATURES, isProFeatureSlug, type ProFeatureSlug } from "@/lib/pro-features";
import type { SupportedCurrency } from "@/lib/format";

type ParsedItemPayload = {
  name: string;
  retailer: string;
  priceAmount: Prisma.Decimal;
  priceCurrency: SupportedCurrency;
  priceCents: number;
  purchaseDate: Date;
  warrantyMonths: number;
  expiryDate: Date;
  notes: string | null;
  receiptFile: File | null;
  productImageFile: File | null;
  removeReceipt: boolean;
  removeProductImage: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: number | null;
};

function appendQuery(url: string, key: string, value: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${key}=${encodeURIComponent(value)}`;
}

function redirectWithError(returnTo: string, message: string): never {
  redirect(appendQuery(returnTo, "error", message));
}

function readTextField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readReceiptFile(formData: FormData) {
  const candidates = ["receiptUpload", "receiptCamera", "receipt"];

  for (const fieldName of candidates) {
    const value = formData.get(fieldName);
    if (value instanceof File && value.size > 0) {
      console.info("[Warranty Tracker] Receipt file found in form data", {
        fieldName,
        fileName: value.name,
        size: value.size,
        type: value.type
      });
      return value;
    }
  }

  console.info("[Warranty Tracker] No receipt file found in form data");

  return null;
}

function readProductImageFile(formData: FormData) {
  const value = formData.get("productImage");

  if (value instanceof File && value.size > 0) {
    console.info("[Warranty Tracker] Product image file found in form data", {
      fieldName: "productImage",
      fileName: value.name,
      size: value.size,
      type: value.type
    });
    return value;
  }

  console.info("[Warranty Tracker] No product image file found in form data");
  return null;
}

function parsePriceAmount(value: string, currency: SupportedCurrency) {
  const compact = value.trim().replace(/\s+/g, "");

  if (!compact) {
    return null;
  }

  if (currency === "RSD") {
    const normalized = compact.replace(/[.,]/g, "");

    if (!/^\d+$/.test(normalized)) {
      return null;
    }

    return new Prisma.Decimal(normalized);
  }

  let normalized = compact;

  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = normalized.replace(",", ".");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  return new Prisma.Decimal(normalized);
}

function toLegacyPriceCents(amount: Prisma.Decimal, currency: SupportedCurrency) {
  if (currency === "RSD") {
    return amount.mul(100).toDecimalPlaces(0).toNumber();
  }

  return amount.mul(100).toDecimalPlaces(0).toNumber();
}

function validateImageFile(file: File | null, label: string) {
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error(`${label} mora biti dodat kao slika.`);
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`${label} mora biti manja od 10 MB.`);
  }
}

function parseItemFormData(formData: FormData): ParsedItemPayload {
  const name = readTextField(formData, "name");
  const retailer = readTextField(formData, "retailer");
  const priceValue = readTextField(formData, "price");
  const priceCurrency = readTextField(formData, "priceCurrency") as SupportedCurrency;
  const purchaseDateValue = readTextField(formData, "purchaseDate");
  const warrantyMonthsValue = readTextField(formData, "warrantyMonths");
  const notes = readTextField(formData, "notes");
  const removeReceipt = formData.get("removeReceipt") === "on";
  const removeProductImage = formData.get("removeProductImage") === "on";
  const reminderEnabled = formData.get("reminderEnabled") === "on";
  const reminderDaysBeforeValue = readTextField(formData, "reminderDaysBefore");
  const purchaseDate = parseDateInput(purchaseDateValue);
  const warrantyMonths = Number.parseInt(warrantyMonthsValue, 10);
  const priceAmount = parsePriceAmount(priceValue, priceCurrency);
  const reminderDaysBefore = reminderEnabled ? Number.parseInt(reminderDaysBeforeValue, 10) : null;

  if (!name || !retailer) {
    throw new Error("Naziv proizvoda i prodavnica su obavezni.");
  }

  if (priceCurrency !== "RSD" && priceCurrency !== "EUR") {
    throw new Error("Izaberi podrzanu valutu.");
  }

  if (!purchaseDate) {
    throw new Error("Datum kupovine je obavezan.");
  }

  if (!Number.isInteger(warrantyMonths) || warrantyMonths <= 0) {
    throw new Error("Trajanje garancije mora biti najmanje 1 mesec.");
  }

  if (!priceAmount || priceAmount.lte(0)) {
    throw new Error("Cena mora biti veca od nule.");
  }

  const receiptFile = readReceiptFile(formData);
  const productImageFile = readProductImageFile(formData);

  validateImageFile(receiptFile, "Slika racuna");
  validateImageFile(productImageFile, "Slika proizvoda");

  if (reminderEnabled && ![7, 14, 30].includes(reminderDaysBefore ?? 0)) {
    throw new Error("Izaberi kada zelis podsetnik pre isteka garancije.");
  }

  return {
    name,
    retailer,
    priceAmount,
    priceCurrency,
    priceCents: toLegacyPriceCents(priceAmount, priceCurrency),
    purchaseDate,
    warrantyMonths,
    expiryDate: calculateExpiryDate(purchaseDate, warrantyMonths),
    notes: notes || null,
    receiptFile,
    productImageFile,
    removeReceipt,
    removeProductImage,
    reminderEnabled,
    reminderDaysBefore
  };
}

export async function createItemAction(formData: FormData) {
  const returnTo = readTextField(formData, "returnTo") || "/items/new";

  let payload: ParsedItemPayload;
  try {
    payload = parseItemFormData(formData);
  } catch (error) {
    redirectWithError(returnTo, error instanceof Error ? error.message : "Cuvanje nije uspelo.");
  }

  const receiptImagePath = payload.receiptFile ? await saveReceiptUpload(payload.receiptFile) : null;
  const productImage = payload.productImageFile ? await saveProductImageUpload(payload.productImageFile) : null;

  console.info("[Warranty Tracker] Creating product", {
    name: payload.name,
    receiptImagePath,
    productImage,
    priceCurrency: payload.priceCurrency,
    reminderEnabled: payload.reminderEnabled,
    reminderDaysBefore: payload.reminderDaysBefore
  });

  const item = await prisma.product.create({
    data: {
      name: payload.name,
      retailer: payload.retailer,
      priceAmount: payload.priceAmount,
      priceCurrency: payload.priceCurrency,
      priceCents: payload.priceCents,
      purchaseDate: payload.purchaseDate,
      warrantyMonths: payload.warrantyMonths,
      expiryDate: payload.expiryDate,
      notes: payload.notes,
      receiptImagePath,
      productImage,
      reminderEnabled: payload.reminderEnabled,
      reminderDaysBefore: payload.reminderDaysBefore,
      lastReminderSentAt: null
    }
  });

  revalidatePath("/");
  revalidatePath("/profile");
  console.info("[Warranty Tracker] Product created", {
    id: item.id,
    productImage: item.productImage,
    receiptImagePath: item.receiptImagePath
  });
  redirect(`/items/${item.id}`);
}

export async function updateItemAction(itemId: string, formData: FormData) {
  const returnTo = readTextField(formData, "returnTo") || `/items/${itemId}/edit`;
  const existingItem = await prisma.product.findUnique({
    where: { id: itemId }
  });

  if (!existingItem) {
    redirect("/");
  }

  let payload: ParsedItemPayload;
  try {
    payload = parseItemFormData(formData);
  } catch (error) {
    redirectWithError(returnTo, error instanceof Error ? error.message : "Izmena nije uspela.");
  }

  let receiptImagePath = existingItem.receiptImagePath;
  let productImage = existingItem.productImage ?? existingItem.productImageUrl;

  if (payload.receiptFile) {
    receiptImagePath = await saveReceiptUpload(payload.receiptFile);
    await deleteReceiptFile(existingItem.receiptImagePath);
  } else if (payload.removeReceipt) {
    await deleteReceiptFile(existingItem.receiptImagePath);
    receiptImagePath = null;
  }

  if (payload.productImageFile) {
    productImage = await saveProductImageUpload(payload.productImageFile);
    await deleteProductImageFile(existingItem.productImage);
  } else if (payload.removeProductImage) {
    await deleteProductImageFile(existingItem.productImage);
    productImage = null;
  }

  const reminderConfigChanged =
    existingItem.reminderEnabled !== payload.reminderEnabled ||
    existingItem.reminderDaysBefore !== payload.reminderDaysBefore ||
    existingItem.expiryDate.getTime() !== payload.expiryDate.getTime();

  console.info("[Warranty Tracker] Updating product", {
    id: itemId,
    receiptImagePath,
    productImage,
    priceCurrency: payload.priceCurrency,
    reminderEnabled: payload.reminderEnabled,
    reminderDaysBefore: payload.reminderDaysBefore
  });

  await prisma.product.update({
    where: { id: itemId },
    data: {
      name: payload.name,
      retailer: payload.retailer,
      priceAmount: payload.priceAmount,
      priceCurrency: payload.priceCurrency,
      priceCents: payload.priceCents,
      purchaseDate: payload.purchaseDate,
      warrantyMonths: payload.warrantyMonths,
      expiryDate: payload.expiryDate,
      notes: payload.notes,
      receiptImagePath,
      productImage,
      reminderEnabled: payload.reminderEnabled,
      reminderDaysBefore: payload.reminderDaysBefore,
      lastReminderSentAt: reminderConfigChanged ? null : existingItem.lastReminderSentAt
    }
  });

  revalidatePath("/");
  revalidatePath(`/items/${itemId}`);
  revalidatePath("/profile");
  console.info("[Warranty Tracker] Product updated", {
    id: itemId,
    productImage,
    receiptImagePath
  });
  redirect(`/items/${itemId}`);
}

export async function updateProfileAction(formData: FormData) {
  const returnTo = "/profile";
  const user = await getCurrentUser();
  const emailValue = readTextField(formData, "email").toLowerCase();
  const wantsEmailReminders = formData.get("wantsEmailReminders") === "on";
  const email = emailValue || null;

  if (wantsEmailReminders && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    redirectWithError(returnTo, "Unesi ispravnu email adresu da bi email podsetnici radili.");
  }

  await prisma.userProfile.update({
    where: { id: user.id },
    data: {
      email,
      wantsEmailReminders
    }
  });

  revalidatePath("/profile");
  redirect(appendQuery(returnTo, "saved", "profile"));
}

export async function triggerReminderCheckAction() {
  const result = await runEmailReminderCheck("manual");

  revalidatePath("/");
  revalidatePath("/profile");

  let target = appendQuery("/profile", "reminderRun", "1");
  target = appendQuery(target, "sent", String(result.sent));
  target = appendQuery(target, "eligible", String(result.eligible));
  target = appendQuery(target, "mode", result.mode);

  redirect(target);
}

export async function deleteItemAction(itemId: string) {
  const existingItem = await prisma.product.findUnique({
    where: { id: itemId }
  });

  if (!existingItem) {
    redirect("/");
  }

  await deleteReceiptFile(existingItem.receiptImagePath);
  await deleteProductImageFile(existingItem.productImage);
  await prisma.product.delete({
    where: { id: itemId }
  });

  revalidatePath("/");
  revalidatePath("/profile");
  redirect("/");
}

export async function openProFeatureAction(feature: string, source: string) {
  if (!isProFeatureSlug(feature)) {
    redirect("/");
  }

  await trackEvent({
    name: "pro_click",
    feature,
    source,
    payload: {
      featureTitle: PRO_FEATURES[feature].title
    }
  });

  redirect(`/pro/${feature}`);
}

export async function registerLaunchInterestAction(feature: ProFeatureSlug, formData: FormData) {
  const returnTo = readTextField(formData, "returnTo") || `/pro/${feature}`;
  const email = readTextField(formData, "email").toLowerCase();
  const source = readTextField(formData, "source") || `coming_soon_${feature}`;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirectWithError(returnTo, "Unesi ispravnu email adresu.");
  }

  await prisma.launchInterest.upsert({
    where: {
      email_feature: {
        email,
        feature
      }
    },
    create: {
      email,
      feature
    },
    update: {}
  });

  await trackEvent({
    name: "notify_me_click",
    feature,
    email,
    source
  });

  redirect(appendQuery(returnTo, "saved", "1"));
}

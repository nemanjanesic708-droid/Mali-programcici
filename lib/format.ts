export type SupportedCurrency = "RSD" | "EUR";

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number.parseFloat(value);
  }

  if (value && typeof value === "object") {
    if ("toNumber" in value && typeof value.toNumber === "function") {
      return value.toNumber();
    }

    if ("toString" in value && typeof value.toString === "function") {
      return Number.parseFloat(value.toString());
    }
  }

  return Number.NaN;
}

export function formatMoney(amount: unknown, currency: SupportedCurrency) {
  const numeric = toNumber(amount);

  if (!Number.isFinite(numeric)) {
    return "Nije dostupno";
  }

  const hasFraction = Math.round(numeric * 100) % 100 !== 0;
  const fractionDigits = currency === "RSD" ? 0 : hasFraction ? 2 : 0;

  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: currency === "RSD" ? 0 : 2
  }).format(numeric);
}

export function formatCurrency(priceCents: number) {
  return formatMoney(priceCents / 100, "EUR");
}

export function formatPriceInput(amount: unknown, currency: SupportedCurrency) {
  const numeric = toNumber(amount);

  if (!Number.isFinite(numeric)) {
    return "";
  }

  return currency === "RSD" ? String(Math.round(numeric)) : numeric.toFixed(2);
}

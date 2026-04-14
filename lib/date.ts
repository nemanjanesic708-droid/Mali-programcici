import {
  addMonths,
  differenceInCalendarDays,
  format,
  isValid,
  startOfDay
} from "date-fns";

export type WarrantyStatus = "active" | "expiringSoon" | "expired";

export type ReminderInfo = {
  reminderDate: Date | null;
  isReminderActive: boolean;
  isReminderDueToday: boolean;
  daysUntilReminder: number | null;
};

export function calculateExpiryDate(purchaseDate: Date, warrantyMonths: number) {
  return startOfDay(addMonths(purchaseDate, warrantyMonths));
}

export function parseDateInput(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  if (!isValid(parsed)) {
    return null;
  }

  return startOfDay(parsed);
}

export function formatDateInput(date: Date | string) {
  return format(typeof date === "string" ? new Date(date) : date, "yyyy-MM-dd");
}

export function formatDisplayDate(date: Date | string) {
  return format(typeof date === "string" ? new Date(date) : date, "d MMM yyyy");
}

export function getWarrantyStatus(expiryDate: Date | string, referenceDate = new Date()): WarrantyStatus {
  const expiry = startOfDay(typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate);
  const today = startOfDay(referenceDate);
  const daysUntilExpiry = differenceInCalendarDays(expiry, today);

  if (daysUntilExpiry < 0) {
    return "expired";
  }

  if (daysUntilExpiry <= 30) {
    return "expiringSoon";
  }

  return "active";
}

export function getDaysUntilExpiry(expiryDate: Date | string, referenceDate = new Date()) {
  const expiry = startOfDay(typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate);
  const today = startOfDay(referenceDate);
  return differenceInCalendarDays(expiry, today);
}

export function getReminderInfo(
  expiryDate: Date | string,
  reminderEnabled: boolean,
  reminderDaysBefore: number | null | undefined,
  referenceDate = new Date()
): ReminderInfo {
  if (!reminderEnabled || !reminderDaysBefore) {
    return {
      reminderDate: null,
      isReminderActive: false,
      isReminderDueToday: false,
      daysUntilReminder: null
    };
  }

  const expiry = startOfDay(typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate);
  const today = startOfDay(referenceDate);
  const reminderDate = startOfDay(new Date(expiry));
  reminderDate.setDate(reminderDate.getDate() - reminderDaysBefore);

  const daysUntilExpiry = differenceInCalendarDays(expiry, today);
  const daysUntilReminder = differenceInCalendarDays(reminderDate, today);
  const isReminderActive = daysUntilExpiry >= 0 && daysUntilExpiry <= reminderDaysBefore;

  return {
    reminderDate,
    isReminderActive,
    isReminderDueToday: isReminderActive && daysUntilReminder === 0,
    daysUntilReminder
  };
}

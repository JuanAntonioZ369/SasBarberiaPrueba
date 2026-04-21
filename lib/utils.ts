import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy", { locale: es });
}

export function getCurrentWeekRange() {
  const now = new Date();
  return {
    start: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
    end: format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
  };
}

export function getCurrentMonthRange() {
  const now = new Date();
  return {
    start: format(startOfMonth(now), "yyyy-MM-dd"),
    end: format(endOfMonth(now), "yyyy-MM-dd"),
  };
}

export function today(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function isUpcomingBirthday(birthday: string, daysAhead = 7): boolean {
  if (!birthday) return false;
  const todayDate = new Date();
  const bd = new Date(birthday);
  const next = new Date(todayDate.getFullYear(), bd.getMonth(), bd.getDate());
  if (next < todayDate) next.setFullYear(todayDate.getFullYear() + 1);
  const diff = (next.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= daysAhead;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert English digits to Persian digits
export function toPersianDigits(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w]);
}

// Format currency in Tomans
export function formatTomans(amount: number): string {
  if (amount === 0) return 'رایگان';
  return toPersianDigits(amount.toLocaleString('fa-IR')) + ' تومان';
}

// Pre-defined Iranian Events for the Content Calendar
export const IRANIAN_EVENTS = [
  { day: 5, month: "آذر", title: "روز پژوهش و فناوری", type: "tech" },
  { day: 10, month: "آذر", title: "روز مجلس و قانون‌گذاری", type: "national" },
  { day: 16, month: "آذر", title: "روز دانشجو (مناسبت عالی برای تخفیف‌های آموزشی)", type: "marketing" },
  { day: 25, month: "آذر", title: "روز پژوهش", type: "tech" },
  { day: 30, month: "آذر", title: "شب یلدا (پیک فروش و کمپین‌های مارکتینگ)", type: "hot" },
];

// Get current date in Persian (Shamsi)
export function getTodayShamsi(): string {
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return 'امروز';
  }
}

// Get current Tehran time (HH:mm)
export function getCurrentTehranTime(): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      timeZone: 'Asia/Tehran',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    return 'هم‌اکنون';
  }
}

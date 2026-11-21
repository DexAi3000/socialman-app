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

// Convert Persian digits to English digits
export function toEnglishDigits(str: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let res = String(str);
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(persianDigits[i], String(i));
  }
  return res;
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

export interface ShamsiDetails {
  year: number;
  month: number;
  day: number;
  monthName: string;
  weekday: string;
  weekdayIndex: number; // 0: شنبه, 1: یکشنبه, ..., 6: جمعه
  daysInMonth: number;
  startWeekdayIndex: number;
  formatted: string; // e.g. "۱۴۰۵/۰۹/۰۱"
  formattedEn: string; // e.g. "1405/09/01"
  timeFormatted: string; // e.g. "۱۹:۰۰"
  fullTitle: string; // e.g. "آذر ۱۴۰۵"
  fullDateWithWeekday: string; // e.g. "یکشنبه ۱ آذر ۱۴۰۵"
}

export function getShamsiToday(date = new Date()): ShamsiDetails {
  try {
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-persian', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = Object.fromEntries(
      formatter.formatToParts(date).map((p) => [p.type, p.value])
    );

    const monthNames = [
      'فروردین',
      'اردیبهشت',
      'خرداد',
      'تیر',
      'مرداد',
      'شهریور',
      'مهر',
      'آبان',
      'آذر',
      'دی',
      'بهمن',
      'اسفند',
    ];

    const weekdayMap: Record<string, { fa: string; index: number }> = {
      Saturday: { fa: 'شنبه', index: 0 },
      Sunday: { fa: 'یکشنبه', index: 1 },
      Monday: { fa: 'دوشنبه', index: 2 },
      Tuesday: { fa: 'سه‌شنبه', index: 3 },
      Wednesday: { fa: 'چهارشنبه', index: 4 },
      Thursday: { fa: 'پنج‌شنبه', index: 5 },
      Friday: { fa: 'جمعه', index: 6 },
    };

    const year = parseInt(parts.year, 10);
    const month = parseInt(parts.month, 10);
    const day = parseInt(parts.day, 10);
    const monthName = monthNames[month - 1] || 'آذر';
    const wdInfo = weekdayMap[parts.weekday] || { fa: 'شنبه', index: 0 };

    let daysInMonth = 30;
    if (month <= 6) daysInMonth = 31;
    else if (month <= 11) daysInMonth = 30;
    else daysInMonth = 29;

    let startWeekdayIndex = (wdInfo.index - (day - 1)) % 7;
    if (startWeekdayIndex < 0) startWeekdayIndex += 7;

    const mStr = String(month).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const hour = parts.hour || '12';
    const minute = parts.minute || '00';

    return {
      year,
      month,
      day,
      monthName,
      weekday: wdInfo.fa,
      weekdayIndex: wdInfo.index,
      daysInMonth,
      startWeekdayIndex,
      formatted: `${toPersianDigits(year)}/${toPersianDigits(mStr)}/${toPersianDigits(dStr)}`,
      formattedEn: `${year}/${mStr}/${dStr}`,
      timeFormatted: `${toPersianDigits(hour)}:${toPersianDigits(minute)}`,
      fullTitle: `${monthName} ${toPersianDigits(year)}`,
      fullDateWithWeekday: `${wdInfo.fa} ${toPersianDigits(day)} ${monthName} ${toPersianDigits(year)}`,
    };
  } catch {
    return {
      year: 1405,
      month: 9,
      day: 1,
      monthName: 'آذر',
      weekday: 'یکشنبه',
      weekdayIndex: 1,
      daysInMonth: 30,
      startWeekdayIndex: 1,
      formatted: '۱۴۰۵/۰۹/۰۱',
      formattedEn: '1405/09/01',
      timeFormatted: '۱۲:۰۰',
      fullTitle: 'آذر ۱۴۰۵',
      fullDateWithWeekday: 'یکشنبه ۱ آذر ۱۴۰۵',
    };
  }
}

// Get current date in Persian (Shamsi) string
export function getTodayShamsi(): string {
  return getShamsiToday().formatted;
}

// Get current Tehran time (HH:mm)
export function getCurrentTehranTime(): string {
  return getShamsiToday().timeFormatted;
}

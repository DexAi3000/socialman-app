"use client";

import { CalendarDays, Link2, Plus } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

interface SnappHeroProps {
  workspaceName: string;
  dateLabel: string;
  connectedChannels: number;
  postCount: number;
  onOpenPublish: () => void;
  onOpenCalendar: () => void;
  onConnect: () => void;
}

export function SnappHero({
  workspaceName,
  dateLabel,
  connectedChannels,
  postCount,
  onOpenPublish,
  onOpenCalendar,
  onConnect,
}: SnappHeroProps) {
  return (
    <section aria-labelledby="dashboard-title" className="grid items-center gap-5 rounded-[1.65rem] bg-gradient-to-bl from-[#143b5c] via-[#102943] to-[#101e35] p-5 text-white sm:gap-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.6fr)] lg:px-10">
      <div className="min-w-0">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-sky-100 sm:text-sm">
          <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
          {dateLabel}
        </p>
        <h1 id="dashboard-title" className="text-[clamp(1.65rem,4vw,2.6rem)] leading-[1.4] font-black">
          میز کار محتوا
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-7 text-slate-200 sm:text-base">
          پست‌هایت را آماده کن، برای انتشار زمان بگذار و کانال‌هایت را از همین‌جا مدیریت کن.
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-5">
          <button type="button" onClick={onOpenPublish} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-sky-200 px-4 text-sm font-black text-slate-950 transition-colors hover:bg-white">
            <Plus aria-hidden="true" className="size-[18px]" />
            ساخت پست
          </button>
          <button type="button" onClick={onOpenCalendar} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-white/25 px-4 text-sm font-bold text-white transition-colors hover:bg-white/10">
            <CalendarDays aria-hidden="true" className="size-4" />
            تقویم محتوا
          </button>
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-white/15 bg-white/8 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="text-xs font-medium text-slate-300">فضای کاری</span>
          <span className="min-w-0 break-words text-sm font-bold text-white">{workspaceName}</span>
        </div>
        <dl className="my-3 grid grid-cols-2 divide-x divide-x-reverse divide-white/15 rounded-xl bg-slate-950/25 p-3">
          <div className="ps-1 pe-2">
            <dt className="text-xs leading-5 text-slate-300">کانال متصل</dt>
            <dd className="text-lg font-black text-white">{toPersianDigits(connectedChannels)} <span className="text-xs font-medium text-slate-300">از ۵</span></dd>
          </div>
          <div className="ps-3">
            <dt className="text-xs leading-5 text-slate-300">پست در فضای کاری</dt>
            <dd className="text-lg font-black text-white">{toPersianDigits(postCount)}</dd>
          </div>
        </dl>
        <button type="button" onClick={onConnect} className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/10 px-3 text-sm font-bold text-white transition-colors hover:bg-white/20">
          <Link2 aria-hidden="true" className="size-4 shrink-0" />
          {connectedChannels === 0 ? 'اتصال اولین کانال' : 'مدیریت کانال‌ها'}
        </button>
      </div>
    </section>
  );
}

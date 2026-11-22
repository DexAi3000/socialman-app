"use client";

import { ArrowLeft, CalendarDays, CheckCircle2, Rocket } from 'lucide-react';
import { getShamsiToday } from '@/lib/utils';

interface HomeIntroProps {
  onOpenPublish: () => void;
  onOpenCalendar: () => void;
}

export function HomeIntro({ onOpenPublish, onOpenCalendar }: HomeIntroProps) {
  return (
    <section aria-labelledby="home-intro-title" className="border-b border-slate-100 bg-white">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-5 px-3.5 py-6 sm:px-6 sm:py-10 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-12">
        <div className="min-w-0 space-y-4 sm:space-y-5 lg:col-span-7">
          <p className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800">
            یک اپلیکیشن، برای تمام کانال‌های ارتباطی شما
          </p>
          <h1 id="home-intro-title" className="text-[clamp(1.5rem,3.3vw,2.5rem)] leading-[1.45] font-black text-slate-900">
            مدیریت، زمان‌بندی و انتشار <span className="text-[#2d8abc]">یکپارچه</span> در{' '}
            <span className="text-[#2d8abc]">۵ پلتفرم</span> با سوشال من!
          </h1>
          <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            محتوا را یک‌بار آماده کنید و همزمان با یک کلیک در اینستاگرام، تلگرام، واتساپ، روبیکا و بله منتشر یا در تقویم شمسی زمان‌بندی کنید.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-2 sm:pt-3">
            <button type="button" onClick={onOpenPublish} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl bg-[#267bad] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-800/15 transition-colors hover:bg-sky-800 sm:px-5">
              <Rocket aria-hidden="true" className="size-4 shrink-0" />
              انتشار پست در ۵ پلتفرم
              <ArrowLeft aria-hidden="true" className="ms-1 size-4 shrink-0" />
            </button>
            <button type="button" onClick={onOpenCalendar} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-xs transition-colors hover:bg-sky-50 sm:px-5">
              <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-sky-700" />
              مشاهده تقویم محتوایی {getShamsiToday().monthName}
            </button>
          </div>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs font-semibold text-slate-600 sm:pt-2">
            <li className="flex items-center gap-1.5"><CheckCircle2 aria-hidden="true" className="size-4 text-sky-700" /> بدون نیاز به فیلترشکن</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 aria-hidden="true" className="size-4 text-sky-700" /> پشتیبانی از زبان فارسی</li>
          </ul>
        </div>
        <div className="mx-auto w-full max-w-[320px] lg:col-span-5 lg:max-w-[460px]">
          <img
            src="/socialman/hero-character.png"
            alt=""
            fetchPriority="high"
            className="aspect-square w-full object-contain drop-shadow-[0_15px_30px_rgba(33,170,88,0.18)]"
          />
        </div>
      </div>
    </section>
  );
}

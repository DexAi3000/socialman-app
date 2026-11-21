"use client";

import React from 'react';
import { Sparkles, Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface SnappHeroProps {
  onOpenPublish: () => void;
  onOpenCalendar: () => void;
}

export function SnappHero({ onOpenPublish, onOpenCalendar }: SnappHeroProps) {
  return (
    <section className="relative overflow-hidden py-6 sm:py-12 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Right Column: Snapp Big Title & Buttons (7 cols) */}
        <div className="lg:col-span-7 space-y-5 text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#3b96cc] text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-[#3b96cc] animate-ping" />
            <span>یک اپلیکیشن، برای تمام کانال‌های ارتباطی شما</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-black text-[#212121] leading-[1.35] tracking-tight">
            مدیریت، زمان‌بندی و انتشار <span className="text-[#3b96cc]">یکپارچه</span> در{' '}
            <span className="text-[#3b96cc]">۵ پلتفرم</span> با سوشال من!
          </h1>

          <p className="text-sm sm:text-base text-[#616161] font-medium leading-relaxed max-w-xl">
            محتوا را یک‌بار آماده کنید و همزمان با ۱ کلیک در اینستاگرام، تلگرام، واتساپ، روبیکا و بله منتشر یا در تقویم شمسی زمان‌بندی نمایید.
          </p>

          {/* Snapp Action Buttons from Screenshot */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            {/* Primary Green Button: Publish Post */}
            <button
              onClick={onOpenPublish}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-lg shadow-[#3b96cc]/30 transition-transform active:scale-95"
            >
              <span>انتشار پست در ۵ پلتفرم 🚀</span>
              <ArrowLeft className="w-4 h-4 mr-1" />
            </button>

            {/* Secondary Outline Button (like "دانلود برنامه") */}
            <button
              onClick={onOpenCalendar}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-black text-[#212121] bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-xs"
            >
              <Calendar className="w-4 h-4 text-[#3b96cc]" />
              <span>مشاهده تقویم محتوایی آذر</span>
            </button>
          </div>

          {/* Social Proof Badges */}
          <div className="flex items-center gap-5 pt-3 text-xs text-gray-500 font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#3b96cc]" />
              بدون نیاز به فیلترشکن
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#3b96cc]" />
              پشتیبانی از زبان فارسی
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#3b96cc]" />
              درگاه رسمی شاپرک
            </span>
          </div>
        </div>

        {/* Left Column: Seamless 3D Character Illustration (Part of Background) */}
        <div className="lg:col-span-5 flex justify-center relative select-none">
          <div className="relative w-80 sm:w-[460px] h-80 sm:h-[460px] flex items-center justify-center group">
            {/* Ambient soft glow aura */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-[#3b96cc]/15 via-sky-100/30 to-transparent blur-3xl -z-10" />

            {/* 3D Hero Character (Transparent Isolated PNG) */}
            <img
              src="/hero-character.png"
              alt="سوشال‌من دستیار هوشمند محتوا"
              className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(33,170,88,0.18)] group-hover:scale-105 transition-transform duration-500 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

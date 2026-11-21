"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  Crown,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  X,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { PlanType } from '@/types';
import { toPersianDigits } from '@/lib/utils';

export function UpgradeModal() {
  const {
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    selectedPlanForUpgrade,
    currentUser,
  } = useApp();

  const [copiedCard, setCopiedCard] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const targetPlan: PlanType = selectedPlanForUpgrade || 'pro';

  const planInfo = {
    free: { name: 'برنز (رایگان)', price: '۰ تومان', priceNum: 0, desc: 'امکانات پایه' },
    pro: { name: 'نقره‌ای (حرفه‌ای)', price: '۱۸۹٬۰۰۰ تومان', priceNum: 189000, desc: 'تولید نامحدود هوش مصنوعی برای ۵ پلتفرم' },
    agency: { name: 'طلایی (آژانس و تیم)', price: '۵۸۰٬۰۰۰ تومان', priceNum: 580000, desc: 'برندهای نامحدود، هوش مصنوعی پیشرفته GPT-4o و اعضای تیم' },
  }[targetPlan];

  const cardNumber = '6104331068945139';
  const cardHolder = 'نیما آرین‌فر';

  const handleCopyCard = async () => {
    let success = false;

    // 1. Try modern Clipboard API if supported and in secure context
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(cardNumber);
        success = true;
      } catch (_) {}
    }

    // 2. Fallback via temporary textarea for non-secure HTTP and mobile WebViews
    if (!success && typeof document !== 'undefined') {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = cardNumber;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
    }

    // Visual feedback
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2500);
  };

  const telegramBotUrl = `https://t.me/NovexaAiSupportbot?start=receipt`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none animate-in fade-in duration-200">
      <div className="relative bg-white border border-gray-100 rounded-3xl p-5 sm:p-7 w-full max-w-md shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setIsUpgradeModalOpen(false)}
          className="absolute top-4 left-4 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs">
            <Crown className="w-6 h-6" />
          </div>
          <div className="text-right">
            <h3 className="text-base font-black text-gray-900">ارتقای اشتراک سوشال من</h3>
            <p className="text-xs text-gray-500 font-medium">روش پرداخت: انتقال کارت به کارت شتاب</p>
          </div>
        </div>

        {/* Plan Summary Box */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-right">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">پلن انتخابی:</span>
            <span className="font-black text-gray-900">{planInfo.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">دوره اشتراک:</span>
            <span className="text-gray-700 font-medium">۱ ماهه (۳۰ روزه)</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200">
            <span className="text-gray-700 font-black">مبلغ قابل پرداخت:</span>
            <span className="font-black text-[#3b96cc] text-base font-mono">
              {planInfo.price}
            </span>
          </div>
        </div>

        {/* Bank Card Details Box (Bank Mellat Style Matching Image 2) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#ef5992] via-[#e63f7e] to-[#d6286a] text-gray-900 space-y-3.5 shadow-xl shadow-pink-500/20 relative overflow-hidden border border-pink-300/40">
          {/* Card Top Row: 'کارت پیش فرض' Badge + 'بانک ملت' with Official Mellat Emblem */}
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-white/30 backdrop-blur-xs border border-white/40 text-white text-[10px] font-bold">
              کارت پیش فرض
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-gray-900">بانک ملت</span>
              {/* Bank Mellat Emblem */}
              <div className="w-6 h-6 rounded-lg bg-white/20 p-0.5 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#b91c1c]" viewBox="0 0 100 100" fill="none">
                  <path
                    d="M50 15 L78 31 L78 63 L50 79 L22 63 L22 31 Z"
                    stroke="#a81c24"
                    strokeWidth="8"
                    fill="#c52229"
                  />
                  <circle cx="50" cy="47" r="13" fill="#eab308" stroke="#a81c24" strokeWidth="4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card Number Row: Left-to-Right LTR Display (۶۱۰۴ - ۳۳۱۰ - ۶۸۹۴ - ۵۱۳۹) */}
          <div className="py-1 text-center">
            <div
              dir="ltr"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
              className="flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl font-black font-mono tracking-wider text-gray-900 select-all"
            >
              <span className="tabular-nums">۶۱۰۴</span>
              <span className="text-gray-700/60 font-sans">-</span>
              <span className="tabular-nums">۳۳۱۰</span>
              <span className="text-gray-700/60 font-sans">-</span>
              <span className="tabular-nums">۶۸۹۴</span>
              <span className="text-gray-700/60 font-sans">-</span>
              <span className="tabular-nums">۵۱۳۹</span>
            </div>
          </div>

          {/* Card Footer Row: Account Holder + Copy Button */}
          <div className="flex items-center justify-between text-xs pt-2.5 border-t border-black/10">
            <span className="text-gray-800 text-[11px] font-medium">
              صاحب حساب: <strong className="text-gray-900 font-black">{cardHolder}</strong>
            </span>
            <button
              type="button"
              onClick={handleCopyCard}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer shadow-xs active:scale-95 ${
                copiedCard
                  ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                  : 'bg-white/85 hover:bg-white text-gray-900 border border-white/60'
              }`}
            >
              {copiedCard ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-700" />
              )}
              <span>{copiedCard ? 'کپی شد ✓' : 'کپی شماره کارت'}</span>
            </button>
          </div>
        </div>

        {/* Steps Guide */}
        <div className="space-y-2 text-right">
          <span className="text-xs font-black text-gray-800 block">مراحل فعال‌سازی خودکار:</span>
          <div className="text-[11px] text-gray-600 space-y-1.5 leading-relaxed bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100">
            <p>۱. مبلغ <strong>{planInfo.price}</strong> به شماره کارت بالا به نام نیما آرین فر واریز کنید.</p>
            <p>۲. بعد از طریق دکمه آبی رنگ ارسال رسید وارد روبات شوید.</p>
            <p>۳. روی گزینه اشتراکتون بزنید.</p>
            <p>۴. نام کاربری یا شماره تلفن ثبت نامی خودتون رو ارسال کنید.</p>
            <p>۵. سپس رسید خودتون رو ارسال کنید و بعد از چند دقیقه اشتراک برای شما فعال میشه.</p>
          </div>
        </div>

        {/* Action Button: Send Receipt in Telegram Bot */}
        <div className="pt-1 space-y-2">
          <a
            href={telegramBotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-md shadow-[#3b96cc]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>ارسال رسید</span>
          </a>

          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(false)}
            className="w-full py-2.5 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            انصراف و بازگشت
          </button>
        </div>

      </div>
    </div>
  );
}

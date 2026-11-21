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
  const formattedCard = '۶۱۰۴ - ۳۳۱۰ - ۶۸۹۴ - ۵۱۳۹';
  const cardHolder = 'نیما آرین‌فر';

  const handleCopyCard = () => {
    navigator.clipboard.writeText(cardNumber);
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

        {/* Bank Card Details Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-sky-400" />
              <span className="text-xs font-bold text-gray-300">کارت بانکی شتاب</span>
            </div>
            <span className="text-[11px] font-mono text-gray-400">بانک ملت</span>
          </div>

          <div className="py-1 text-center">
            <div className="font-mono text-lg sm:text-xl font-black tracking-widest text-sky-300 dir-ltr select-all">
              {formattedCard}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
            <span className="text-gray-400">صاحب حساب: <strong className="text-white font-bold">{cardHolder}</strong></span>
            <button
              type="button"
              onClick={handleCopyCard}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all cursor-pointer"
            >
              {copiedCard ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
            <ExternalLink className="w-3.5 h-3.5" />
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

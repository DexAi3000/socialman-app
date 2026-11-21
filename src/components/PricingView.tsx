"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Crown, Check, Zap, ShieldCheck, Users, ArrowLeft } from 'lucide-react';
import { PlanType } from '@/types';

export function PricingView() {
  const { currentPlan, openUpgradeModal } = useApp();

  const plans = [
    {
      id: 'free' as PlanType,
      name: 'پلن برنز (رایگان)',
      priceFormatted: 'رایگان همیشگی',
      priceSubtitle: 'برای شروع و تست انتشار در پلتفرم‌ها',
      popular: false,
      buttonText: 'پلن فعلی شما',
      buttonDisabled: currentPlan === 'free',
      features: [
        '۱ برند / پیج اختصاصی',
        'اتصال ۲ پلتفرم همزمان',
        'تا ۱۰ پست زمان‌بندی‌شده در ماه',
        'تقویم محتوایی ماه جاری شمسی',
        'پیش‌نمایش زنده پست قبل از ارسال',
      ],
      notIncluded: [
        'تولید محتوا با هوش مصنوعی (ویژه پلن طلایی)',
        'اتصال کامل هر ۵ پلتفرم',
        'پورتال آنلاین تایید کارفرما',
        'انتشار نامحدود',
      ],
    },
    {
      id: 'pro' as PlanType,
      name: 'پلن نقره‌ای (انتشار نامحدود ۵ پلتفرم)',
      priceFormatted: '۱۸۹٬۰۰۰ تومان',
      priceSubtitle: 'ویژه ادمین‌ها و مدیران شبکه‌های اجتماعی',
      popular: true,
      buttonText: currentPlan === 'pro' ? 'پلن فعال شما' : 'ارتقا به پلن حرفه‌ای',
      buttonDisabled: currentPlan === 'pro',
      features: [
        'اتصال کامل هر ۵ پلتفرم (اینستاگرام، تلگرام، واتساپ، روبیکا، بله)',
        'انتشار و زمان‌بندی نامحدود پست‌ها',
        'تا ۵ برند و پیج کاری مجزا',
        'تقویم سالانه شمسی با رویدادهای ملی و پیک‌های فروش',
        'ویرایش و بهینه‌سازی فرمت جداگانه برای هر شبکه',
        'پشتیبانی سریع در تلگرام',
      ],
      notIncluded: [
        'تولید محتوا با هوش مصنوعی (ویژه پلن طلایی)',
        'پورتال آنلاین تایید کارفرما',
      ],
    },
    {
      id: 'agency' as PlanType,
      name: 'پلن طلایی (آژانس + هوش مصنوعی)',
      priceFormatted: '۵۸۰٬۰۰۰ تومان',
      priceSubtitle: 'پکیج کامل انتشار ۵ پلتفرم + تولید هوش مصنوعی',
      popular: false,
      buttonText: currentPlan === 'agency' ? 'پلن فعال شما' : 'فعال‌سازی پلن طلایی',
      buttonDisabled: currentPlan === 'agency',
      features: [
        'انتشار نامحدود در تمام ۵ پلتفرم بدون هیچ سقف ارسالی',
        '👑 دستیار نگارش و تولید محتوا با هوش مصنوعی Google Gemini',
        'تولید خودکار هوک‌های ویروسی، کپشن و هشتگ‌های پربازدید',
        'پورتال اختصاصی تایید آنلاین کارفرما با لینک امن',
        'برندها و پیج‌های کاری نامحدود',
        'تا ۵ عضو تیم و تعیین دسترسی',
        'پشتیبانی تلفنی اختصاصی و VIP',
      ],
      notIncluded: [],
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          تعرفه‌ها و پلن‌های اقتصادی متناسب با نیاز شما
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-slate-900">
          انتخاب پلن مناسب برای مدیریت ۵ شبکه اجتماعی
        </h1>
        <p className="text-xs text-slate-500 max-w-xl mx-auto">
          با درگاه مستقیم شاپرک / زرین‌پال، اشتراک خود را در کمتر از ۱ دقیقه فعال کنید و بدون محدودیت محتوا تولید کنید.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.id;
          return (
            <div
              key={p.id}
              className={`relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-all ${
                p.popular
                  ? 'bg-white border-2 border-[#00D166] shadow-xl shadow-emerald-500/10'
                  : 'bg-white border border-slate-200/90 shadow-xs'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 right-1/2 translate-x-1/2 bg-[#00D166] text-slate-950 text-[10px] font-black px-3 py-0.5 rounded-full shadow-sm">
                  محبوب‌ترین انتخاب ادمین‌ها 🔥
                </div>
              )}

              <div>
                {/* Plan Title & Price */}
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <h3 className="text-sm font-black text-slate-900 mb-1">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                      {p.priceFormatted}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{p.priceSubtitle}</p>
                </div>

                {/* Features list */}
                <div className="space-y-2.5 mb-5">
                  <span className="text-[11px] font-black text-slate-700 block">امکانات:</span>
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <div className="p-0.5 rounded-full bg-emerald-100 text-[#00A852] mt-0.5 shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}

                  {p.notIncluded.map((notFeat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-400 line-through">
                      <span className="text-slate-300">✕</span>
                      <span>{notFeat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  disabled={isCurrent}
                  onClick={() => openUpgradeModal(p.id)}
                  className={`w-full py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : p.popular
                      ? 'bg-[#00D166] hover:bg-[#00be5b] text-slate-950 shadow-md shadow-[#00D166]/20 active:scale-95'
                      : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                  }`}
                >
                  {isCurrent ? (
                    'پلن فعال شما'
                  ) : (
                    <>
                      <span>{p.buttonText}</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-center">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-[#00A852] mx-auto mb-1.5" />
          <h4 className="text-xs font-black text-slate-800 mb-0.5">پرداخت امن شاپرک</h4>
          <p className="text-[10px] text-slate-500">اتصال مستقیم به درگاه شتاب بانکی</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
          <h4 className="text-xs font-black text-slate-800 mb-0.5">فعال‌سازی آنی</h4>
          <p className="text-[10px] text-slate-500">ارتقای سهمیه بلافاصله بعد از تراکنش</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <Users className="w-5 h-5 text-indigo-500 mx-auto mb-1.5" />
          <h4 className="text-xs font-black text-slate-800 mb-0.5">پشتیبانی متعهد</h4>
          <p className="text-[10px] text-slate-500">همراهی در تلگرام، بله و تلفن</p>
        </div>
      </div>
    </div>
  );
}

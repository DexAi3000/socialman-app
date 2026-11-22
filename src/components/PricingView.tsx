"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CalendarClock, Crown, Check, Zap, ShieldCheck, Users, ArrowLeft } from 'lucide-react';
import { PlanType } from '@/types';
import { daysRemaining, EXPIRY_REMINDER_DAYS, formatSubscriptionDate, paidPlanNames } from '@/lib/subscription';
import { toPersianDigits } from '@/lib/utils';

export function PricingView() {
  const { currentPlan, currentUser, openUpgradeModal } = useApp();
  const subscription = currentUser?.subscription;
  const end = subscription?.expiresAt;
  const remaining = end ? daysRemaining(end) : null;
  const isExpired = remaining === 0;
  const needsReminder = remaining !== null && remaining <= EXPIRY_REMINDER_DAYS;
  const subscriptionName = subscription ? paidPlanNames[subscription.plan] : currentPlan === 'free' ? 'برنز (رایگان)' : paidPlanNames[currentPlan];

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
        'دستیار نگارش و تولید محتوا با هوش مصنوعی',
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
      <section aria-labelledby="subscription-period" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-800"><CalendarClock aria-hidden="true" className="size-5" /></span>
            <div>
              <h2 id="subscription-period" className="text-base font-black text-slate-900">زمان‌بندی اشتراک</h2>
              <p className="text-sm text-slate-600">پلن {subscriptionName}</p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${needsReminder ? 'bg-amber-50 text-amber-900' : 'bg-sky-50 text-sky-900'}`}>
            {isExpired ? 'پایان‌یافته' : 'فعال'}
          </span>
        </div>
        {end ? (
          <dl className="mt-3 grid gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm sm:grid-cols-3">
            <div className="flex flex-wrap justify-between gap-1.5 sm:block">
              <dt className="text-slate-600">شروع دوره</dt>
              <dd className="font-bold text-slate-900">{subscription?.startedAt ? formatSubscriptionDate(subscription.startedAt) : 'ثبت نشده'}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-1.5 sm:block">
              <dt className="text-slate-600">پایان دوره</dt>
              <dd className="font-bold text-slate-900">{formatSubscriptionDate(end)}</dd>
            </div>
            <div className="flex flex-wrap justify-between gap-1.5 sm:block">
              <dt className="text-slate-600">زمان باقی‌مانده</dt>
              <dd className="font-bold text-slate-900">{toPersianDigits(remaining ?? 0)} روز</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {currentPlan === 'free' ? 'اشتراک رایگان تاریخ پایان ندارد.' : 'تاریخ شروع و پایان برای این اشتراک ثبت نشده است.'}
          </p>
        )}
        {isExpired && (
          <button type="button" onClick={() => openUpgradeModal(subscription?.plan ?? 'pro')} className="mt-3 min-h-11 cursor-pointer rounded-xl bg-sky-800 px-4 text-sm font-bold text-white hover:bg-sky-900">
            فعال‌سازی دوباره
          </button>
        )}
      </section>

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
                  ? 'bg-white border-2 border-[#3b96cc] shadow-xl shadow-[#3b96cc]/10'
                  : 'bg-white border border-slate-200/90 shadow-xs'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 right-1/2 translate-x-1/2 bg-gradient-to-r from-sky-500 to-[#3b96cc] text-white text-xs font-black px-4 py-1 rounded-full shadow-md whitespace-nowrap border border-white/80 tracking-wide">
                  محبوب ترین
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
                      <div className="p-0.5 rounded-full bg-sky-100 text-[#3b96cc] mt-0.5 shrink-0">
                        <Check className="w-3 h-3 stroke-[2.5]" />
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

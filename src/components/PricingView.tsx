"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CalendarClock, Crown, Check, Zap, Users, ArrowLeft } from 'lucide-react';
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

  const getPlanAction = (planId: PlanType) => {
    // ۱. پلن فعال فقط روی همان پلنی که هست
    if (currentPlan === planId) {
      return {
        show: true,
        text: 'پلن فعال شما',
        isCurrent: true,
      };
    }

    // ۲. اگر کسی پلن رایگان (برنزی) داشت: برای دوتای دیگه بزنه خرید پلن نقره‌ای و خرید پلن طلایی
    if (currentPlan === 'free') {
      if (planId === 'pro') {
        return {
          show: true,
          text: 'خرید پلن نقره‌ای',
          isCurrent: false,
        };
      }
      if (planId === 'agency') {
        return {
          show: true,
          text: 'خرید پلن طلایی',
          isCurrent: false,
        };
      }
    }

    // ۳. اگر کسی پلن نقره داشت: برای پلن طلایی بزنه ارتقا به پلن طلایی، برای برنزی هیچی نزنه
    if (currentPlan === 'pro') {
      if (planId === 'free') {
        return {
          show: false,
          text: '',
          isCurrent: false,
        };
      }
      if (planId === 'agency') {
        return {
          show: true,
          text: 'ارتقا به پلن طلایی',
          isCurrent: false,
        };
      }
    }

    // ۴. اگر هم کسی پلن طلایی داشت: برای بقیه هیچی نزنه
    if (currentPlan === 'agency') {
      return {
        show: false,
        text: '',
        isCurrent: false,
      };
    }

    return {
      show: false,
      text: '',
      isCurrent: false,
    };
  };

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
          <>
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
                <dd className="font-black text-[#3b96cc]">{toPersianDigits(remaining ?? 0)} روز</dd>
              </div>
            </dl>

            {remaining !== null && (
              <div className="mt-3 space-y-1">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${remaining <= 1 ? 'bg-rose-500 animate-pulse' : 'bg-[#3b96cc]'}`}
                    style={{ width: `${Math.min(100, Math.max(4, (remaining / 30) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                  <span>{toPersianDigits(remaining)} روز مانده از دوره ۳۰ روزه</span>
                  <span>{toPersianDigits(Math.round((remaining / 30) * 100))}٪ باقی‌مانده</span>
                </div>
              </div>
            )}

            {remaining !== null && remaining <= 1 && !isExpired && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping shrink-0" />
                <span>⚠️ تنها ۱ روز تا پایان دوره اشتراک شما باقی مانده است. جهت عدم قطعی سرویس انتشار خودکار، لطفاً اشتراک خود را تمدید کنید.</span>
              </div>
            )}
          </>
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
          اشتراک مورد نظر خود را انتخاب کنید و بدون محدودیت در شبکه‌های اجتماعی محتوا تولید و منتشر کنید.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {plans.map((p) => {
          const action = getPlanAction(p.id);
          const isCurrent = action.isCurrent;

          return (
            <div
              key={p.id}
              className={`relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-all ${
                isCurrent
                  ? 'bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                  : p.popular
                  ? 'bg-white border-2 border-[#3b96cc] shadow-xl shadow-[#3b96cc]/10'
                  : 'bg-white border border-slate-200/90 shadow-xs'
              }`}
            >
              {isCurrent ? (
                <div className="absolute -top-3 right-1/2 translate-x-1/2 bg-emerald-600 text-white text-xs font-black px-4 py-1 rounded-full shadow-md whitespace-nowrap border border-white/80 tracking-wide flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>پلن فعال شما</span>
                </div>
              ) : p.popular ? (
                <div className="absolute -top-3 right-1/2 translate-x-1/2 bg-gradient-to-r from-sky-500 to-[#3b96cc] text-white text-xs font-black px-4 py-1 rounded-full shadow-md whitespace-nowrap border border-white/80 tracking-wide">
                  محبوب ترین
                </div>
              ) : null}

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
              <div className="pt-3 border-t border-slate-100 min-h-[58px] flex items-center">
                {action.show ? (
                  <button
                    disabled={action.isCurrent}
                    onClick={() => openUpgradeModal(p.id)}
                    className={`w-full py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                      action.isCurrent
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default shadow-xs'
                        : p.popular
                        ? 'bg-[#00D166] hover:bg-[#00be5b] text-slate-950 shadow-md shadow-[#00D166]/20 active:scale-95'
                        : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                    }`}
                  >
                    {action.isCurrent ? (
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>پلن فعال شما</span>
                      </span>
                    ) : (
                      <>
                        <span>{action.text}</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full py-3 text-center text-xs text-slate-300 select-none">
                    &nbsp;
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200 text-center">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
          <h4 className="text-xs font-black text-slate-800 mb-0.5">فعال‌سازی سریع</h4>
          <p className="text-[10px] text-slate-500">ارتقای سهمیه و فعال‌سازی اشتراک پس از تأیید رسید</p>
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

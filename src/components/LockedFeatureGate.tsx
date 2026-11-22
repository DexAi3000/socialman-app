"use client";

import React from 'react';
import { Lock, Sparkles, Crown, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PlanType } from '@/types';

interface LockedFeatureGateProps {
  feature: 'calendar' | 'client-portal' | 'ai-studio';
  requiredPlan: 'pro' | 'agency';
  onUpgrade: () => void;
  onBack: () => void;
}

export function LockedFeatureGate({
  feature,
  requiredPlan,
  onUpgrade,
  onBack,
}: LockedFeatureGateProps) {
  const featureDetails = {
    calendar: {
      title: 'تقویم هوشمند محتوای شمسی',
      planLabel: 'پلن نقره‌ای (حرفه‌ای)',
      badgeColor: 'bg-sky-100 text-[#3b96cc] border-sky-200',
      icon: Zap,
      desc: 'سیستم زمان‌بندی خودکار و تقویم مناسبت‌های ملی و مذهبی در پلن رایگان قفل است. با ارتقا به پلن نقره‌ای، انتشار خودکار پست‌ها را فعال کنید.',
      benefits: [
        'زمان‌بندی انتشار خودکار پست‌ها در هر ۵ پلتفرم',
        'تقویم مناسبت‌های ملی و کمپین‌های پرفروش بازار ایران',
        'هوشمندسازی زمان انتشار در ساعات اوج تعامل مخاطبان',
      ],
    },
    'client-portal': {
      title: 'پورتال اختصاصی تایید آنلاین کارفرما',
      planLabel: 'پلن طلایی (آژانس و تیم)',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: Crown,
      desc: 'پورتال تعاملی لینک جادویی برای دریافت تاییدیه مستقیم از کارفرما منحصراً ویژه پلن طلایی آژانس است.',
      benefits: [
        'ارسال لینک بدون نیاز به ثبت‌نام یا لاگین برای کارفرما',
        'تایید نهایی با یک کلیک یا ثبت نظر اصلاحیه',
        'حذف شلوغی‌های پیام‌رسان‌ها و جلوگیری از خطای انسانی در تحویل محتوا',
      ],
    },
    'ai-studio': {
      title: 'استودیو هوش مصنوعی تولید محتوا',
      planLabel: 'پلن نقره‌ای (حرفه‌ای)',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      icon: Sparkles,
      desc: 'تولید سناریوهای ریلز، ایده‌های وایرال و کپشن‌نویسی هوشمند نیازمند اشتراک حرفه‌ای است.',
      benefits: [
        'تولید کپشن و هوک متناسب با ۵ شبکه اجتماعی',
        'استخراج خودکار هشتگ‌های ترند و بدون بلاک الگوریتم',
        'نگارش با ۵ لحن مختلف (دوستانه، حرفه‌ای، داستانی، فروشگاهی)',
      ],
    },
  }[feature];

  const IconComponent = featureDetails.icon;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl text-center space-y-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-gradient-to-b from-amber-200/30 via-sky-100/20 to-transparent blur-2xl -z-10" />

        {/* Lock & Crown Badge */}
        <div className="relative mx-auto w-20 h-20">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-50 to-orange-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 shadow-sm mx-auto">
            <Lock className="w-10 h-10 stroke-[2.2]" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-xs">
            <IconComponent className="w-4 h-4 fill-white" />
          </div>
        </div>

        {/* Title & Badge */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border border-amber-200 bg-amber-50 text-amber-800">
            <span>ویژه {featureDetails.planLabel}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900">
            {featureDetails.title} قفل است
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            {featureDetails.desc}
          </p>
        </div>

        {/* Feature Benefits List */}
        <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-100 text-right space-y-2.5 max-w-lg mx-auto">
          <h4 className="text-xs font-black text-gray-700 mb-2">با فعال‌سازی این قابلیت به چه مواردی دسترسی پیدا می‌کنید؟</h4>
          {featureDetails.benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-600 font-medium leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-[#3b96cc] shrink-0 mt-0.5" />
              <span>{b}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
          <button
            onClick={onUpgrade}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-black shadow-md shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>ارتقای اشتراک و بازگشایی آنی</span>
          </button>
          <button
            onClick={onBack}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
          >
            بازگشت به خانه
          </button>
        </div>
      </div>
    </div>
  );
}

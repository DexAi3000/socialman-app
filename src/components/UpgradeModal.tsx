"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, CheckCircle2, Crown, Zap, X } from 'lucide-react';
import { PlanType } from '@/types';
import { toPersianDigits } from '@/lib/utils';

export function UpgradeModal() {
  const {
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    selectedPlanForUpgrade,
    upgradePlan,
  } = useApp();

  const [isProcessing, setIsProcessing] = useState(false);
  const [successPaid, setSuccessPaid] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const targetPlan: PlanType = selectedPlanForUpgrade || 'pro';

  const planInfo = {
    free: { name: 'برنز (رایگان)', price: '۰ تومان', desc: 'امکانات پایه' },
    pro: { name: 'نقره‌ای (حرفه‌ای / ادمین)', price: '۱۸۹٬۰۰۰ تومان', desc: 'تولید نامحدود هوش مصنوعی برای ۵ پلتفرم' },
    agency: { name: 'طلایی (آژانس و تیم)', price: '۵۸۰٬۰۰۰ تومان', desc: 'برندهای نامحدود، پورتال اختصاصی کارفرما و اعضای تیم' },
  }[targetPlan];

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccessPaid(true);
      setTimeout(() => {
        upgradePlan(targetPlan);
        setSuccessPaid(false);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="relative bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setIsUpgradeModalOpen(false)}
          className="absolute top-4 left-4 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {successPaid ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#00A852] border border-emerald-300 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900">پرداخت با موفقیت انجام شد!</h3>
            <p className="text-xs text-slate-500 font-mono">
              شماره پیگیری زرین‌پال: {toPersianDigits('۹۸۴۲۱۵۳۸')}
            </p>
            <p className="text-xs text-[#00A852] font-black">
              پلن شما به «{planInfo.name}» ارتقا یافت. در حال بازگشت...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">ارتقای اشتراک سوشال من</h3>
                <p className="text-xs text-slate-500">انتقال مستقیم به درگاه امن شاپرک</p>
              </div>
            </div>

            {/* Plan Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">پلن انتخابی:</span>
                <span className="font-black text-slate-900">{planInfo.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">دوره اشتراک:</span>
                <span className="text-slate-700">۱ ماهه (۳۰ روز)</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-black">مبلغ نهایی:</span>
                <span className="font-black text-[#00A852] text-base font-mono">
                  {planInfo.price}
                </span>
              </div>
            </div>

            {/* Gateway Logo */}
            <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00A852]" />
                <span className="font-bold">پروتکل شاپرک شتاب و زرین‌پال</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">SSL 256-bit</span>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-[#00D166] hover:bg-[#00be5b] text-slate-950 shadow-md shadow-[#00D166]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>در حال اتصال به درگاه بانکی شاپرک...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>پرداخت امن شتاب و فعال‌سازی فوری</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

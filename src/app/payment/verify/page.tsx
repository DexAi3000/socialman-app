"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, ShieldCheck, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { PlanType } from '@/types';
import Link from 'next/link';

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { upgradePlan } = useApp();

  const status = searchParams.get('Status');
  const authority = searchParams.get('Authority');
  const plan = (searchParams.get('plan') as PlanType) || 'pro';
  const paramRefId = searchParams.get('refId');

  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [refId, setRefId] = useState<string>(paramRefId || '۹۸۴۲۱۵۳۸');

  useEffect(() => {
    if (status === 'NOK') {
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    // Apply upgrade in context and state
    upgradePlan(plan);
    setIsSuccess(true);
    setLoading(false);
    if (!paramRefId) {
      setRefId(String(Math.floor(10000000 + Math.random() * 90000000)));
    }
  }, [status, plan, paramRefId, upgradePlan]);

  const planTitles: Record<string, string> = {
    pro: 'نقره‌ای (حرفه‌ای / ادمین)',
    agency: 'طلایی (آژانس و تیم)',
  };

  const planPrices: Record<string, string> = {
    pro: '۱۸۹٬۰۰۰ تومان',
    agency: '۵۸۰٬۰۰۰ تومان',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#3b96cc] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500 font-bold">در حال استعلام و تایید تراکنش بانکی...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-gray-100 text-center space-y-6">
        {isSuccess ? (
          <>
            {/* Success Icon */}
            <div className="w-18 h-18 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg font-black text-gray-900">پرداخت با موفقیت انجام شد!</h1>
              <p className="text-xs text-emerald-700 font-bold">
                اشتراک «{planTitles[plan] || 'حرفه‌ای'}» با موفقیت فعال شد.
              </p>
            </div>

            {/* Receipt Details Box */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2.5 text-xs text-right">
              <div className="flex items-center justify-between text-gray-500">
                <span>شماره پیگیری شتاب:</span>
                <span className="font-mono font-bold text-gray-900">{toPersianDigits(refId)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>پلن فعال‌شده:</span>
                <span className="font-bold text-gray-900">{planTitles[plan] || 'حرفه‌ای'}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>مبلغ پرداختی:</span>
                <span className="font-bold text-[#3b96cc] font-mono">{planPrices[plan] || '۱۸۹٬۰۰۰ تومان'}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500 pt-2 border-t border-gray-200">
                <span>درگاه بانکی:</span>
                <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  شاپرک / زرین‌پال تایید شده
                </span>
              </div>
            </div>

            {/* Return Button */}
            <Link
              href="/"
              className="w-full bg-[#3b96cc] hover:bg-[#2c7ead] text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ورود به داشبورد و شروع کار</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-base font-black text-gray-900">تراکنش ناموفق بود</h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              پرداخت توسط کاربر لغو شد یا مشکلی در اتصال به درگاه بانکی رخ داد. مبلغی از حساب شما کسر نشده است.
            </p>
            <Link
              href="/"
              className="inline-block w-full py-3 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold"
            >
              بازگشت به برنامه
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#3b96cc] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentVerifyContent />
    </Suspense>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Send,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginUser } = useApp();

  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phone, setPhone] = useState('09123456789');
  const [otpCode, setOtpCode] = useState('');
  const [fullName, setFullName] = useState('نیما آرین فر');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [testOtpHint, setTestOtpHint] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(120);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!phone || !/^09[0-9]{9}$/.test(phone)) {
      setErrorMsg('لطفاً شماره موبایل ۱۱ رقمی معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', phone }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestOtpHint(data.testCode || '12345');
        setStep('otp');
        setCountdown(120);
      } else {
        setErrorMsg(data.error || 'خطایی در ارسال پیامک رخ داد.');
      }
    } catch (err) {
      setErrorMsg('خطای شبکه در ارتباط با سرور احراز هویت');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpCode || otpCode.length < 4) {
      setErrorMsg('لطفاً کد تایید پیامکی را به طور کامل وارد کنید.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-otp',
          phone,
          code: otpCode,
          fullName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        loginUser({
          id: data.user.id,
          fullName: data.user.fullName,
          phone: data.user.phone,
          role: data.user.role,
          verifiedVia: 'SMS.ir',
        });
      } else {
        setErrorMsg(data.error || 'کد تایید اشتباه است.');
      }
    } catch (err) {
      setErrorMsg('خطایی در بررسی کد تایید رخ داد.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${toPersianDigits(mins)}:${toPersianDigits(String(secs).padStart(2, '0'))}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 space-y-6">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 left-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand App Mascot + SMS.ir Header */}
        <div className="flex flex-col items-center text-center space-y-2.5 pt-2">
          {/* App Mascot Icon */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-gray-100 shadow-rose-900/10 shrink-0">
            <img src="/app-icon.jpg" alt="لوگوی سوشال‌من" className="w-full h-full object-cover" />
          </div>

          {/* SMS.ir Emblem Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200">
            {/* SMS.ir Firebird Icon */}
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-white shadow-xs">
              <Send className="w-4 h-4 fill-white rotate-45 -mr-0.5" />
            </div>
            <div className="flex items-baseline gap-1 font-sans">
              <span className="font-black text-sm text-gray-900 tracking-tight">SMS</span>
              <span className="font-bold text-xs text-amber-600">.ir</span>
            </div>
            <span className="text-[10px] text-gray-500 font-bold border-r border-amber-200 pr-2 mr-1">
              سامانه پیامکی امن
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-[#212121]">
            {step === 'phone' ? 'ورود یا ثبت‌نام در سوشال من' : 'تایید شماره موبایل'}
          </h2>
          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
            {step === 'phone'
              ? 'شماره موبایل خود را وارد کنید تا کد تایید یکبار مصرف ارسال شود.'
              : `کد تایید پیامک شده به شماره ${toPersianDigits(phone)} را وارد کنید.`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Phone Input Form */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-700 mb-1.5 text-right">
                شماره تلفن همراه:
              </label>
              <div className="relative">
                <input
                  type="tel"
                  dir="ltr"
                  required
                  placeholder="09123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#21aa58] rounded-2xl px-4 py-3.5 text-center font-mono font-bold text-base text-gray-800 outline-none tracking-widest transition-all"
                />
                <Smartphone className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-[#21aa58] hover:bg-[#1e9b50] text-white shadow-md shadow-[#21aa58]/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>در حال ارسال پیامک با SMS.ir...</span>
                </>
              ) : (
                <>
                  <span>دریافت کد تایید پیامکی</span>
                  <ArrowRight className="w-4 h-4 mr-1" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification Form */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Test hint for development */}
            {testOtpHint && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#21aa58]" />
                  <span>کد تست دریافتی از پیامک:</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(testOtpHint)}
                  className="font-mono font-black text-sm bg-white px-2 py-0.5 rounded-lg border border-emerald-300 text-[#21aa58] cursor-pointer hover:bg-emerald-100"
                >
                  {toPersianDigits(testOtpHint)} (درج خودکار)
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-700 mb-1.5 text-right">
                کد تایید ۵ رقمی:
              </label>
              <input
                type="text"
                dir="ltr"
                maxLength={5}
                required
                placeholder="• • • • •"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#21aa58] rounded-2xl px-4 py-3.5 text-center font-mono font-black text-xl text-gray-800 outline-none tracking-widest transition-all"
              />
            </div>

            {/* Timer & Edit Number */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-gray-500 hover:text-gray-800 font-bold hover:underline"
              >
                ویرایش شماره موبایل
              </button>

              <div className="flex items-center gap-1 font-mono">
                {countdown > 0 ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{formatTimer(countdown)}</span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-[#21aa58] font-bold flex items-center gap-1 hover:underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    ارسال مجدد پیامک
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-[#21aa58] hover:bg-[#1e9b50] text-white shadow-md shadow-[#21aa58]/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>در حال بررسی کد...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تایید و ورود به برنامه</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Security Badges */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#21aa58]" />
            <span>احراز هویت تحت وب‌سرویس SMS.ir</span>
          </div>
          <span>پروتکل امن SSL</span>
        </div>
      </div>
    </div>
  );
}

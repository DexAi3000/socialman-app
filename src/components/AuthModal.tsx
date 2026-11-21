"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  X,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

export function AuthModal() {
  const router = useRouter();
  const { isAuthModalOpen, closeAuthModal, loginUser } = useApp();

  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('09123456789');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '']);
  const [fullName, setFullName] = useState('نیما آرین فر');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [testOtpHint, setTestOtpHint] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(120);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMsg(data.error || 'خطایی در ارسال پیامک رخ داد.');
      }
    } catch (err) {
      setErrorMsg('خطای شبکه در ارتباط با سرور احراز هویت');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      loginUser({
        id: 'usr-8192',
        fullName: 'نیما آرین فر',
        phone: '09123456789',
        role: 'مدیر محتوا و ادمین',
        verifiedVia: 'SMS.ir',
      });
      closeAuthModal();
    }, 400);
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal) {
      const newOtp = [...otpValues];
      newOtp[index] = '';
      setOtpValues(newOtp);
      return;
    }

    if (cleanVal.length > 1) {
      const chars = cleanVal.slice(0, 5).split('');
      const newOtp = [...otpValues];
      chars.forEach((c, i) => {
        if (i < 5) newOtp[i] = c;
      });
      setOtpValues(newOtp);
      const nextIndex = Math.min(chars.length, 4);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otpValues];
    newOtp[index] = cleanVal.slice(-1);
    setOtpValues(newOtp);

    if (index < 4 && cleanVal) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleFillTestCode = () => {
    const code = testOtpHint || '12345';
    const digits = code.split('').slice(0, 5);
    setOtpValues(digits);
    otpInputRefs.current[4]?.focus();
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const fullCode = otpValues.join('');
    if (fullCode.length < 5) {
      setErrorMsg('لطفاً کد تایید ۵ رقمی را به طور کامل وارد کنید.');
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
          code: fullCode,
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
        closeAuthModal();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Top Controls: Close & Fullscreen Page Link */}
        <div className="flex items-center justify-between">
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>

          <Link
            href="/login"
            onClick={closeAuthModal}
            className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-[#3b96cc] transition-colors"
            title="باز کردن در صفحه تمام‌صفحه"
          >
            <span>صفحه کامل</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Brand App Mascot */}
        <div className="flex flex-col items-center text-center space-y-2 pt-1">
          {/* App Mascot Icon */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-gray-100 shadow-rose-900/10 shrink-0">
            <img src="/app-icon.jpg" alt="Social Man" className="w-full h-full object-cover" />
          </div>

          <div>
            <span className="text-xl font-black text-gray-900 font-sans tracking-tight">
              Social Man
            </span>
          </div>

          <h2 className="text-base font-black text-gray-900">
            {step === 'phone' ? 'ورود یا ثبت‌نام' : 'تایید شماره موبایل'}
          </h2>
          <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
            {step === 'phone'
              ? 'شماره موبایل خود را وارد کنید تا کد تایید یکبار مصرف ارسال شود.'
              : `کد تایید ۵ رقمی پیامک شده به شماره ${toPersianDigits(phone)} را وارد کنید.`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
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
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] focus:ring-4 focus:ring-sky-500/10 rounded-2xl px-4 py-3.5 text-center font-mono font-black text-base text-gray-800 outline-none tracking-widest transition-all"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pl-2 border-l border-gray-200 text-gray-500 text-xs font-mono font-bold">
                  <span>🇮🇷</span>
                  <span>+۹۸</span>
                </div>
                <Smartphone className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-md shadow-[#3b96cc]/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>در حال ارسال پیامک...</span>
                </>
              ) : (
                <>
                  <span>دریافت کد تایید پیامکی</span>
                  <ArrowRight className="w-4 h-4 mr-1" />
                </>
              )}
            </button>

            {/* Quick 1-Click Demo Login */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2.5 rounded-2xl font-black text-xs bg-sky-50 hover:bg-sky-100 text-[#3b96cc] border border-sky-200/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>ورود آزمایشی با پروفایل نیما آرین‌فر</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 2: 5-Digit Pin OTP Verification Form */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-700 mb-2 text-center">
                کد تایید ۵ رقمی:
              </label>
              <div className="flex items-center justify-center gap-2" dir="ltr">
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`w-11 h-13 text-center text-xl font-mono font-black rounded-2xl border transition-all outline-none ${
                      val
                        ? 'border-[#3b96cc] bg-white text-[#3b96cc] shadow-xs'
                        : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3b96cc] focus:ring-4 focus:ring-sky-500/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Timer & Edit Number */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-gray-500 hover:text-gray-800 font-bold hover:underline cursor-pointer"
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
                    onClick={() => handleSendOtp()}
                    className="text-[#3b96cc] font-bold flex items-center gap-1 hover:underline cursor-pointer"
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
              className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-md shadow-[#3b96cc]/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
      </div>
    </div>
  );
}

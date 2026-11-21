"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, currentUser, isAuthChecked } = useApp();

  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '']);
  const [fullName, setFullName] = useState('نیما آرین فر');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [testOtpHint, setTestOtpHint] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(120);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If user is already logged in, redirect directly to dashboard
  useEffect(() => {
    if (isAuthChecked && currentUser?.isLoggedIn) {
      router.replace('/');
    }
  }, [isAuthChecked, currentUser, router]);

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

  // Handle phone submission to receive OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!phone || !/^09[0-9]{9}$/.test(phone)) {
      setErrorMsg('شماره موبایل ۱۱ رقمی معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/socialman/api/auth/otp', {
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

  // OTP inputs handling
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal) {
      const newOtp = [...otpValues];
      newOtp[index] = '';
      setOtpValues(newOtp);
      return;
    }

    // If pasted multiple characters
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

    // Auto-advance to next box
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
      setErrorMsg('کد تایید ۵ رقمی را به طور کامل وارد کنید.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/socialman/api/auth/otp', {
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
        setStep('success');
        setTimeout(() => {
          router.push('/');
        }, 1200);
      } else {
        setErrorMsg(data.error || 'کد تایید اشتباه است یا منقضی شده است.');
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
    <div className="min-h-screen w-full bg-[#f4f5f7] flex justify-center items-center sm:p-4 selection:bg-[#3b96cc] selection:text-white">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-[420px] bg-white min-h-screen sm:min-h-[640px] sm:rounded-[32px] sm:shadow-xl sm:border sm:border-gray-100 flex flex-col justify-between p-5 sm:p-6 relative">
        
        {/* Top Header: Back Button */}
        <div className="flex items-center justify-between pb-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-black text-gray-600 hover:text-[#3b96cc] transition-colors p-1"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت</span>
          </Link>
        </div>

        {/* Mascot & Mobile Titles */}
        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-gray-100 shadow-rose-900/10 shrink-0">
            <img src="/socialman/app-icon.jpg" alt="Social Man" className="w-full h-full object-cover" />
          </div>

          <div>
            <span className="text-xl font-black text-gray-900 font-sans tracking-tight">
              Social Man
            </span>
          </div>

          <div className="pt-2">
            <h2 className="text-base font-black text-gray-900">
              {step === 'phone' && 'ورود یا ثبت‌نام'}
              {step === 'otp' && 'تایید شماره تلفن همراه'}
              {step === 'success' && 'ورود موفقیت‌آمیز'}
            </h2>
            <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5 max-w-[280px]">
              {step === 'phone' && 'شماره موبایل خود را وارد کنید تا کد تایید برایتان پیامک شود.'}
              {step === 'otp' && (
                <span>
                  کد تایید پیامک‌شده به{' '}
                  <span className="font-mono font-bold text-gray-800">{toPersianDigits(phone)}</span> را وارد کنید.
                </span>
              )}
              {step === 'success' && 'در حال هدایت به اپلیکیشن Social Man...'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 my-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Phone Form */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-3.5 my-auto py-4">
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
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] focus:ring-3 focus:ring-sky-500/10 rounded-2xl px-4 py-3 text-center font-mono font-black text-base text-gray-900 outline-none tracking-widest transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pl-2 border-l border-gray-200 text-gray-500 text-xs font-mono font-bold">
                  <span>🇮🇷</span>
                  <span>+۹۸</span>
                </div>
                <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-md shadow-[#3b96cc]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>در حال ارسال پیامک...</span>
                </>
              ) : (
                <span>دریافت کد تایید پیامکی</span>
              )}
            </button>
          </form>
        )}

        {/* Step 2: 5-Digit Pin OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 my-auto py-4">
            <div>
              <label className="block text-xs font-black text-gray-700 mb-2 text-center">
                کد تایید ۵ رقمی را وارد کنید:
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
                        : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3b96cc] focus:ring-3 focus:ring-sky-500/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Timer & Edit Number Controls */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-gray-500 hover:text-[#3b96cc] font-bold hover:underline cursor-pointer text-[11px]"
              >
                ویرایش شماره
              </button>

              <div className="flex items-center gap-1 font-mono text-xs">
                {countdown > 0 ? (
                  <>
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="font-bold text-gray-700">{formatTimer(countdown)}</span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-[#3b96cc] font-black flex items-center gap-1 hover:underline cursor-pointer text-[11px]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    ارسال مجدد
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-md shadow-[#3b96cc]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>در حال تایید کد...</span>
                </>
              ) : (
                <span>تایید و ورود</span>
              )}
            </button>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === 'success' && (
          <div className="py-8 flex flex-col items-center text-center space-y-3 animate-in zoom-in-95 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-[#3b96cc] flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-gray-900">ورود با موفقیت انجام شد</h3>
              <p className="text-xs text-gray-500">
                خوش آمدید <span className="font-bold text-gray-800">{fullName}</span>
              </p>
            </div>
            <div className="w-40 h-1 bg-gray-100 rounded-full overflow-hidden mt-2">
              <div className="w-full h-full bg-[#3b96cc] rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

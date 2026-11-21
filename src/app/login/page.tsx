"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Smartphone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Send,
  Lock,
  Share2,
  Layers,
  Zap,
  Users,
  Calendar,
  Check,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, currentUser } = useApp();

  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('09123456789');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '']);
  const [fullName, setFullName] = useState('نیما آرین فر');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [testOtpHint, setTestOtpHint] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(120);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If already logged in, show logged-in alert or allow entering
  useEffect(() => {
    if (currentUser?.isLoggedIn && step !== 'success') {
      // User can remain or click back
    }
  }, [currentUser, step]);

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
      setErrorMsg('لطفاً شماره موبایل ۱۱ رقمی معتبر با فرمت ۰۹ وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)');
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
        // Focus first OTP input
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

  // Quick 1-click Test Login for development
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
      setStep('success');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }, 600);
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

  // Auto-fill test code
  const handleFillTestCode = () => {
    const code = testOtpHint || '12345';
    const digits = code.split('').slice(0, 5);
    setOtpValues(digits);
    otpInputRefs.current[4]?.focus();
  };

  // Verify OTP submission
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
        setStep('success');
        setTimeout(() => {
          router.push('/');
        }, 1500);
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
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col justify-center items-center p-3 sm:p-6 md:p-10 selection:bg-[#21aa58] selection:text-white">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-10 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl" />
      </div>

      {/* Main Glassmorphism Container */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-3xl sm:rounded-[36px] shadow-2xl border border-gray-100/80 overflow-hidden flex flex-col md:flex-row-reverse min-h-[640px]">
        {/* Right Panel (Desktop): High-End Visual Showcase */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Background Decorative Rings */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xl border border-white/20 shadow-emerald-950/50 shrink-0">
                <img
                  src="/app-icon.jpg"
                  alt="سوشال‌من"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                  سوشال‌من<span className="text-[#22c55e]">!</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-400 font-mono tracking-wider">
                  SocialMan SuperApp
                </span>
              </div>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>نسخه هوشمند ۱۴۰۳</span>
            </span>
          </div>

          {/* Center Showcase Content */}
          <div className="relative z-10 my-8 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black">
                <Zap className="w-3.5 h-3.5 fill-emerald-300" />
                <span>اولین سوپراپلیکیشن مدیریت شبکه‌های اجتماعی ایران</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-white">
                مدیریت، زمان‌بندی و انتشار یکپارچه در <span className="text-emerald-400 underline decoration-emerald-500/50 underline-offset-8">۵ پلتفرم</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md font-medium">
                تولید محتوا با هوش مصنوعی جمینای، انتشار مستقیم به تلگرام، اینستاگرام، روبیکا، بله و واتساپ با تایید برخط کارفرما.
              </p>
            </div>

            {/* Floating Social Icons Bar */}
            <div className="flex items-center gap-2 sm:gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xs">
                <span className="text-lg">📸</span>
                <span className="text-xs font-bold text-gray-200">اینستاگرام</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xs">
                <span className="text-lg">✈️</span>
                <span className="text-xs font-bold text-gray-200">تلگرام</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xs">
                <span className="text-lg">🟣</span>
                <span className="text-xs font-bold text-gray-200">روبیکا</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xs">
                <span className="text-lg">🟢</span>
                <span className="text-xs font-bold text-gray-200">بله</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xs">
                <span className="text-lg">💬</span>
                <span className="text-xs font-bold text-gray-200">واتساپ</span>
              </div>
            </div>

            {/* Highlighted Feature Badges */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3 text-xs text-gray-200 font-bold">
                <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>احراز هویت پیامکی پرسرعت با سامانه رسمی SMS.ir</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-200 font-bold">
                <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>پورتال کارفرما بدون نیاز به رمز عبور پیج و کانال‌ها</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-200 font-bold">
                <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>تقویم شمسی هوشمند ویژه مناسبت‌های ملی و مذهبی آذر ۱۴۰۳</span>
              </div>
            </div>
          </div>

          {/* Bottom Social Proof */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2 space-x-reverse">
                <div className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-emerald-950 flex items-center justify-center text-[10px] font-bold">ن</div>
                <div className="w-7 h-7 rounded-full bg-amber-600 border-2 border-emerald-950 flex items-center justify-center text-[10px] font-bold">م</div>
                <div className="w-7 h-7 rounded-full bg-sky-600 border-2 border-emerald-950 flex items-center justify-center text-[10px] font-bold">س</div>
              </div>
              <span className="font-bold text-[11px] text-gray-300">
                بیش از ۲,۵۰۰ ادمین و آژانس فعال
              </span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400">v18.40 SuperApp</span>
          </div>
        </div>

        {/* Left Panel: Auth Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
          {/* Top Back Link & SMS.ir Verification Pill */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-black text-gray-500 hover:text-[#21aa58] transition-colors group"
            >
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              <span>بازگشت به برنامه</span>
            </Link>

            {/* Official SMS.ir Verified Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold shadow-2xs">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white">
                <Send className="w-3 h-3 fill-white rotate-45 -mr-0.5" />
              </div>
              <span className="font-sans font-black tracking-tight text-gray-900">SMS.ir</span>
              <span className="text-[10px] text-gray-400 font-normal">| سامانه رسمی</span>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="my-auto py-6 space-y-6">
            {/* Header Titles */}
            <div className="space-y-1.5 text-right">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                {step === 'phone' && 'ورود یا ثبت‌نام در سوشال‌من'}
                {step === 'otp' && 'تایید شماره تلفن همراه'}
                {step === 'success' && 'خوش آمدید!'}
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                {step === 'phone' && 'برای ورود به حساب کاربری، شماره موبایل خود را وارد نمایید.'}
                {step === 'otp' && (
                  <span>
                    کد تایید ۵ رقمی ارسال شده به شماره{' '}
                    <span className="font-mono font-bold text-gray-800">{toPersianDigits(phone)}</span> را وارد کنید.
                  </span>
                )}
                {step === 'success' && 'احراز هویت شما با موفقیت انجام شد. در حال هدایت به پنل کاربری...'}
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: Phone Form */}
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
                      className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#21aa58] focus:ring-4 focus:ring-emerald-500/10 rounded-2xl px-4 py-3.5 text-center font-mono font-black text-lg text-gray-900 outline-none tracking-widest transition-all"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pl-2 border-l border-gray-200 text-gray-500 text-xs font-mono font-bold">
                      <span>🇮🇷</span>
                      <span>+۹۸</span>
                    </div>
                    <Smartphone className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block text-right">
                    کد فعال‌سازی به این شماره پیامک خواهد شد.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-black text-sm bg-[#21aa58] hover:bg-[#1e9b50] text-white shadow-lg shadow-[#21aa58]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>در حال ارسال پیامک با SMS.ir...</span>
                    </>
                  ) : (
                    <>
                      <span>دریافت کد تایید پیامکی</span>
                      <ArrowLeft className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>

                {/* Quick 1-Click Demo Login */}
                <div className="pt-2">
                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-gray-200 w-full" />
                    <span className="bg-white px-3 text-[11px] font-bold text-gray-400 shrink-0">
                      یا دسترسی سریع
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    className="w-full py-3 rounded-2xl font-black text-xs bg-emerald-50 hover:bg-emerald-100 text-[#21aa58] border border-emerald-200/80 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>ورود آزمایشی با پروفایل نیما آرین‌فر (ادمین)</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: 5-Digit OTP Verification Form */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* Test OTP Hint Banner */}
                {testOtpHint && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-4 h-4 text-[#21aa58]" />
                      <span>کد تایید دریافتی:</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleFillTestCode}
                      className="font-mono font-black text-sm bg-white px-3 py-1 rounded-xl border border-emerald-300 text-[#21aa58] cursor-pointer hover:bg-emerald-100 shadow-2xs"
                    >
                      {toPersianDigits(testOtpHint)} (درج خودکار)
                    </button>
                  </div>
                )}

                {/* 5-Digit Pin Boxes */}
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-2.5 text-center">
                    کد تایید ۵ رقمی را وارد کنید:
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-3" dir="ltr">
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
                        className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-mono font-black rounded-2xl border transition-all outline-none ${
                          val
                            ? 'border-[#21aa58] bg-white text-[#21aa58] shadow-sm shadow-[#21aa58]/10'
                            : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-[#21aa58] focus:ring-4 focus:ring-emerald-500/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Timer & Edit Number Controls */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1 px-1">
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-gray-500 hover:text-[#21aa58] font-bold hover:underline cursor-pointer"
                  >
                    ویرایش شماره موبایل
                  </button>

                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    {countdown > 0 ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-bold text-gray-700">{formatTimer(countdown)}</span>
                        <span className="text-[10px] text-gray-400 font-sans">تا ارسال مجدد</span>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-[#21aa58] font-black flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        ارسال مجدد پیامک
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-black text-sm bg-[#21aa58] hover:bg-[#1e9b50] text-white shadow-lg shadow-[#21aa58]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>در حال تایید کد با SMS.ir...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تایید و ورود به اپلیکیشن</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 3: Success Screen */}
            {step === 'success' && (
              <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-[#21aa58] flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-gray-900">ورود موفقیت‌آمیز بود!</h3>
                  <p className="text-xs text-gray-500">
                    خوش آمدید <span className="font-bold text-gray-800">{fullName}</span>. در حال انتقال به داشبورد کاری...
                  </p>
                </div>
                <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-[#21aa58] rounded-full animate-pulse" />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Security Trust Badges */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#21aa58]" />
              <span>پروتکل امن SSL و احراز هویت پیامکی</span>
            </div>
            <Link href="/" className="hover:text-gray-700 transition-colors font-bold">
              قوانین و حریم خصوصی
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

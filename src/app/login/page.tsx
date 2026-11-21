"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  User,
  Lock,
  Eye,
  EyeOff,
  AtSign,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, currentUser, isAuthChecked } = useApp();

  // Navigation & Mode states
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');

  // Login form fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form fields
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // OTP states
  const [otpPhone, setOtpPhone] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '']);
  const [testOtpHint, setTestOtpHint] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(120);

  // Common UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successName, setSuccessName] = useState('');

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

  // Smart Back Button Handler
  const handleBack = () => {
    setErrorMsg('');
    if (step === 'otp') {
      setStep('form');
      return;
    }
    if (loginMethod === 'otp') {
      setLoginMethod('password');
      return;
    }
    if (activeTab === 'register') {
      setActiveTab('login');
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  // 1. Handle Login with Password (Username or Phone)
  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanIdentifier = loginIdentifier.trim();
    if (!cleanIdentifier) {
      setErrorMsg('لطفاً نام کاربری یا شماره موبایل خود را وارد کنید.');
      return;
    }

    if (!loginPassword) {
      setErrorMsg('لطفاً رمز عبور خود را وارد کنید.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/socialman/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login-password',
          identifier: cleanIdentifier,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setSuccessName(data.user.fullName || data.user.username || 'کاربر گرامی');
        loginUser({
          id: data.user.id,
          fullName: data.user.fullName,
          phone: data.user.phone,
          username: data.user.username,
          role: data.user.role,
          verifiedVia: 'Password',
        });
        setStep('success');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setErrorMsg(data.error || 'اطلاعات ورود اشتباه است.');
      }
    } catch (err) {
      setErrorMsg('خطای شبکه در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Register with FullName, Username, Phone, Password
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regFullName.trim() || regFullName.trim().length < 2) {
      setErrorMsg('لطفاً نام و نام خانوادگی خود را کامل وارد کنید.');
      return;
    }

    const cleanUsername = regUsername.trim().toLowerCase();
    if (!cleanUsername || !/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      setErrorMsg('نام کاربری باید شامل حداقل ۳ کاراکتر انگلیسی، اعداد یا _ باشد.');
      return;
    }

    let cleanPhone = regPhone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && cleanPhone.startsWith('9')) {
      cleanPhone = '0' + cleanPhone;
    }
    if (!cleanPhone || !/^09[0-9]{9}$/.test(cleanPhone)) {
      setErrorMsg('شماره موبایل ۱۱ رقمی معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹).');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      setErrorMsg('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('تکرار رمز عبور با رمز عبور اصلی مطابقت ندارد.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/socialman/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          fullName: regFullName.trim(),
          username: cleanUsername,
          phone: cleanPhone,
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setSuccessName(data.user.fullName || cleanUsername);
        loginUser({
          id: data.user.id,
          fullName: data.user.fullName,
          phone: data.user.phone,
          username: data.user.username,
          role: data.user.role,
          verifiedVia: 'Register',
        });
        setStep('success');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setErrorMsg(data.error || 'خطایی در ثبت‌نام رخ داد.');
      }
    } catch (err) {
      setErrorMsg('خطای شبکه در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    let cleanPhone = otpPhone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && cleanPhone.startsWith('9')) {
      cleanPhone = '0' + cleanPhone;
    }

    if (!cleanPhone || !/^09[0-9]{9}$/.test(cleanPhone)) {
      setErrorMsg('شماره موبایل ۱۱ رقمی معتبر وارد کنید (مثال: ۰۹۱۲۳۴۵۶۷۸۹)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/socialman/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', phone: cleanPhone }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestOtpHint(data.testCode || '12345');
        setOtpPhone(cleanPhone);
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

  // 4. Handle Verify OTP
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
          phone: otpPhone,
          code: fullCode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setSuccessName(data.user.fullName || 'کاربر گرامی');
        loginUser({
          id: data.user.id,
          fullName: data.user.fullName,
          phone: data.user.phone,
          username: data.user.username,
          role: data.user.role,
          verifiedVia: 'SMS.ir',
        });
        setStep('success');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setErrorMsg(data.error || 'کد تایید اشتباه است یا منقضی شده است.');
      }
    } catch (err) {
      setErrorMsg('خطایی در بررسی کد تایید رخ داد.');
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

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${toPersianDigits(mins)}:${toPersianDigits(String(secs).padStart(2, '0'))}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f5f7] flex justify-center items-center sm:p-4 selection:bg-[#3b96cc] selection:text-white">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-[420px] bg-white min-h-screen sm:min-h-[640px] sm:rounded-[32px] sm:shadow-xl sm:border sm:border-gray-100 flex flex-col justify-between p-5 sm:p-6 relative">
        
        {/* Top Header: Smart Back Button */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-black text-gray-600 hover:text-[#3b96cc] transition-colors p-1.5 rounded-xl hover:bg-gray-50 cursor-pointer active:scale-95"
          >
            <ArrowRight className="w-4 h-4 text-gray-700" />
            <span>بازگشت</span>
          </button>
          <span className="text-[11px] font-bold text-gray-400">Social Man</span>
        </div>

        {/* Mascot & Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md border border-gray-100 shrink-0">
            <img src="/socialman/app-icon.jpg" alt="Social Man" className="w-full h-full object-cover" />
          </div>

          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Social Man</h1>
            <p className="text-[11px] text-gray-500 font-bold mt-0.5">
              مدیریت و انتشار یکپارچه در ۵ پلتفرم
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 my-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <span>⚠️</span>
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Step: FORM (Login or Register) */}
        {step === 'form' && (
          <div className="space-y-4 my-auto py-2">
            
            {/* Segmented Tabs: ورود / ثبت‌نام */}
            <div className="flex items-center bg-gray-100 p-1 rounded-2xl w-full">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-[#3b96cc] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                ورود به حساب
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-[#3b96cc] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                ثبت‌نام کاربر جدید
              </button>
            </div>

            {/* TAB 1: LOGIN */}
            {activeTab === 'login' && (
              <div>
                {loginMethod === 'password' ? (
                  /* Mode A: Password Login (Username or Phone + Password) */
                  <form onSubmit={handleLoginWithPassword} className="space-y-3.5 pt-1">
                    {/* Identifier: Username or Phone */}
                    <div>
                      <label className="block text-xs font-black text-gray-700 mb-1.5 text-right">
                        نام کاربری یا شماره موبایل:
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          dir="ltr"
                          placeholder="nima_dev یا 09123456789"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] focus:ring-3 focus:ring-sky-500/10 rounded-2xl px-4 py-3 text-left font-mono font-bold text-sm text-gray-900 outline-none transition-all placeholder:text-right placeholder:font-sans placeholder:text-gray-400 placeholder:text-xs"
                        />
                        <AtSign className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-black text-gray-700 mb-1.5 text-right">
                        رمز عبور:
                      </label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          dir="ltr"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] focus:ring-3 focus:ring-sky-500/10 rounded-2xl px-4 py-3 text-left font-mono font-bold text-sm text-gray-900 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-md shadow-[#3b96cc]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>در حال بررسی اطلاعات...</span>
                        </>
                      ) : (
                        <span>ورود به حساب کاربری</span>
                      )}
                    </button>

                    {/* Switch to OTP Login */}
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('otp');
                          setErrorMsg('');
                        }}
                        className="text-xs font-black text-[#3b96cc] hover:underline cursor-pointer"
                      >
                        ورود با پیامک (کد یکبار مصرف OTP) ←
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Mode B: OTP Login */
                  <form onSubmit={handleSendOtp} className="space-y-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-black text-gray-700 mb-1.5 text-right">
                        شماره تلفن همراه (کد یکبار مصرف):
                      </label>
                      {/* Left-to-Right Phone Input Container */}
                      <div className="w-full" dir="ltr">
                        <div className="flex items-center bg-gray-50 border border-gray-200 focus-within:border-[#3b96cc] focus-within:bg-white focus-within:ring-3 focus-within:ring-sky-500/10 rounded-2xl px-3 py-1 transition-all overflow-hidden">
                          <div className="flex items-center gap-1.5 pr-2.5 pl-1 py-1.5 border-r border-gray-200 text-gray-600 shrink-0 select-none">
                            <span className="text-sm">🇮🇷</span>
                            <span className="font-mono font-bold text-xs">+98</span>
                          </div>
                          <input
                            type="tel"
                            dir="ltr"
                            required
                            placeholder="9123456789"
                            value={otpPhone}
                            onChange={(e) => setOtpPhone(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-transparent px-3 py-2.5 text-left font-mono font-black text-sm sm:text-base text-gray-900 outline-none tracking-wider placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-normal"
                          />
                          <Smartphone className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
                        </div>
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

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('password');
                          setErrorMsg('');
                        }}
                        className="text-xs font-black text-gray-600 hover:text-[#3b96cc] hover:underline cursor-pointer"
                      >
                        ورود با نام کاربری و کلمه عبور →
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: REGISTER */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3 pt-1">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1 text-right">
                    نام و نام خانوادگی:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="مثال: نیما آرین‌فر"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] focus:ring-3 focus:ring-sky-500/10 rounded-2xl px-4 py-2.5 text-right font-bold text-xs text-gray-900 outline-none transition-all placeholder:text-gray-400"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Username (LTR) */}
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1 text-right">
                    نام کاربری (حروف انگلیسی):
                  </label>
                  <div className="relative" dir="ltr">
                    <input
                      type="text"
                      dir="ltr"
                      required
                      placeholder="nima_dev"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] focus:ring-3 focus:ring-sky-500/10 rounded-2xl px-4 py-2.5 text-left font-mono font-bold text-xs text-gray-900 outline-none transition-all placeholder:text-gray-400"
                    />
                    <AtSign className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Phone Number (Strict LTR) */}
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1 text-right">
                    شماره تلفن همراه:
                  </label>
                  <div className="w-full" dir="ltr">
                    <div className="flex items-center bg-gray-50 border border-gray-200 focus-within:border-[#3b96cc] focus-within:bg-white focus-within:ring-3 focus-within:ring-sky-500/10 rounded-2xl px-3 py-0.5 transition-all overflow-hidden">
                      <div className="flex items-center gap-1.5 pr-2.5 pl-1 py-1.5 border-r border-gray-200 text-gray-600 shrink-0 select-none">
                        <span className="text-sm">🇮🇷</span>
                        <span className="font-mono font-bold text-xs">+98</span>
                      </div>
                      <input
                        type="tel"
                        dir="ltr"
                        required
                        placeholder="9123456789"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-transparent px-3 py-2 text-left font-mono font-black text-xs sm:text-sm text-gray-900 outline-none tracking-wider placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-normal"
                      />
                      <Smartphone className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1 text-right">
                      رمز عبور:
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        dir="ltr"
                        placeholder="حداقل ۶ نویسه"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] focus:ring-3 focus:ring-sky-500/10 rounded-2xl px-3 py-2 text-left font-mono font-bold text-xs text-gray-900 outline-none transition-all placeholder:text-[10px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1 text-right">
                      تکرار رمز عبور:
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        dir="ltr"
                        placeholder="تکرار رمز"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] focus:ring-3 focus:ring-sky-500/10 rounded-2xl px-3 py-2 text-left font-mono font-bold text-xs text-gray-900 outline-none transition-all placeholder:text-[10px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Toggle Show Password */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="flex items-center gap-1 hover:text-gray-800 cursor-pointer font-bold"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showRegPassword ? 'مخفی کردن رمز' : 'نمایش رمز عبور'}</span>
                  </button>
                  <span className="text-[10px] text-gray-400">حداقل ۶ کاراکتر</span>
                </div>

                {/* Submit Register */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-md shadow-[#3b96cc]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>در حال ساخت حساب کاربری...</span>
                    </>
                  ) : (
                    <span>ثبت‌نام و ورود به پنل</span>
                  )}
                </button>
              </form>
            )}

          </div>
        )}

        {/* Step: OTP PIN VERIFICATION */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 my-auto py-4">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-gray-900">تایید شماره تلفن همراه</h3>
              <p className="text-[11px] text-gray-500">
                کد تایید پیامک‌شده به{' '}
                <span className="font-mono font-bold text-gray-800" dir="ltr">{otpPhone}</span> را وارد کنید.
              </p>
            </div>

            <div className="pt-2">
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

            {/* Test code hint for easy reviewer access */}
            {testOtpHint && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const digits = (testOtpHint || '12345').split('').slice(0, 5);
                    setOtpValues(digits);
                    otpInputRefs.current[4]?.focus();
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>کد تست تایید: {testOtpHint} (کلیک برای درج)</span>
                </button>
              </div>
            )}

            {/* Timer & Edit Number */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1 px-1">
              <button
                type="button"
                onClick={() => setStep('form')}
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
                  <span>در حال بررسی کد...</span>
                </>
              ) : (
                <span>تایید و ورود</span>
              )}
            </button>
          </form>
        )}

        {/* Step: SUCCESS */}
        {step === 'success' && (
          <div className="py-8 flex flex-col items-center text-center space-y-3 animate-in zoom-in-95 my-auto">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-[#3b96cc] flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-gray-900">ورود با موفقیت انجام شد</h3>
              <p className="text-xs text-gray-500">
                خوش آمدید <span className="font-bold text-gray-800">{successName}</span>
              </p>
            </div>
            <div className="w-40 h-1 bg-gray-100 rounded-full overflow-hidden mt-2">
              <div className="w-full h-full bg-[#3b96cc] rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-medium">
            امنیت ارتباط توسط رمزنگاری پیشرفته و سشن ایمن پشتیبانی می‌شود
          </p>
        </div>

      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  X,
  Smartphone,
  CheckCircle2,
  Clock,
  RotateCcw,
  User,
  Lock,
  Eye,
  EyeOff,
  AtSign,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

export function AuthModal() {
  const router = useRouter();
  const { isAuthModalOpen, closeAuthModal, loginUser } = useApp();

  // Mode states
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [otpPurpose, setOtpPurpose] = useState<'login' | 'register'>('login');

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // OTP fields
  const [otpPhone, setOtpPhone] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '']);
  const [countdown, setCountdown] = useState(120);

  // Common UI states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  // 1. Login with Password
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
        loginUser({
          id: data.user.id,
          fullName: data.user.fullName,
          phone: data.user.phone,
          username: data.user.username,
          role: data.user.role,
          verifiedVia: 'Password',
        });
        closeAuthModal();
      } else {
        setErrorMsg(data.error || 'اطلاعات ورود اشتباه است.');
      }
    } catch (err) {
      setErrorMsg('خطای شبکه در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Register Form Submit -> Send OTP
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regFullName.trim() || regFullName.trim().length < 2) {
      setErrorMsg('لطفاً نام و نام خانوادگی خود را کامل وارد کنید.');
      return;
    }

    const cleanUsername = regUsername.trim().toLowerCase();
    if (!cleanUsername || !/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      setErrorMsg('نام کاربری باید شامل حروف انگلیسی و حداقل ۳ کاراکتر باشد.');
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
          action: 'register-send-otp',
          fullName: regFullName.trim(),
          username: cleanUsername,
          phone: cleanPhone,
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOtpPhone(cleanPhone);
        setOtpPurpose('register');
        setOtpValues(['', '', '', '', '']);
        setStep('otp');
        setCountdown(120);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMsg(data.error || 'خطایی در ثبت‌نام رخ داد.');
      }
    } catch (err) {
      setErrorMsg('خطای شبکه در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Send OTP
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
        setOtpPhone(cleanPhone);
        setOtpPurpose('login');
        setOtpValues(['', '', '', '', '']);
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

  // 4. Verify OTP (Works for both Register and Login)
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
      let res: Response;
      if (otpPurpose === 'register') {
        res = await fetch('/socialman/api/auth/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register-verify',
            fullName: regFullName.trim(),
            username: regUsername.trim().toLowerCase(),
            phone: otpPhone,
            password: regPassword,
            code: fullCode,
          }),
        });
      } else {
        res = await fetch('/socialman/api/auth/otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify-otp',
            phone: otpPhone,
            code: fullCode,
          }),
        });
      }

      const data = await res.json();
      if (res.ok && data.user) {
        loginUser({
          id: data.user.id,
          fullName: data.user.fullName,
          phone: data.user.phone,
          username: data.user.username,
          role: data.user.role,
          verifiedVia: otpPurpose === 'register' ? 'Register-SMS' : 'SMS.ir',
        });
        closeAuthModal();
      } else {
        setErrorMsg(data.error || 'کد تایید اشتباه است یا منقضی شده است.');
      }
    } catch (err) {
      setErrorMsg('خطایی در بررسی کد تایید رخ داد.');
    } finally {
      setLoading(false);
    }
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

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${toPersianDigits(mins)}:${toPersianDigits(String(secs).padStart(2, '0'))}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>

          <Link
            href="/login"
            onClick={closeAuthModal}
            className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-[#3b96cc] transition-colors"
          >
            <span>صفحه ورود</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mascot */}
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-gray-100 shrink-0">
            <img src="/socialman/app-icon.jpg" alt="Social Man" className="w-full h-full object-cover" />
          </div>
          <span className="text-base font-black text-gray-900 tracking-tight">Social Man</span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Step: FORM */}
        {step === 'form' && (
          <div className="space-y-3.5">
            {/* Tabs */}
            <div className="flex items-center bg-gray-100 p-1 rounded-2xl w-full">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMsg('');
                }}
                className={`flex-1 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-white text-[#3b96cc] shadow-xs'
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
                className={`flex-1 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white text-[#3b96cc] shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                ثبت‌نام جدید
              </button>
            </div>

            {/* TAB: LOGIN */}
            {activeTab === 'login' && (
              <div>
                {loginMethod === 'password' ? (
                  <form onSubmit={handleLoginWithPassword} className="space-y-3">
                    <div>
                      <label className="block text-xs font-black text-gray-700 mb-1 text-right">
                        نام کاربری یا شماره موبایل:
                      </label>
                      <input
                        type="text"
                        required
                        dir="ltr"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] focus:ring-3 focus:ring-sky-500/10 rounded-2xl px-3 py-2 text-left font-mono font-bold text-xs text-gray-900 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-700 mb-1 text-right">
                        رمز عبور:
                      </label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          dir="ltr"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] focus:ring-3 focus:ring-sky-500/10 rounded-2xl px-3 pr-9 py-2 text-left font-mono font-bold text-xs text-gray-900 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-2xl font-black text-xs bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-md shadow-[#3b96cc]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>در حال بررسی...</span>
                        </>
                      ) : (
                        <span>ورود به حساب</span>
                      )}
                    </button>

                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('otp');
                          setErrorMsg('');
                        }}
                        className="text-[11px] font-bold text-[#3b96cc] hover:underline cursor-pointer"
                      >
                        ورود سریع با پیامک (OTP) ←
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSendOtp} className="space-y-3">
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
                            value={otpPhone}
                            onChange={(e) => setOtpPhone(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-transparent px-3 py-2 text-left font-mono font-black text-xs sm:text-sm text-gray-900 outline-none tracking-wider"
                          />
                          <Smartphone className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-2xl font-black text-xs bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-md shadow-[#3b96cc]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>در حال ارسال پیامک...</span>
                        </>
                      ) : (
                        <span>دریافت کد تایید پیامکی</span>
                      )}
                    </button>

                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMethod('password');
                          setErrorMsg('');
                        }}
                        className="text-[11px] font-bold text-gray-600 hover:text-[#3b96cc] hover:underline cursor-pointer"
                      >
                        ورود با رمز عبور →
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB: REGISTER */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-black text-gray-700 mb-0.5 text-right">
                    نام و نام خانوادگی:
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] rounded-2xl px-3 py-2 text-right font-bold text-xs text-gray-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-700 mb-0.5 text-right">
                    نام کاربری (انگلیسی):
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] rounded-2xl px-3 py-2 text-left font-mono font-bold text-xs text-gray-900 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-700 mb-0.5 text-right">
                    شماره موبایل:
                  </label>
                  <div className="w-full" dir="ltr">
                    <div className="flex items-center bg-gray-50 border border-gray-200 focus-within:border-[#3b96cc] focus-within:bg-white rounded-2xl px-2.5 py-0.5 transition-all overflow-hidden">
                      <div className="flex items-center gap-1 pr-2 pl-1 py-1 border-r border-gray-200 text-gray-600 shrink-0 select-none">
                        <span className="text-xs">🇮🇷</span>
                        <span className="font-mono font-bold text-[11px]">+98</span>
                      </div>
                      <input
                        type="tel"
                        dir="ltr"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-transparent px-2.5 py-1.5 text-left font-mono font-black text-xs text-gray-900 outline-none tracking-wider"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-black text-gray-700 mb-0.5 text-right">
                      رمز عبور:
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      dir="ltr"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] rounded-2xl px-2.5 py-1.5 text-left font-mono font-bold text-[11px] text-gray-900 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-gray-700 mb-0.5 text-right">
                      تکرار رمز:
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      dir="ltr"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] rounded-2xl px-2.5 py-1.5 text-left font-mono font-bold text-[11px] text-gray-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-2xl font-black text-xs bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-md shadow-[#3b96cc]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-1"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>در حال ارسال کد تایید...</span>
                    </>
                  ) : (
                    <span>تایید شماره و دریافت کد</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Step: OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-3.5 py-1">
            <div className="text-center space-y-1">
              <h3 className="text-xs font-black text-gray-900">تایید شماره تلفن همراه</h3>
              <p className="text-[11px] text-gray-500">
                کد ۵ رقمی پیامک‌شده به <span className="font-mono font-bold text-gray-800" dir="ltr">{otpPhone}</span>
              </p>
            </div>

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
                  className={`w-10 h-12 text-center text-lg font-mono font-black rounded-2xl border transition-all outline-none ${
                    val
                      ? 'border-[#3b96cc] bg-white text-[#3b96cc]'
                      : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3b96cc]'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-gray-500 hover:text-[#3b96cc] font-bold hover:underline cursor-pointer"
              >
                ویرایش شماره
              </button>

              <div className="flex items-center gap-1 font-mono text-[11px]">
                {countdown > 0 ? (
                  <>
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{formatTimer(countdown)}</span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-[#3b96cc] font-black flex items-center gap-1 hover:underline cursor-pointer"
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
              className="w-full py-2.5 rounded-2xl font-black text-xs bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-md shadow-[#3b96cc]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>در حال بررسی...</span>
                </>
              ) : (
                <span>{otpPurpose === 'register' ? 'تایید و ایجاد حساب کاربری' : 'تایید و ورود'}</span>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

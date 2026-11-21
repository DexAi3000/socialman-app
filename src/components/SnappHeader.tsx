"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  ChevronDown,
  LogOut,
  Smartphone,
  Camera,
  Trash2,
  Menu,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

// Cute 3D Illustrated Character Avatar
function DefaultAvatarGraphic() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <defs>
        <linearGradient id="avatarBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="avatarSkin" x1="16" y1="12" x2="32" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="100%" stopColor="#fed7aa" />
        </linearGradient>
        <linearGradient id="avatarHair" x1="14" y1="8" x2="34" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#451a03" />
          <stop offset="100%" stopColor="#1c1917" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#avatarBg)" />
      {/* Body / Shirt */}
      <path d="M10 44c0-7.7 6.3-14 14-14s14 6.3 14 14v4H10v-4z" fill="#22c55e" />
      <path d="M22 30l2 4 2-4z" fill="#ffffff" />
      {/* Head */}
      <circle cx="24" cy="19" r="8" fill="url(#avatarSkin)" />
      {/* Eyes & Smile */}
      <circle cx="21" cy="18" r="1.1" fill="#1c1917" />
      <circle cx="27" cy="18" r="1.1" fill="#1c1917" />
      <path d="M22 22.5c1 1 3 1 4 0" stroke="#1c1917" strokeWidth="1.2" strokeLinecap="round" />
      {/* Stylish 3D Hair */}
      <path d="M16 16c0-4.4 3.6-8 8-8s8 3.6 8 8c0 .7-.1 1.4-.3 2-1.3-1.8-3.4-3-5.7-3-2.6 0-4.9 1.5-6 3.7-.7-.9-1.2-1.9-1.2-3.1" fill="url(#avatarHair)" />
    </svg>
  );
}

interface SnappHeaderProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export function SnappHeader({ activeTab, setActiveTab }: SnappHeaderProps) {
  const {
    currentUser,
    openAuthModal,
    logoutUser,
    updateUserAvatar,
    setIsHamburgerMenuOpen,
  } = useApp();

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateUserAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Right side: Real Brand Logo: سوشال من! + Nav Links */}
        <div className="flex items-center gap-8">
          {/* Brand Logo: سوشال‌من! */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-md shadow-rose-900/15 border border-gray-100 group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/app-icon.jpg"
                alt="لوگوی سوشال‌من"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black text-gray-900 tracking-tight">
                  سوشال‌من<span className="text-[#21aa58]">!</span>
                </span>
              </div>
              <span className="text-[10px] font-black text-[#21aa58] tracking-wider">
                SocialMan SuperApp
              </span>
            </div>
          </div>

          {/* Header Actions: Hamburger Menu */}
          <div className="flex items-center">
            <button
              onClick={() => setIsHamburgerMenuOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-[#21aa58] border border-gray-200 hover:border-emerald-200 transition-all font-bold text-xs shadow-2xs group cursor-pointer"
              title="باز کردن منوی همبرگری سوشال‌من"
            >
              <div className="w-7 h-7 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-gray-700 group-hover:text-[#21aa58] group-hover:border-emerald-200 shadow-2xs transition-colors">
                <Menu className="w-4 h-4" />
              </div>
              <span className="font-black text-xs">منو</span>
            </button>
          </div>
        </div>

        {/* Left side: User Auth (SMS.ir) */}
        <div className="flex items-center gap-3">
          {/* User Auth Profile / Login Button via SMS.ir */}
          {currentUser?.isLoggedIn ? (
            <div className="relative">
              {/* Hidden File Input for Avatar Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />

              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors group"
              >
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-black text-gray-900 block group-hover:text-[#21aa58] transition-colors">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono block">
                    {toPersianDigits(currentUser.phone)}
                  </span>
                </div>

                {/* 3D Illustrated Character Avatar or Uploaded Photo */}
                <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-white/80 shrink-0 relative bg-sky-100">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <DefaultAvatarGraphic />
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {/* User Dropdown with Avatar Upload Control */}
              {isUserDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-3xl shadow-2xl p-3 z-50 space-y-3">
                  {/* Avatar & User Details */}
                  <div className="flex flex-col items-center text-center p-2 border-b border-gray-100">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-[#21aa58] cursor-pointer group/avatar shrink-0 mb-2 bg-sky-100"
                      title="برای تغییر عکس کلیک کنید"
                    >
                      {currentUser.avatarUrl ? (
                        <img
                          src={currentUser.avatarUrl}
                          alt={currentUser.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <DefaultAvatarGraphic />
                      )}
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold">
                        <Camera className="w-4 h-4 mb-0.5" />
                        <span>تغییر عکس</span>
                      </div>
                    </div>

                    <span className="font-black text-sm text-gray-900 block">{currentUser.fullName}</span>
                    <span className="text-[11px] text-gray-500 font-mono">{toPersianDigits(currentUser.phone)}</span>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <span>احراز هویت SMS.ir ✓</span>
                    </span>
                  </div>

                  {/* Upload Profile Picture Action Button */}
                  <div className="space-y-1.5">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#21aa58] text-xs font-black transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{currentUser.avatarUrl ? 'تغییر عکس پروفایل' : 'آپلود عکس پروفایل جدید'}</span>
                    </button>

                    {currentUser.avatarUrl && (
                      <button
                        onClick={() => updateUserAvatar(undefined)}
                        className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold text-gray-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>بازگشت به آدمک پیش‌فرض</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-gray-100 space-y-1">
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setActiveTab('pricing');
                      }}
                      className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      مدیریت اشتراک و فاکتورها
                    </button>

                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        logoutUser();
                      }}
                      className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center justify-between transition-colors"
                    >
                      <span>خروج از حساب کاربری</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
              >
                <span>صفحه ورود</span>
              </Link>
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-[#21aa58] hover:bg-[#1e9b50] shadow-sm transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-white" />
                <span>ورود با SMS.ir</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

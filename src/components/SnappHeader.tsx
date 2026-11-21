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
      <div className="max-w-md mx-auto px-3 h-16 flex items-center justify-between gap-2">
        {/* Right side: 3-line Hamburger Menu Button (No text) */}
        <div className="w-10 flex items-center justify-start shrink-0">
          <button
            onClick={() => setIsHamburgerMenuOpen(true)}
            className="w-10 h-10 rounded-2xl bg-gray-50 hover:bg-sky-50 text-gray-700 hover:text-[#3b96cc] border border-gray-200 hover:border-sky-200 flex items-center justify-center transition-all shadow-2xs group cursor-pointer active:scale-95"
            title="منو"
            aria-label="منو"
          >
            <Menu className="w-5 h-5 text-gray-700 group-hover:text-[#3b96cc] transition-colors" />
          </button>
        </div>

        {/* Center: Brand Logo + Social Man (Centered in flex flow, never overlaps) */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex-1 flex items-center justify-center gap-2 cursor-pointer select-none min-w-0"
        >
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-xs border border-gray-100 shrink-0">
            <img
              src="/app-icon.jpg"
              alt="Social Man"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-base sm:text-lg font-black text-gray-900 tracking-tight font-sans truncate">
            Social Man
          </span>
        </div>

        {/* Left side: User Auth */}
        <div className="w-auto flex items-center justify-end shrink-0">
          {/* User Auth Profile / Login Button */}
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
                  <span className="text-xs font-black text-gray-900 block group-hover:text-[#3b96cc] transition-colors">
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
                      className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-[#3b96cc] cursor-pointer group/avatar shrink-0 mb-2 bg-sky-100"
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
                  </div>

                  {/* Upload Profile Picture Action Button */}
                  <div className="space-y-1.5">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#3b96cc] text-xs font-black transition-colors"
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
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-[#3b96cc] hover:bg-[#2c7ead] shadow-xs transition-all active:scale-95 whitespace-nowrap"
            >
              <Smartphone className="w-3.5 h-3.5 text-white" />
              <span>ورود</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

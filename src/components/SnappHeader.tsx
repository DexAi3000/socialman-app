"use client";

import React, { useId, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  ChevronDown,
  LogOut,
  Smartphone,
  Camera,
  Trash2,
  Menu,
  Home,
  CalendarDays,
  ClipboardCheck,
  Sparkles,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';
import type { AppTab } from '@/types';
import { PublishGlyph } from './SnappIcons';
import { NotificationBell } from './NotificationBell';

// Clean Minimalist User Outline Avatar
function DefaultAvatarGraphic() {
  return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1e293b"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[60%] h-[60%]"
      >
        <circle cx="12" cy="7.8" r="3.8" />
        <path d="M5.2 20.2a6.8 6.8 0 0 1 13.6 0" />
      </svg>
    </div>
  );
}

interface SnappHeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const desktopLinks = [
  { id: 'dashboard', label: 'خانه', icon: Home },
  { id: 'publish', label: 'انتشار', icon: PublishGlyph },
  { id: 'calendar', label: 'تقویم', icon: CalendarDays },
  { id: 'client-portal', label: 'کارفرما', icon: ClipboardCheck },
  { id: 'ai-studio', label: 'استودیو', icon: Sparkles },
] as const;

export function SnappHeader({ activeTab, setActiveTab }: SnappHeaderProps) {
  const {
    currentUser,
    logoutUser,
    updateUserAvatar,
    setIsHamburgerMenuOpen,
  } = useApp();

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const profilePanelId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsUserDropdownOpen(false);
        profileButtonRef.current?.focus();
      }
    }

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserDropdownOpen]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) return;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 320;
          let w = img.width;
          let h = img.height;
          if (w > h) {
            if (w > maxDim) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            }
          } else {
            if (h > maxDim) {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            updateUserAvatar(compressed);
          } else {
            updateUserAvatar(event.target?.result as string);
          }
          setIsUserDropdownOpen(false);
        };
        img.src = event.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/85 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto grid h-14 w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3.5 sm:px-6 lg:h-[4.25rem] lg:gap-4 lg:px-8">
        <div className="col-start-1 row-start-1 flex items-center gap-3 justify-self-start">
          <button
            type="button"
            onClick={() => setIsHamburgerMenuOpen(true)}
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-800"
            title="منو"
            aria-label="منو"
          >
            <Menu className="size-5" strokeWidth={1.8} />
          </button>
        </div>

        <button
          type="button"
          aria-label="خانهٔ سوشال‌من"
          onClick={() => setActiveTab('dashboard')}
          className="col-start-2 row-start-1 inline-flex min-h-11 cursor-pointer items-center gap-2 justify-self-center rounded-xl px-1 lg:col-start-1 lg:ms-12 lg:justify-self-start"
        >
          <span className="size-8 shrink-0 overflow-hidden rounded-lg md:size-9">
            <img
              src="/socialman/app-icon.jpg"
              alt=""
              className="w-full h-full object-cover"
            />
          </span>
          <span dir="ltr" className="whitespace-nowrap text-sm font-black tracking-tight text-slate-900 lg:text-lg">
            Social Man
          </span>
        </button>

        <nav aria-label="بخش‌های اصلی" className="col-start-2 row-start-1 hidden items-center gap-1 lg:flex">
          {desktopLinks.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={activeTab === id ? 'page' : undefined}
              onClick={() => setActiveTab(id)}
              className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-sm font-bold transition-colors lg:px-3 ${activeTab === id ? 'bg-sky-100 text-sky-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </nav>

        {/* Left side: User Auth */}
        <div className="relative col-start-3 row-start-1 flex min-w-0 items-center gap-0.5 justify-self-end sm:gap-1">
          {currentUser?.isLoggedIn && <NotificationBell key={currentUser.id} onNavigate={setActiveTab} />}
          {/* User Auth Profile / Login Button */}
          {currentUser?.isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              {/* Invisible backdrop overlay to capture outside taps/clicks immediately */}
              {isUserDropdownOpen && (
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setIsUserDropdownOpen(false)}
                  aria-hidden="true"
                />
              )}

              {/* Hidden File Input for Avatar Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />

              <button
                ref={profileButtonRef}
                type="button"
                aria-label="حساب کاربری"
                aria-expanded={isUserDropdownOpen}
                aria-controls={isUserDropdownOpen ? profilePanelId : undefined}
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="relative z-50 flex min-h-11 max-w-full cursor-pointer items-center gap-1.5 rounded-xl p-1 hover:bg-slate-100 md:gap-2 md:px-2"
              >
                {/* Outline User Avatar or Uploaded Photo */}
                <div className="size-8 rounded-xl overflow-hidden border border-slate-200/90 bg-white shrink-0 relative sm:size-9 flex items-center justify-center shadow-xs">
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
                <span className="hidden max-w-24 truncate text-sm font-bold text-slate-800 lg:block xl:max-w-36">{currentUser.fullName}</span>
                <ChevronDown className="hidden size-3.5 shrink-0 text-slate-500 sm:block" />
              </button>

              {/* User Dropdown with Avatar Upload Control */}
              {isUserDropdownOpen && (
                <div id={profilePanelId} className="absolute end-0 top-full z-50 mt-2 w-64 space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                  {/* Avatar & User Details */}
                  <div className="flex flex-col items-center text-center p-2 border-b border-gray-100">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-xs border-2 border-slate-200 hover:border-[#3b96cc] cursor-pointer group/avatar shrink-0 mb-2 bg-white flex items-center justify-center"
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

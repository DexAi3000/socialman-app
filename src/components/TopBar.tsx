"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Bell,
  Sparkles,
  Calendar,
  Crown,
  Plus,
  Flame,
  Menu,
} from 'lucide-react';
import { InstagramIcon, TelegramIcon } from '@/components/SocialIcons';
import { toPersianDigits } from '@/lib/utils';

interface TopBarProps {
  onOpenAiStudio: () => void;
  onOpenMobileMenu?: () => void;
  activeTab: string;
}

export function TopBar({ onOpenAiStudio, onOpenMobileMenu, activeTab }: TopBarProps) {
  const { activeWorkspace, currentPlan, openUpgradeModal } = useApp();

  const tabTitles: Record<string, string> = {
    dashboard: 'داشبورد تحلیلی و مانیتورینگ',
    'ai-studio': 'استودیوی تولید محتوای هوش مصنوعی',
    calendar: 'تقویم محتوایی شمسی (آذر ۱۴۰۳)',
    'client-portal': 'پورتال اختصاصی تایید کارفرما',
    pricing: 'تعرفه‌ها و ارتقای اشتراک',
  };

  return (
    <header className="h-16 w-full border-b border-white/[0.08] bg-[#080c14]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Right side: Page Title & Mobile Menu Button */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <span>{tabTitles[activeTab] || 'داشبورد'}</span>
          </h1>
          <span className="text-[11px] text-slate-400 hidden sm:block">
            پیج فعال: <strong className="text-indigo-300">{activeWorkspace.name}</strong>
          </span>
        </div>
      </div>

      {/* Middle side: Live Stats Pills */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
          <InstagramIcon className="w-4 h-4 text-pink-500" />
          <span className="text-slate-300 font-mono text-[11px]">@academy.roshd</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="text-slate-400 font-mono text-[11px]">
            {toPersianDigits('۲۴.۸K')} فالوور
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
          <TelegramIcon className="w-4 h-4 text-sky-400" />
          <span className="text-slate-300 font-mono text-[11px]">t.me/roshd_channel</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="text-slate-400 font-mono text-[11px]">
            {toPersianDigits('۱۲.۳K')} ممبر
          </span>
        </div>
      </div>

      {/* Left side: Quick Action Button & Notification */}
      <div className="flex items-center gap-3">
        {currentPlan === 'free' && (
          <button
            onClick={() => openUpgradeModal('pro')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all shadow-sm"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>ارتقا به نقره‌ای</span>
          </button>
        )}

        <button
          onClick={onOpenAiStudio}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="hidden sm:inline">پست جدید با هوش مصنوعی</span>
          <span className="sm:hidden">پست جدید</span>
        </button>

        <div className="relative">
          <button
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
            title="اعلان‌ها"
          >
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#080c14]" />
        </div>
      </div>
    </header>
  );
}

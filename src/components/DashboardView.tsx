"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Zap,
  Search,
  Link2,
} from 'lucide-react';
import { SnappHero } from '@/components/SnappHero';
import { SnappCategoryTabs } from '@/components/SnappCategoryTabs';
import { SnappTilesGrid } from '@/components/SnappTilesGrid';
import {
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
  BaleIcon,
  RubikaIcon,
} from '@/components/SocialIcons';
import { toPersianDigits, IRANIAN_EVENTS } from '@/lib/utils';
import { SocialPlatform, PostStatus } from '@/types';

interface DashboardViewProps {
  onNavigateTab: (tab: 'dashboard' | 'publish' | 'ai-studio' | 'calendar' | 'pricing' | 'client-portal') => void;
  onSetAiPlatform?: (platform: SocialPlatform) => void;
}

export function DashboardView({ onNavigateTab, onSetAiPlatform }: DashboardViewProps) {
  const { posts, activeWorkspace, openConnectModal } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const workspacePosts = posts.filter(
    (p) =>
      p.workspaceId === activeWorkspace.id &&
      (activeCategory === 'all' || activeCategory === 'more' || p.platform === activeCategory)
  );

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'instagram':
        return <InstagramIcon className="w-4 h-4 text-pink-500" />;
      case 'telegram':
        return <TelegramIcon className="w-4 h-4 text-sky-500" />;
      case 'whatsapp':
        return <WhatsappIcon className="w-4 h-4 text-[#25D366]" />;
      case 'rubika':
        return <RubikaIcon className="w-4 h-4 text-purple-500" />;
      case 'bale':
        return <BaleIcon className="w-4 h-4 text-teal-600" />;
    }
  };

  const getPlatformName = (platform: SocialPlatform) => {
    const names: Record<SocialPlatform, string> = {
      instagram: 'اینستاگرام',
      telegram: 'تلگرام',
      whatsapp: 'واتساپ',
      rubika: 'روبیکا',
      bale: 'بله',
    };
    return names[platform] || platform;
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#21aa58] border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#21aa58] animate-pulse" />
            تایید شده
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            در انتظار تایید کارفرما
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
            پیش‌نویس
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
            منتشر شده
          </span>
        );
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    if (serviceId === 'publish') {
      onNavigateTab('publish');
    } else if (['instagram', 'telegram', 'whatsapp', 'rubika', 'bale'].includes(serviceId)) {
      onNavigateTab('publish');
    } else if (serviceId === 'ai-studio') {
      onNavigateTab('ai-studio');
    } else if (serviceId === 'calendar') {
      onNavigateTab('calendar');
    } else if (serviceId === 'client-portal') {
      onNavigateTab('client-portal');
    } else if (serviceId === 'pricing') {
      onNavigateTab('pricing');
    }
  };

  return (
    <div className="space-y-6">
      {/* 0. Mobile Search Bar (Directly matching Snapp mobile app top bar) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-2">
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-gray-400 flex-1">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="جست‌وجو در کانال‌ها، زمان‌بندی‌ها و ابزارهای انتشار سوشال‌من..."
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 outline-none text-right"
            />
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Sparkles className="w-4 h-4 fill-purple-600" />
          </div>
        </div>
      </div>

      {/* 1. Snapp Hero Section (3D Character + Headline) */}
      <SnappHero
        onOpenPublish={() => onNavigateTab('publish')}
        onOpenCalendar={() => onNavigateTab('calendar')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
        {/* 2. Snapp-Style Promo Banner (Matching Screenshot emerald banner) */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-5 sm:p-7 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-right z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30">
              <span>هاب متمرکز سوشال‌من</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h3 className="text-sm sm:text-lg font-black tracking-tight text-white">
              انتشار و زمان‌بندی همزمان در ۵ پلتفرم با ۱ کلیک 🚀
            </h3>
            <p className="text-xs text-emerald-100 font-medium leading-relaxed">
              اینستاگرام، تلگرام، واتساپ، روبیکا و بله را با یک کلیک مدیریت کنید و طبق تقویم شمسی منتشر کنید.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('publish')}
            className="px-6 py-3 rounded-2xl bg-[#21aa58] hover:bg-[#1e9b50] text-white font-black text-xs sm:text-sm shadow-lg shadow-[#21aa58]/35 transition-transform active:scale-95 shrink-0 z-10"
          >
            شروع انتشار همزمان 🚀
          </button>
        </div>

        {/* 2.5 Quick Account Connection Strip */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 px-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#21aa58] flex items-center justify-center shrink-0">
              <Link2 className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-gray-900 block">
                وضعیت کانال‌های متصل به پیج {activeWorkspace.name}
              </span>
              <span className="text-[10px] text-gray-400">
                هر ۵ پلتفرم (اینستاگرام، تلگرام، واتساپ، روبیکا، بله) برای انتشار خودکار متصل و فعال هستند
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openConnectModal()}
            className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#21aa58] text-xs font-black transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>تنظیم و اتصال اکانت‌ها</span>
          </button>
        </div>

        {/* 3. Snapp 3-Column Large Cards + 4 Secondary Cards (Matching Screenshot) */}
        <SnappTilesGrid onSelectService={handleServiceSelect} />

        {/* 4. Snapp Category Icon Tabs (Horizontal Slider with Green Active Line) */}
        <SnappCategoryTabs
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* 4. Scheduled Posts Timeline in Clean Snapp Light Cards */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#212121]">
                پست‌های آماده و زمان‌بندی شده در تقویم
              </h3>
              <p className="text-xs text-[#757575] font-medium">
                نوبت انتشار در ۵ شبکه فعال ({activeWorkspace.name})
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="text-xs font-black text-[#21aa58] hover:underline flex items-center gap-1"
            >
              مشاهده تقویم کامل
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {workspacePosts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-gray-200 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-white border border-gray-200 shrink-0 mt-0.5 shadow-xs">
                    {getPlatformIcon(post.platform)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-[#212121] line-clamp-1">
                        {post.title}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        ({getPlatformName(post.platform)})
                      </span>
                    </div>
                    <p className="text-xs text-[#616161] line-clamp-1 mb-1.5 leading-relaxed">
                      {post.hook || post.content}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono">
                      <span>📅 {post.scheduledDateShamsi}</span>
                      <span>⏰ ساعت {toPersianDigits(post.scheduledTime)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  {getStatusBadge(post.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Iranian Events & Marketing Opportunities */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black text-[#212121]">
                مناسبت‌های ملی و پیک‌های فروش آذرماه (پیشنهادی اسنپ)
              </h3>
            </div>
            <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full font-black">
              کمپین پاییزه
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {IRANIAN_EVENTS.slice(0, 3).map((evt, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-xs transition-all ${
                  evt.type === 'hot'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-900 shadow-xs'
                    : 'bg-gray-50 border-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center justify-between font-black mb-1">
                  <span>{toPersianDigits(evt.day)} {evt.month}</span>
                  {evt.type === 'hot' && (
                    <span className="text-[10px] text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full font-black">
                      🔥 شب یلدا
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 line-clamp-1">{evt.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

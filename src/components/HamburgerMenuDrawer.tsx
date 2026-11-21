"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  X,
  Home,
  Share2,
  Calendar,
  Users,
  Sparkles,
  Crown,
  CreditCard,
  Link2,
  Headphones,
  MessageSquare,
  LogOut,
  ChevronLeft,
  CheckCircle2,
  Layers,
  HelpCircle,
  PhoneCall,
  Zap,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';
import { SocialPlatform } from '@/types';

interface HamburgerMenuDrawerProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export function HamburgerMenuDrawer({
  activeTab,
  setActiveTab,
}: HamburgerMenuDrawerProps) {
  const {
    isHamburgerMenuOpen,
    setIsHamburgerMenuOpen,
    currentUser,
    currentPlan,
    workspaces,
    activeWorkspace,
    setActiveWorkspaceId,
    posts,
    openUpgradeModal,
    openConnectModal,
    openAuthModal,
    logoutUser,
  } = useApp();

  if (!isHamburgerMenuOpen) return null;

  const pendingApprovals = posts.filter(
    (p) => p.status === 'pending_approval'
  ).length;

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsHamburgerMenuOpen(false);
  };

  const navMenuItems = [
    {
      id: 'dashboard',
      label: 'داشبورد اصلی',
      desc: 'مرور کلی وضعیت کانال‌ها و آمار',
      icon: Home,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'publish',
      label: 'انتشار همزمان ۵ پلتفرم',
      desc: 'ارسال همزمان به اینستاگرام، تلگرام، بله، روبیکا و واتساپ',
      icon: Share2,
      badge: 'اصلی 🚀',
      badgeColor: 'bg-emerald-100 text-[#21aa58]',
    },
    {
      id: 'calendar',
      label: 'تقویم محتوایی شمسی',
      desc: 'زمان‌بندی و مدیریت هوشمند ماه آذر',
      icon: Calendar,
      badge: 'آذر ۱۴۰۳',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'client-portal',
      label: 'پورتال تایید کارفرما',
      desc: 'لینک اختصاصی تایید پست‌ها قبل از ارسال',
      icon: Users,
      badge: pendingApprovals > 0 ? `${toPersianDigits(pendingApprovals)} در انتظار` : null,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'ai-studio',
      label: 'استودیوی هوش مصنوعی Gemini',
      desc: 'تولید هوشمند متن، هوک و کپشن',
      icon: Sparkles,
      badge: 'پلن طلایی 👑',
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
    },
    {
      id: 'pricing',
      label: 'تعرفه‌ها و پلن‌های اشتراک',
      desc: 'ارتقای حساب و مشاهده ویژگی‌های پلن‌ها',
      icon: CreditCard,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'support',
      label: 'پشتیبانی (تیکت و چت‌بات)',
      desc: 'گفتگوی آنلاین ۲۴ ساعته و ارسال تیکت',
      icon: Headphones,
      badge: '۲۴/۷ آنلاین ⚡',
      badgeColor: 'bg-indigo-100 text-indigo-700 font-black',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Dark backdrop blur */}
      <div
        onClick={() => setIsHamburgerMenuOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Sliding Drawer Container from Right (RTL) */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header with 3 Highlighted Sections: User & Plan, Workspace Selector, Support Hub */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-b from-emerald-50/70 to-white flex flex-col gap-3">
          {/* Top Bar: Title + Close Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#21aa58] flex items-center justify-center text-white shadow-xs">
                <Share2 className="w-4 h-4 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 leading-tight">
                  سوشال‌من<span className="text-[#21aa58]">!</span>
                </span>
                <span className="text-[10px] text-gray-400 font-bold">منوی دسترسی سریع</span>
              </div>
            </div>
            <button
              onClick={() => setIsHamburgerMenuOpen(false)}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. User Card & Plan Status (پلن اشتراک) */}
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-100 overflow-hidden border border-white shadow-xs shrink-0 flex items-center justify-center">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-black text-[#21aa58]">
                    {currentUser?.fullName?.charAt(0) || 'س'}
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-gray-900 block truncate max-w-[130px]">
                  {currentUser?.fullName || 'کاربر مهمان'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono block">
                  {currentUser?.phone ? toPersianDigits(currentUser.phone) : 'ورود نکرده'}
                </span>
              </div>
            </div>

            {/* Plan Badge & Upgrade Action */}
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  currentPlan === 'agency'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : currentPlan === 'pro'
                    ? 'bg-emerald-100 text-[#21aa58]'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {currentPlan === 'agency' ? (
                  <Crown className="w-3 h-3 text-amber-600 fill-amber-600" />
                ) : (
                  <Zap className="w-3 h-3 text-[#21aa58] fill-[#21aa58]" />
                )}
                <span>
                  {currentPlan === 'agency'
                    ? 'پلن: طلایی'
                    : currentPlan === 'pro'
                    ? 'پلن: نقره‌ای'
                    : 'پلن: برنز (رایگان)'}
                </span>
              </span>
              <button
                onClick={() => {
                  setIsHamburgerMenuOpen(false);
                  openUpgradeModal('agency');
                }}
                className="text-[9px] text-[#21aa58] font-black hover:underline cursor-pointer"
              >
                ارتقای پلن ⚡
              </button>
            </div>
          </div>

          {/* 2. Workspace Selector (پیج کاری و برند فعال) */}
          <div className="bg-gray-50/90 rounded-2xl p-2.5 border border-gray-100 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-gray-500">
                پیج کاری / برند فعال:
              </span>
              <span className="text-[10px] font-black text-[#21aa58] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 truncate max-w-[150px]">
                {activeWorkspace.name}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => setActiveWorkspaceId(ws.id)}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-bold text-right transition-all flex items-center justify-between border cursor-pointer ${
                    ws.id === activeWorkspace.id
                      ? 'bg-white border-[#21aa58] text-[#21aa58] font-black shadow-xs'
                      : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === activeWorkspace.id && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#21aa58] shrink-0 mr-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Support Hub (پشتیبانی: تیکت و چت‌بات) */}
          <button
            onClick={() => handleSelectTab('support')}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-l from-emerald-600 to-[#21aa58] text-white shadow-md shadow-emerald-600/20 hover:brightness-105 transition-all text-right group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black block">پشتیبانی (تیکت و چت‌بات)</span>
                <span className="text-[10px] text-emerald-100 font-medium">
                  پاسخگویی هوشمند ۲۴ ساعته و ارسال تیکت
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-white text-[#21aa58] px-2.5 py-1 rounded-full font-black shadow-xs shrink-0">
              ورود به پشتیبانی
            </span>
          </button>
        </div>

        {/* Drawer Menu List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-1.5 flex-1">
          <span className="text-[10px] font-bold text-gray-400 block px-2 mb-2 text-right">
            دسترسی سریع به بخش‌ها:
          </span>

          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-right group ${
                  isActive
                    ? 'bg-emerald-50 text-[#21aa58] font-black shadow-xs border border-emerald-100'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-[#21aa58] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black block">{item.label}</span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {item.desc}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-black ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronLeft
                    className={`w-4 h-4 transition-transform group-hover:-translate-x-0.5 ${
                      isActive ? 'text-[#21aa58]' : 'text-gray-300'
                    }`}
                  />
                </div>
              </button>
            );
          })}

          {/* Quick Action: Connect Channels Modal */}
          <div className="pt-2">
            <button
              onClick={() => {
                setIsHamburgerMenuOpen(false);
                openConnectModal();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 text-[#21aa58] text-right font-black text-xs hover:shadow-xs transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#21aa58] text-white flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="block">اتصال کانال‌های ۵ پلتفرم</span>
                  <span className="text-[10px] text-emerald-700 font-medium font-mono">
                    تلگرام، اینستاگرام، روبیکا، واتساپ، بله
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200/60 text-[#21aa58] font-bold">
                تنظیمات
              </span>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-400 font-medium text-[11px]">
            <span>نسخه اپ: v18.40</span>
            <span>•</span>
            <span className="text-[#21aa58] font-bold">پشتیبانی فعال</span>
          </div>

          {currentUser?.isLoggedIn ? (
            <button
              onClick={() => {
                logoutUser();
                setIsHamburgerMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-gray-500 hover:text-rose-600 transition-colors font-bold text-[11px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج از حساب</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                onClick={() => setIsHamburgerMenuOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#21aa58] font-black text-[11px] border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                صفحه ورود
              </Link>
              <button
                onClick={() => {
                  openAuthModal();
                  setIsHamburgerMenuOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#21aa58] text-white font-black text-[11px] hover:bg-[#1e9b50] transition-colors cursor-pointer"
              >
                ورود سریع SMS.ir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

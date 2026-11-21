"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, Calendar, LayoutDashboard, Crown, Users, Plus, Check } from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';
import { SocialPlatform } from '@/types';

interface HeaderProps {
  activeTab: 'dashboard' | 'ai-studio' | 'calendar' | 'pricing' | 'client-portal';
  setActiveTab: (tab: 'dashboard' | 'ai-studio' | 'calendar' | 'pricing' | 'client-portal') => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const {
    currentPlan,
    aiUsageCount,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    openUpgradeModal,
    addWorkspace,
    canAddWorkspace,
  } = useApp();

  const [isAddWsOpen, setIsAddWsOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsCategory, setNewWsCategory] = useState('');

  const planBadgeDetails = {
    free: { name: 'پلن برنز (رایگان)', color: 'bg-slate-800 text-slate-300 border-slate-700' },
    pro: { name: 'پلن نقره‌ای (پرو)', color: 'bg-indigo-950/80 text-indigo-300 border-indigo-700' },
    agency: { name: 'پلن طلایی (آژانس)', color: 'bg-amber-950/80 text-amber-300 border-amber-600' },
  }[currentPlan];

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    const success = addWorkspace(newWsName, newWsCategory || 'عمومی', ['instagram', 'telegram']);
    if (success) {
      setNewWsName('');
      setNewWsCategory('');
      setIsAddWsOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                سوشال من
              </span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
                نسخه فارسی
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              مدیریت و تقویم محتوای شبکه‌های اجتماعی با هوش مصنوعی
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            داشبورد
          </button>

          <button
            onClick={() => setActiveTab('ai-studio')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'ai-studio'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            استودیو هوش مصنوعی
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'calendar'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            تقویم محتوایی شمسی
          </button>

          <button
            onClick={() => setActiveTab('client-portal')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'client-portal'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4 text-sky-400" />
            پورتال کارفرما
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'pricing'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            پلن‌ها و تعرفه‌ها
          </button>
        </nav>

        {/* Workspace & Subscription Actions */}
        <div className="flex items-center gap-3">
          {/* Workspace Switcher */}
          <div className="relative">
            <select
              value={activeWorkspaceId}
              onChange={(e) => {
                if (e.target.value === 'ADD_NEW') {
                  setIsAddWsOpen(true);
                } else {
                  setActiveWorkspaceId(e.target.value);
                }
              }}
              className="bg-slate-900 border border-slate-700/80 text-xs sm:text-sm text-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-indigo-500 cursor-pointer"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
              <option value="ADD_NEW">+ افزودن برند جدید...</option>
            </select>
          </div>

          {/* Current Plan Badge & Upgrade Action */}
          <div className="flex items-center gap-2">
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${planBadgeDetails.color}`}
            >
              <Crown className="w-3.5 h-3.5" />
              {planBadgeDetails.name}
              {currentPlan === 'free' && (
                <span className="opacity-75 font-mono">
                  ({toPersianDigits(aiUsageCount)}/۱۰)
                </span>
              )}
            </span>

            {currentPlan !== 'agency' && (
              <button
                onClick={() => openUpgradeModal('pro')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/20 transition-transform active:scale-95"
              >
                <Crown className="w-3.5 h-3.5" />
                ارتقای اشتراک
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-900/95 py-2 px-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          داشبورد
        </button>
        <button
          onClick={() => setActiveTab('ai-studio')}
          className={`flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'ai-studio' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          استودیو AI
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'calendar' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          تقویم
        </button>
        <button
          onClick={() => setActiveTab('client-portal')}
          className={`flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'client-portal' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          کارفرما
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'pricing' ? 'text-indigo-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Crown className="w-4 h-4" />
          پلن‌ها
        </button>
      </div>

      {/* New Workspace Modal */}
      {isAddWsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">افزودن برند یا پیج جدید</h3>
            <p className="text-xs text-slate-400 mb-4">
              {currentPlan === 'free'
                ? 'پلن فعلی شما برنز است (حداکثر ۱ برند). برای افزودن برند بیشتر نیاز به ارتقا دارید.'
                : 'مشخصات برند یا صفحه اینستاگرامی مورد نظر را وارد کنید.'}
            </p>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">نام برند / پیج</label>
                <input
                  type="text"
                  placeholder="مثلاً: پوشاک مهام"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">حوزه کاری</label>
                <input
                  type="text"
                  placeholder="مثلاً: مد و پوشاک یا بازرگانی"
                  value={newWsCategory}
                  onChange={(e) => setNewWsCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddWsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30"
                >
                  ایجاد برند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

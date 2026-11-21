"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  Users,
  Crown,
  ChevronDown,
  Plus,
  Zap,
  CheckCircle2,
  Settings,
  Bell,
  Search,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';
import { PlanType } from '@/types';

interface SidebarProps {
  activeTab: 'dashboard' | 'ai-studio' | 'calendar' | 'pricing' | 'client-portal';
  setActiveTab: (tab: 'dashboard' | 'ai-studio' | 'calendar' | 'pricing' | 'client-portal') => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const {
    currentPlan,
    aiUsageCount,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    openUpgradeModal,
    addWorkspace,
    posts,
  } = useApp();

  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);
  const [isNewWsModalOpen, setIsNewWsModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsCategory, setNewWsCategory] = useState('');

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const pendingCount = posts.filter((p) => p.status === 'pending_approval').length;

  const planDetails: Record<PlanType, { label: string; color: string; badge: string }> = {
    free: { label: 'پلن برنز (رایگان)', color: 'from-slate-700 to-slate-800', badge: 'bg-slate-800 text-slate-300 border-slate-700' },
    pro: { label: 'پلن نقره‌ای (پرو)', color: 'from-indigo-600 to-purple-600', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    agency: { label: 'پلن طلایی (آژانس)', color: 'from-amber-500 to-orange-500', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'داشبورد و آمار',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'ai-studio',
      label: 'استودیوی هوش مصنوعی',
      icon: Sparkles,
      badge: 'Gemini ✨',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'calendar',
      label: 'تقویم محتوایی شمسی',
      icon: Calendar,
      badge: toPersianDigits(posts.length),
      badgeColor: 'bg-slate-800 text-slate-400 border-slate-700',
    },
    {
      id: 'client-portal',
      label: 'پورتال تایید کارفرما',
      icon: Users,
      badge: pendingCount > 0 ? `${toPersianDigits(pendingCount)} در انتظار` : 'آژانس',
      badgeColor: pendingCount > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700',
    },
    {
      id: 'pricing',
      label: 'تعرفه‌ها و ارتقای اشتراک',
      icon: Crown,
      badge: 'ویژه',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ];

  const handleCreateWs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    const ok = addWorkspace(newWsName, newWsCategory || 'عمومی', ['instagram', 'telegram']);
    if (ok) {
      setNewWsName('');
      setNewWsCategory('');
      setIsNewWsModalOpen(false);
      setIsWsDropdownOpen(false);
    }
  };

  return (
    <>
      <aside className="w-72 hidden lg:flex flex-col justify-between shrink-0 h-screen sticky top-0 bg-[#0c121e]/90 border-l border-white/[0.08] backdrop-blur-2xl z-30 p-4">
        {/* Top Section */}
        <div className="space-y-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-[#0c121e]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-white tracking-tight">
                    سوشال من
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    SaaS
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium block">
                  دستیار محتوای هوشمند
                </span>
              </div>
            </div>
          </div>

          {/* Workspace Switcher Card */}
          <div className="relative">
            <button
              onClick={() => setIsWsDropdownOpen(!isWsDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-all text-right group"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-800 border border-white/10 flex items-center justify-center text-xs font-black text-indigo-300 shrink-0">
                  {activeWs.name.charAt(0)}
                </div>
                <div className="truncate">
                  <span className="text-xs font-bold text-white block truncate">
                    {activeWs.name}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {activeWs.category}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                  isWsDropdownOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isWsDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 p-1.5 rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl z-50 space-y-1">
                <span className="text-[10px] text-slate-400 px-2 py-1 block font-semibold">
                  برندها و پیج‌های کاری:
                </span>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspaceId(ws.id);
                      setIsWsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-right transition-colors ${
                      ws.id === activeWorkspaceId
                        ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span>{ws.name}</span>
                    {ws.id === activeWorkspaceId && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                  </button>
                ))}
                <div className="pt-1 border-t border-white/[0.08]">
                  <button
                    onClick={() => {
                      setIsWsDropdownOpen(false);
                      setIsNewWsModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن پیج / برند جدید</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all relative group ${
                    isActive
                      ? 'bg-gradient-to-l from-indigo-600/20 via-indigo-600/15 to-transparent text-white border-r-4 border-indigo-500 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                          : 'bg-white/[0.04] text-slate-400 group-hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Plan Quota Card & User Profile */}
        <div className="space-y-3 pt-3 border-t border-white/[0.08]">
          {/* Plan Usage Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-200">
                {planDetails[currentPlan].label}
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-bold">
                {currentPlan === 'free' ? `${toPersianDigits(aiUsageCount)} / ۱۰` : 'نامحدود'}
              </span>
            </div>

            {currentPlan === 'free' ? (
              <div className="space-y-2">
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (aiUsageCount / 10) * 100)}%` }}
                  />
                </div>
                <button
                  onClick={() => openUpgradeModal('pro')}
                  className="w-full py-2 rounded-xl text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>ارتقای نامحدود هوش مصنوعی</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] text-sky-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تمام امکانات نامحدود فعال است</span>
              </div>
            )}
          </div>

          {/* User Profile Mini Bar */}
          <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                ن
              </div>
              <div>
                <span className="text-xs font-bold text-white block">نیما محمدی</span>
                <span className="text-[10px] text-slate-400 block">مدیر سوشال مدیا</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('pricing')}
              className="p-1.5 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
              title="تنظیمات اشتراک"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* New Workspace Modal */}
      {isNewWsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">افزودن پیج یا برند جدید</h3>
            <p className="text-xs text-slate-400">
              {currentPlan === 'free'
                ? 'پلن رایگان شامل ۱ برند است. با ارتقا به پلن حرفه‌ای می‌توانید تا ۵ پیج کاری اضافه کنید.'
                : 'مشخصات برند جدید را جهت تفکیک محتواها وارد کنید.'}
            </p>
            <form onSubmit={handleCreateWs} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">نام پیج / برند</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: کافه راشا"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">دسته فعالیت</label>
                <input
                  type="text"
                  placeholder="مثلاً: رستوران و غذا"
                  value={newWsCategory}
                  onChange={(e) => setNewWsCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewWsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:bg-white/[0.05]"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  افزودن برند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  CalendarDays, ChevronLeft, ClipboardCheck, CreditCard, Crown, Headphones, Home,
  LayoutDashboard, Link2, LogOut, MessageSquare, Sparkles, X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toPersianDigits } from '@/lib/utils';
import { daysRemaining } from '@/lib/subscription';
import type { AppTab } from '@/types';
import { PublishGlyph } from './SnappIcons';

interface HamburgerMenuDrawerProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const primaryLinks = [
  { id: 'dashboard', label: 'خانه', icon: Home },
  { id: 'publish', label: 'انتشار و زمان‌بندی', icon: PublishGlyph },
  { id: 'directs', label: 'دایرکت هوشمند مشتریان (AI)', icon: MessageSquare },
  { id: 'calendar', label: 'تقویم محتوا', icon: CalendarDays },
  { id: 'client-portal', label: 'تأیید کارفرما', icon: ClipboardCheck },
  { id: 'ai-studio', label: 'هوش مصنوعی', icon: Sparkles },
] as const;

const planNames = { free: 'اشتراک برنز', pro: 'اشتراک نقره‌ای', agency: 'اشتراک طلایی' };

export function HamburgerMenuDrawer({ activeTab, setActiveTab }: HamburgerMenuDrawerProps) {
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
    logoutUser,
  } = useApp();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isHamburgerMenuOpen || !dialog) return;

    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    closeButtonRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isHamburgerMenuOpen]);

  function closeMenu() {
    setIsHamburgerMenuOpen(false);
  }

  function navigate(tab: AppTab) {
    closeMenu();
    setActiveTab(tab);
  }

  const pendingApprovals = posts.filter((post) => post.status === 'pending_approval').length;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="app-menu-title"
      onCancel={(event) => {
        event.preventDefault();
        closeMenu();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeMenu();
      }}
      className="fixed inset-y-0 start-0 end-auto m-0 h-dvh max-h-none w-full max-w-[24rem] overflow-hidden border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/40"
    >
      {isHamburgerMenuOpen && (
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2">
            <div className="flex items-center gap-2.5">
              <img src="/socialman/app-icon.jpg" alt="" className="size-9 rounded-xl" />
              <h2 id="app-menu-title" className="text-base font-black">منوی سوشال‌من</h2>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="بستن منو"
              onClick={closeMenu}
              className="grid size-11 cursor-pointer place-items-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-sky-600"
            >
              <X aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
            <button
              type="button"
              aria-current={activeTab === 'workspace' ? 'page' : undefined}
              onClick={() => navigate('workspace')}
              className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-[#153550] p-3 text-start text-white transition-colors hover:bg-[#1a4a6f] focus-visible:outline-sky-600"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 text-sky-100">
                <LayoutDashboard aria-hidden="true" className="size-5" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black">میز کار محتوا</span>
                <span className="block truncate text-xs leading-6 text-sky-100">{activeWorkspace.name}</span>
              </span>
              <ChevronLeft aria-hidden="true" className="size-4 shrink-0 text-sky-100" />
            </button>

            {workspaces.length > 1 && (
              <label className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-700">
                فضای کاری فعال
                <select
                  value={activeWorkspace.id}
                  onChange={(event) => setActiveWorkspaceId(event.target.value)}
                  className="min-h-10 max-w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm text-slate-900"
                >
                  {workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
                </select>
              </label>
            )}

            <nav aria-label="بخش‌های سوشال‌من" className="space-y-1">
              {primaryLinks.map(({ id, label, icon: Icon }) => {
                const selected = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-current={selected ? 'page' : undefined}
                    onClick={() => navigate(id)}
                    className={`flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 text-start text-sm font-bold transition-colors ${selected ? 'bg-sky-50 text-sky-900' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${selected ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="size-[18px]" strokeWidth={1.8} />
                    </span>
                    <span className="flex-1">{label}</span>
                    {id === 'client-portal' && pendingApprovals > 0 && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-900">{toPersianDigits(pendingApprovals)} در انتظار</span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div role="group" aria-label="تنظیمات و پشتیبانی" className="space-y-1 border-t border-slate-200 pt-3">
              <button type="button" onClick={() => {
                closeMenu();
                openConnectModal();
              }} className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 text-start text-sm font-bold text-slate-700 hover:bg-slate-50">
                <Link2 aria-hidden="true" className="mx-1.5 size-[18px] text-slate-600" /> اتصال کانال‌ها
              </button>
              <button type="button" aria-current={activeTab === 'pricing' ? 'page' : undefined} onClick={() => navigate('pricing')} className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 text-start text-sm font-bold text-slate-700 hover:bg-slate-50 aria-[current=page]:bg-sky-50 aria-[current=page]:text-sky-900">
                <CreditCard aria-hidden="true" className="mx-1.5 size-[18px] text-slate-600" /> پلن‌ها و اشتراک
              </button>
              <button type="button" aria-current={activeTab === 'support' ? 'page' : undefined} onClick={() => navigate('support')} className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 text-start text-sm font-bold text-slate-700 hover:bg-slate-50 aria-[current=page]:bg-sky-50 aria-[current=page]:text-sky-900">
                <Headphones aria-hidden="true" className="mx-1.5 size-[18px] text-slate-600" /> پشتیبانی
              </button>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 border-t border-slate-200 bg-slate-50 px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="" className="size-9 shrink-0 rounded-lg object-cover" />
            ) : (
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <circle cx="12" cy="7.8" r="3.8" />
                  <path d="M5.2 20.2a6.8 6.8 0 0 1 13.6 0" />
                </svg>
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{currentUser?.fullName || 'کاربر مهمان'}</p>
              {currentPlan === 'agency' ? (
                <div className="flex flex-col">
                  <p className="inline-flex items-center gap-1 text-xs text-amber-900 font-bold">
                    <Crown aria-hidden="true" className="size-3.5 text-amber-500 fill-amber-500" />
                    {planNames[currentPlan]}
                  </p>
                  {currentUser?.subscription?.expiresAt && (
                    <span className="text-[10px] text-amber-800 font-bold">
                      {toPersianDigits(daysRemaining(currentUser.subscription.expiresAt))} روز باقی‌مانده
                    </span>
                  )}
                </div>
              ) : currentPlan === 'pro' ? (
                <div className="flex flex-col">
                  <p className="inline-flex items-center gap-1 text-xs text-sky-900 font-bold">
                    {planNames[currentPlan]}
                  </p>
                  {currentUser?.subscription?.expiresAt && (
                    <span className="text-[10px] text-sky-700 font-bold">
                      {toPersianDigits(daysRemaining(currentUser.subscription.expiresAt))} روز باقی‌مانده
                    </span>
                  )}
                </div>
              ) : (
                <button type="button" onClick={() => {
                  closeMenu();
                  openUpgradeModal('agency');
                }} className="inline-flex min-h-7 cursor-pointer items-center gap-1 rounded text-xs font-bold text-sky-800 hover:underline">
                  {planNames[currentPlan]} · ارتقا
                </button>
              )}
            </div>
            {currentUser?.isLoggedIn ? (
              <button type="button" onClick={() => {
                closeMenu();
                logoutUser();
              }} className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-rose-700 hover:bg-rose-100">
                <LogOut aria-hidden="true" className="size-4" /> خروج از حساب
              </button>
            ) : (
              <Link href="/login" onClick={closeMenu} className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 text-xs font-bold text-sky-800 hover:bg-sky-100">ورود / ثبت‌نام</Link>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

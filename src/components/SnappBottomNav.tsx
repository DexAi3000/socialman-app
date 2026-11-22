"use client";

import React from 'react';
import {
  Home,
  CalendarDays,
  ClipboardCheck,
  Lock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toPersianDigits } from '@/lib/utils';
import { PublishGlyph } from './SnappIcons';
import type { AppTab } from '@/types';

interface SnappBottomNavProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

function NavIcon({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 ${
        active
          ? 'bg-sky-100 text-sky-800'
          : 'text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700'
      }`}
    >
      {children}
    </span>
  );
}

export function SnappBottomNav({ activeTab, setActiveTab }: SnappBottomNavProps) {
  const { posts, currentPlan } = useApp();
  const pendingApprovals = posts.filter((p) => p.status === 'pending_approval').length;

  const isCalendarLocked = currentPlan === 'free';
  const isClientPortalLocked = currentPlan !== 'agency';

  return (
    <nav aria-label="بخش‌های اصلی" className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-3 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center">
        {/* Tab 1: Dashboard / Home */}
        <button
          onClick={() => setActiveTab('dashboard')}
          aria-current={activeTab === 'dashboard' ? 'page' : undefined}
          className={`group flex flex-col items-center gap-0.5 py-1 transition-all flex-1 active:scale-95 ${
            activeTab === 'dashboard' ? 'text-[#3b96cc] font-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <NavIcon active={activeTab === 'dashboard'}>
            <Home className="size-[18px]" strokeWidth={1.8} />
          </NavIcon>
          <span className="text-[11px] font-bold">خانه</span>
        </button>

        {/* Tab 2: Multi-Platform Publisher */}
        <button
          onClick={() => setActiveTab('publish')}
          aria-current={activeTab === 'publish' ? 'page' : undefined}
          className={`group flex flex-col items-center gap-0.5 py-1 transition-all flex-1 active:scale-95 ${
            activeTab === 'publish' ? 'text-[#3b96cc] font-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <NavIcon active={activeTab === 'publish'}>
            <PublishGlyph className="size-5" />
          </NavIcon>
          <span className="text-[11px] font-bold">انتشار ۵ پلتفرم</span>
        </button>

        {/* Tab 3: Calendar */}
        <button
          onClick={() => setActiveTab('calendar')}
          aria-current={activeTab === 'calendar' ? 'page' : undefined}
          className={`group flex flex-col items-center gap-0.5 py-1 transition-all flex-1 active:scale-95 relative ${
            activeTab === 'calendar' ? 'text-[#3b96cc] font-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <NavIcon active={activeTab === 'calendar'}>
              <CalendarDays className="size-[18px]" strokeWidth={1.8} />
            </NavIcon>
            {isCalendarLocked && (
              <span className="absolute -top-1 -end-2 flex size-3.5 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                <Lock className="size-2.5" />
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold">تقویم</span>
        </button>

        {/* Tab 4: Client Approval Portal */}
        <button
          onClick={() => setActiveTab('client-portal')}
          aria-current={activeTab === 'client-portal' ? 'page' : undefined}
          className={`group flex flex-col items-center gap-0.5 py-1 transition-all flex-1 relative active:scale-95 ${
            activeTab === 'client-portal' ? 'text-[#3b96cc] font-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <NavIcon active={activeTab === 'client-portal'}>
              <ClipboardCheck className="size-[18px]" strokeWidth={1.8} />
            </NavIcon>
            {isClientPortalLocked && (
              <span className="absolute -top-1 -end-2 flex size-3.5 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                <Lock className="size-2.5" />
              </span>
            )}
            {pendingApprovals > 0 && !isClientPortalLocked && (
              <span className="absolute -top-1 -end-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-bold text-amber-900">
                {toPersianDigits(pendingApprovals)}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold">کارفرما</span>
        </button>
      </div>
    </nav>
  );
}

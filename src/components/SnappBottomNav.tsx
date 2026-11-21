"use client";

import React from 'react';
import {
  Home,
  Calendar,
  Users,
  Share2,
  Lock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toPersianDigits } from '@/lib/utils';

interface SnappBottomNavProps {
  activeTab: 'dashboard' | 'publish' | 'ai-studio' | 'calendar' | 'pricing' | 'client-portal' | 'support';
  setActiveTab: (tab: any) => void;
}

export function SnappBottomNav({ activeTab, setActiveTab }: SnappBottomNavProps) {
  const { posts, currentPlan } = useApp();
  const pendingApprovals = posts.filter((p) => p.status === 'pending_approval').length;

  const isCalendarLocked = currentPlan === 'free';
  const isClientPortalLocked = currentPlan !== 'agency';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-3 py-2 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center">
        {/* Tab 1: Dashboard / Home */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 transition-all flex-1 active:scale-90 ${
            activeTab === 'dashboard' ? 'text-[#3b96cc] font-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${activeTab === 'dashboard' ? 'scale-110 stroke-[2.5]' : ''}`} />
          <span className="text-[11px] font-bold">خانه</span>
          {activeTab === 'dashboard' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b96cc] -mt-0.5" />
          )}
        </button>

        {/* Tab 2: Multi-Platform Publisher */}
        <button
          onClick={() => setActiveTab('publish')}
          className={`flex flex-col items-center gap-1 py-1 transition-all flex-1 active:scale-90 ${
            activeTab === 'publish' ? 'text-[#3b96cc] font-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Share2 className={`w-5 h-5 transition-transform ${activeTab === 'publish' ? 'scale-110 stroke-[2.5]' : ''}`} />
          <span className="text-[11px] font-bold">انتشار ۵ پلتفرم</span>
          {activeTab === 'publish' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b96cc] -mt-0.5" />
          )}
        </button>

        {/* Tab 3: Calendar */}
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 py-1 transition-all flex-1 active:scale-90 relative ${
            activeTab === 'calendar' ? 'text-[#3b96cc] font-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <Calendar className={`w-5 h-5 transition-transform ${activeTab === 'calendar' ? 'scale-110 stroke-[2.5]' : ''}`} />
            {isCalendarLocked && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] shadow-xs">
                <Lock className="w-2 h-2 fill-white stroke-[2.5]" />
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold">تقویم</span>
          {activeTab === 'calendar' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b96cc] -mt-0.5" />
          )}
        </button>

        {/* Tab 4: Client Approval Portal */}
        <button
          onClick={() => setActiveTab('client-portal')}
          className={`flex flex-col items-center gap-1 py-1 transition-all flex-1 relative active:scale-90 ${
            activeTab === 'client-portal' ? 'text-[#3b96cc] font-black' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 transition-transform ${activeTab === 'client-portal' ? 'scale-110 stroke-[2.5]' : ''}`} />
            {isClientPortalLocked && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] shadow-xs">
                <Lock className="w-2 h-2 fill-white stroke-[2.5]" />
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold">کارفرما</span>
          {pendingApprovals > 0 && !isClientPortalLocked && (
            <span className="absolute -top-1 right-2.5 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-[9px] font-bold text-white flex items-center justify-center font-mono shadow-xs animate-pulse">
              {toPersianDigits(pendingApprovals)}
            </span>
          )}
          {activeTab === 'client-portal' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b96cc] -mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
}

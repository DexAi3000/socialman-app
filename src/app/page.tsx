"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { SnappHeader } from '@/components/SnappHeader';
import { SnappBottomNav } from '@/components/SnappBottomNav';
import { DashboardView } from '@/components/DashboardView';
import { HomeIntro } from '@/components/HomeIntro';
import { UpgradeModal } from '@/components/UpgradeModal';
import { AuthModal } from '@/components/AuthModal';
import { ConnectAccountsModal } from '@/components/ConnectAccountsModal';
import { HamburgerMenuDrawer } from '@/components/HamburgerMenuDrawer';
import { LockedFeatureGate } from '@/components/LockedFeatureGate';
import type { AppTab } from '@/types';

function WorkspaceLoading({ message = 'در حال بارگذاری…' }: { message?: string }) {
  return (
    <div role="status" className="grid min-h-48 place-content-center justify-items-center gap-3 text-sm text-slate-600">
      <span aria-hidden="true" className="size-6 rounded-full border-2 border-sky-200 border-t-sky-700 motion-safe:animate-spin" />
      {message}
    </div>
  );
}

const AiStudioView = dynamic(() => import('@/components/AiStudioView').then((m) => m.AiStudioView), { loading: () => <WorkspaceLoading /> });
const CalendarView = dynamic(() => import('@/components/CalendarView').then((m) => m.CalendarView), { loading: () => <WorkspaceLoading /> });
const PricingView = dynamic(() => import('@/components/PricingView').then((m) => m.PricingView), { loading: () => <WorkspaceLoading /> });
const ClientPortalView = dynamic(() => import('@/components/ClientPortalView').then((m) => m.ClientPortalView), { loading: () => <WorkspaceLoading /> });
const MultiPublishView = dynamic(() => import('@/components/MultiPublishView').then((m) => m.MultiPublishView), { loading: () => <WorkspaceLoading /> });
const SupportView = dynamic(() => import('@/components/SupportView').then((m) => m.SupportView), { loading: () => <WorkspaceLoading /> });

export default function Home() {
  const router = useRouter();
  const { currentUser, isAuthChecked, currentPlan, openUpgradeModal } = useApp();
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  useEffect(() => {
    if (isAuthChecked && !currentUser?.isLoggedIn) {
      router.replace('/login');
    }
  }, [isAuthChecked, currentUser?.isLoggedIn, router]);

  function navigate(tab: AppTab) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveTab(tab);
  }

  if (!isAuthChecked) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-50">
        <WorkspaceLoading message="در حال بررسی ورود…" />
      </div>
    );
  }

  if (!currentUser?.isLoggedIn) return null;

  return (
    <div className="flex min-h-dvh flex-col bg-[#f4f7fb] pb-[calc(5.25rem+env(safe-area-inset-bottom))] text-slate-900 lg:pb-10 [&_:is(button,a,input,select,textarea):focus-visible]:outline-2 [&_:is(button,a,input,select,textarea):focus-visible]:outline-offset-2 [&_:is(button,a,input,select,textarea):focus-visible]:outline-sky-600">
      <a href="#workspace-main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:p-3">
        رفتن به محتوای اصلی
      </a>
      <SnappHeader activeTab={activeTab} setActiveTab={navigate} />

      <main id="workspace-main" tabIndex={-1} className="w-full flex-1 scroll-mt-24">
        {activeTab === 'dashboard' && (
          <HomeIntro onOpenPublish={() => navigate('publish')} onOpenCalendar={() => navigate('calendar')} />
        )}
        <div className="mx-auto w-full max-w-7xl px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8">
          {(activeTab === 'dashboard' || activeTab === 'workspace') && (
            <DashboardView isWorkspace={activeTab === 'workspace'} onNavigateTab={navigate} />
          )}
          {activeTab === 'publish' && <MultiPublishView />}
          {activeTab === 'ai-studio' && (
            currentPlan === 'free' ? (
              <LockedFeatureGate
                feature="ai-studio"
                requiredPlan="pro"
                onUpgrade={() => openUpgradeModal('pro')}
                onBack={() => navigate('dashboard')}
              />
            ) : <AiStudioView />
          )}
          {activeTab === 'calendar' && (
            currentPlan === 'free' ? (
              <LockedFeatureGate
                feature="calendar"
                requiredPlan="pro"
                onUpgrade={() => openUpgradeModal('pro')}
                onBack={() => navigate('dashboard')}
              />
            ) : <CalendarView />
          )}
          {activeTab === 'pricing' && <PricingView />}
          {activeTab === 'client-portal' && (
            currentPlan !== 'agency' ? (
              <LockedFeatureGate
                feature="client-portal"
                requiredPlan="agency"
                onUpgrade={() => openUpgradeModal('agency')}
                onBack={() => navigate('dashboard')}
              />
            ) : <ClientPortalView />
          )}
          {activeTab === 'support' && <SupportView />}
        </div>
      </main>

      <SnappBottomNav activeTab={activeTab} setActiveTab={navigate} />
      <HamburgerMenuDrawer activeTab={activeTab} setActiveTab={navigate} />
      <AuthModal />
      <UpgradeModal />
      <ConnectAccountsModal />
    </div>
  );
}

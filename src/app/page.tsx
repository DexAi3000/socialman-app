"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { SnappHeader } from '@/components/SnappHeader';
import { SnappBottomNav } from '@/components/SnappBottomNav';
import { SnappSplashScreen } from '@/components/SnappSplashScreen';
import { DashboardView } from '@/components/DashboardView';
import { AiStudioView } from '@/components/AiStudioView';
import { CalendarView } from '@/components/CalendarView';
import { PricingView } from '@/components/PricingView';
import { ClientPortalView } from '@/components/ClientPortalView';
import { MultiPublishView } from '@/components/MultiPublishView';
import { UpgradeModal } from '@/components/UpgradeModal';
import { AuthModal } from '@/components/AuthModal';
import { ConnectAccountsModal } from '@/components/ConnectAccountsModal';
import { HamburgerMenuDrawer } from '@/components/HamburgerMenuDrawer';
import { SupportView } from '@/components/SupportView';
import { LockedFeatureGate } from '@/components/LockedFeatureGate';
import { SocialPlatform } from '@/types';

export default function Home() {
  const router = useRouter();
  const { currentUser, isAuthChecked, currentPlan, openUpgradeModal } = useApp();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'publish' | 'ai-studio' | 'calendar' | 'pricing' | 'client-portal' | 'support'
  >('dashboard');

  const [aiTargetPlatform, setAiTargetPlatform] = useState<SocialPlatform>('instagram');
  const [showSplash, setShowSplash] = useState(true);

  // Mandatory Authentication Gate: Unauthenticated users are redirected to /login
  useEffect(() => {
    if (isAuthChecked && !currentUser?.isLoggedIn) {
      router.replace('/login');
    }
  }, [isAuthChecked, currentUser, router]);

  const handleOpenAiWithPlatform = (platform: SocialPlatform) => {
    setAiTargetPlatform(platform);
    setActiveTab('ai-studio');
  };

  // While checking auth state, display a clean mobile loader
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#3b96cc] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-black text-gray-500 font-sans">در حال بررسی احراز هویت...</span>
      </div>
    );
  }

  // If not logged in, stop render (router.replace('/login') is in flight)
  if (!currentUser?.isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#212121] flex flex-col font-sans selection:bg-[#3b96cc] selection:text-white pb-20 sm:pb-24">
      {/* 0. Brand Splash Screen */}
      {showSplash && (
        <SnappSplashScreen
          duration={2000}
          onFinish={() => setShowSplash(false)}
        />
      )}

      {/* 1. Full Navigation Header */}
      <SnappHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Content Area */}
      <main className="flex-1 pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigateTab={setActiveTab}
            onSetAiPlatform={handleOpenAiWithPlatform}
          />
        )}

        {activeTab === 'publish' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            <MultiPublishView />
          </div>
        )}

        {activeTab === 'ai-studio' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            {currentPlan === 'free' ? (
              <LockedFeatureGate
                feature="ai-studio"
                requiredPlan="pro"
                onUpgrade={() => openUpgradeModal('pro')}
                onBack={() => setActiveTab('dashboard')}
              />
            ) : (
              <AiStudioView initialPlatform={aiTargetPlatform} />
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            {currentPlan === 'free' ? (
              <LockedFeatureGate
                feature="calendar"
                requiredPlan="pro"
                onUpgrade={() => openUpgradeModal('pro')}
                onBack={() => setActiveTab('dashboard')}
              />
            ) : (
              <CalendarView />
            )}
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            <PricingView />
          </div>
        )}

        {activeTab === 'client-portal' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            {currentPlan !== 'agency' ? (
              <LockedFeatureGate
                feature="client-portal"
                requiredPlan="agency"
                onUpgrade={() => openUpgradeModal('agency')}
                onBack={() => setActiveTab('dashboard')}
              />
            ) : (
              <ClientPortalView />
            )}
          </div>
        )}

        {activeTab === 'support' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            <SupportView />
          </div>
        )}
      </main>

      {/* 3. Mobile App Bottom Navigation Bar (Snapp-style Tab Bar) */}
      <SnappBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 4. Hamburger Drawer Menu */}
      <HamburgerMenuDrawer activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* SMS.ir Login & Register Modal */}
      <AuthModal />

      {/* Upgrade & Payment Modal */}
      <UpgradeModal />

      {/* Connect Social Accounts Modal */}
      <ConnectAccountsModal />
    </div>
  );
}

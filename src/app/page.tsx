"use client";

import React, { useState } from 'react';
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
import { SocialPlatform } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'publish' | 'ai-studio' | 'calendar' | 'pricing' | 'client-portal' | 'support'
  >('dashboard');

  const [aiTargetPlatform, setAiTargetPlatform] = useState<SocialPlatform>('instagram');
  const [showSplash, setShowSplash] = useState(true);

  const handleOpenAiWithPlatform = (platform: SocialPlatform) => {
    setAiTargetPlatform(platform);
    setActiveTab('ai-studio');
  };

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
            <AiStudioView initialPlatform={aiTargetPlatform} />
          </div>
        )}
        {activeTab === 'calendar' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            <CalendarView />
          </div>
        )}
        {activeTab === 'pricing' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            <PricingView />
          </div>
        )}
        {activeTab === 'client-portal' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            <ClientPortalView />
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

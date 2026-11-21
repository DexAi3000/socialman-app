"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, X, Share, PlusSquare } from 'lucide-react';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isRunningStandalone) {
      setIsStandalone(true);
      return;
    }

    // Check if user already dismissed recently
    const dismissedTime = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 24 * 60 * 60 * 1000) {
      // Dismissed within last 24h
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Android / Chrome / Edge install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not standalone, show prompt after 3 seconds
    if (isIosDevice) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-18 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-sky-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-50 to-blue-50 border border-sky-100 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              <Image
                src="/icons/icon-192x192.png"
                alt="Social Man"
                width={38}
                height={38}
                className="object-contain"
              />
            </div>
            <div className="text-right">
              <h4 className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                نصب اپلیکیشن Social Man
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-sky-100 text-[#3b96cc]">
                  نسخه موبایل
                </span>
              </h4>
              <p className="text-[11px] text-gray-500 font-medium">
                دسترسی سریع، تمام‌صفحه و بدون فیلترشکن
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg active:scale-95 transition-transform"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-2.5 text-[11px] text-gray-700 space-y-1.5 text-right font-medium">
            <p className="flex items-center gap-2">
              ۱. دکمه اشتراک‌گذاری <Share className="w-3.5 h-3.5 text-[#3b96cc] inline" /> در سافاری را لمس کنید.
            </p>
            <p className="flex items-center gap-2">
              ۲. گزینه <PlusSquare className="w-3.5 h-3.5 text-[#3b96cc] inline" /> <span className="font-bold text-gray-900">Add to Home Screen</span> را انتخاب فرمایید.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-[#3b96cc] to-sky-500 hover:from-[#3284b5] hover:to-sky-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Download className="w-4 h-4" />
              نصب روی گوشی
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 rounded-xl"
            >
              بعداً
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

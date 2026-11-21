"use client";

import React, { useState, useEffect } from 'react';

interface SnappSplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export function SnappSplashScreen({ onFinish, duration = 1800 }: SnappSplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 600);

    const removeTimer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [duration, onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#21aa58] flex flex-col items-center justify-between py-10 px-4 select-none transition-all duration-700 ease-in-out ${
        fadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="w-full h-8" />

      {/* Center: Brand Name: سوشال‌من! */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 animate-pulse duration-1000">
        {/* App Icon Mascot (Pomegranate Chat Bubble) */}
        <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/50 ring-4 ring-white/20 transform hover:scale-105 transition-transform shrink-0">
          <img
            src="/app-icon.jpg"
            alt="لوگوی سوشال‌من"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-center justify-center">
          <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight font-sans drop-shadow-sm">
            سوشال‌من<span className="text-white">!</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-white/90 font-black text-xs sm:text-sm tracking-wide">
          <span>سوپراپلیکیشن مدیریت شبکه‌های اجتماعی</span>
        </div>

        {/* Minimalist White Loading Dots */}
        <div className="flex items-center gap-1.5 pt-3">
          <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce duration-500" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-white/70 animate-bounce duration-500" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-white animate-bounce duration-500" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Bottom: Version text */}
      <div className="text-center">
        <span className="text-[11px] font-mono text-white/80 font-bold tracking-wider">
          v18.40.2
        </span>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { Star, Sparkles } from 'lucide-react';
import {
  SnappInstagramIcon,
  SnappTelegramIcon,
  SnappWhatsappIcon,
  SnappRubikaIcon,
  SnappBaleIcon,
  SnappAiIcon,
  SnappCalendarIcon,
} from './SnappIcons';

interface SnappCategoryTabsProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
}

export function SnappCategoryTabs({ activeCategory, onSelectCategory }: SnappCategoryTabsProps) {
  const tabs = [
    {
      id: 'all',
      name: 'پیشنهادی',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-md shadow-amber-500/25">
          <Star className="w-6 h-6 fill-white" />
        </div>
      ),
    },
    {
      id: 'instagram',
      name: 'اینستاگرام',
      icon: <SnappInstagramIcon className="w-12 h-12" />,
    },
    {
      id: 'telegram',
      name: 'تلگرام',
      icon: <SnappTelegramIcon className="w-12 h-12" />,
    },
    {
      id: 'whatsapp',
      name: 'واتساپ',
      icon: <SnappWhatsappIcon className="w-12 h-12" />,
    },
    {
      id: 'rubika',
      name: 'روبیکا',
      icon: <SnappRubikaIcon className="w-12 h-12" />,
    },
    {
      id: 'bale',
      name: 'بله',
      icon: <SnappBaleIcon className="w-12 h-12" />,
    },
    {
      id: 'ai-studio',
      name: 'هوش مصنوعی',
      icon: <SnappAiIcon className="w-12 h-12" />,
    },
    {
      id: 'calendar',
      name: 'تقویم شمسی',
      icon: <SnappCalendarIcon className="w-12 h-12" />,
    },
  ];

  return (
    <div className="space-y-4 pt-2">
      {/* Section Subheading from Screenshot */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-black text-[#212121]">
          سرویس‌های اختصاصی سوشال‌من
        </h2>
        <span className="text-xs text-gray-400 font-bold">انتشار سریع و یکپارچه</span>
      </div>

      {/* Horizontal Category Slider with Active Underline (Matching Snapp Screenshot) */}
      <div className="flex items-center justify-start gap-4 sm:gap-7 overflow-x-auto pb-2 scrollbar-none border-b border-gray-100">
        {tabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectCategory(tab.id)}
              className="flex flex-col items-center gap-2 group pb-3 relative shrink-0 transition-transform active:scale-95"
            >
              <div className="transform transition-transform group-hover:scale-110">
                {tab.icon}
              </div>
              <span
                className={`text-xs font-black transition-colors ${
                  isActive ? 'text-[#3b96cc]' : 'text-gray-500 group-hover:text-gray-900'
                }`}
              >
                {tab.name}
              </span>

              {/* Green Snapp Underline for Active Tab */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#3b96cc] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { Send } from 'lucide-react';
import {
  SnappInstagramIcon,
  SnappTelegramIcon,
  SnappWhatsappIcon,
  SnappRubikaIcon,
  SnappBaleIcon,
  SnappAiIcon,
  SnappCalendarIcon,
  SnappApprovalIcon,
  SnappCrownIcon,
  SnappShopIcon,
  SnappWalletIcon,
} from './SnappIcons';

interface SnappTilesGridProps {
  onSelectService: (serviceId: string) => void;
}

export function SnappTilesGrid({ onSelectService }: SnappTilesGridProps) {
  // 3 Primary Big Hero Cards (Like Snapp's Supermarket, Food, Snapp Car)
  const primaryServices = [
    {
      id: 'publish',
      title: 'انتشار همزمان ۵ پلتفرم',
      desc: 'اینستاگرام، تلگرام، واتساپ، روبیکا و بله',
      icon: (
        <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3b96cc] to-sky-400 flex items-center justify-center text-white shadow-lg shadow-[#3b96cc]/35 z-10 group-hover:scale-105 transition-transform">
            <Send className="w-6 h-6 fill-white rotate-45 -mr-0.5" />
          </div>
          <img src="/instagram-clean.png" alt="Instagram" className="w-5 h-5 absolute -top-1 -right-1 drop-shadow-md z-20 group-hover:-translate-y-0.5 transition-transform" />
          <img src="/telegram-clean.png" alt="Telegram" className="w-5 h-5 absolute -top-1 -left-1 drop-shadow-md z-20 group-hover:-translate-y-0.5 transition-transform" />
          <img src="/whatsapp-clean.png" alt="WhatsApp" className="w-5 h-5 absolute -bottom-1 -right-1 drop-shadow-md z-20 group-hover:translate-y-0.5 transition-transform" />
          <img src="/rubika-icon.png" alt="Rubika" className="w-5 h-5 absolute -bottom-1 -left-1 drop-shadow-md z-20 group-hover:translate-y-0.5 transition-transform" />
        </div>
      ),
      badge: 'سرویس اصلی 🚀',
      badgeColor: 'bg-sky-50 text-[#3b96cc] border-sky-200',
    },
    {
      id: 'calendar',
      title: 'زمان‌بندی تقویم شمسی',
      desc: 'ارسال خودکار در تاریخ و ساعت مشخص',
      icon: <SnappCalendarIcon className="w-16 h-16 sm:w-20 sm:h-20" />,
      badge: 'آذر ۱۴۰۳ 📅',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'client-portal',
      title: 'پورتال تایید کارفرما',
      desc: 'لینک اختصاصی تایید پست‌ها قبل از انتشار',
      icon: <SnappApprovalIcon className="w-16 h-16 sm:w-20 sm:h-20" />,
      badge: 'ویژه آژانس 🤝',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  // Secondary Cards (5 Connected Channels + VIP Gemini AI Studio)
  const secondaryServices = [
    {
      id: 'instagram',
      title: 'اینستاگرام',
      desc: 'ریلز، استوری و پست',
      icon: <SnappInstagramIcon className="w-11 h-11 sm:w-13 sm:h-13" />,
      badge: 'Graph API',
      badgeColor: 'bg-rose-50 text-rose-600',
    },
    {
      id: 'telegram',
      title: 'تلگرام رسمی',
      desc: 'کانال و سوپرگروه',
      icon: <SnappTelegramIcon className="w-11 h-11 sm:w-13 sm:h-13" />,
      badge: 'Bot API',
      badgeColor: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'rubika',
      title: 'روبیکا و روبینو',
      desc: 'کانال و روبینو',
      icon: <SnappRubikaIcon className="w-11 h-11 sm:w-13 sm:h-13" />,
      badge: 'سریع ⚡',
      badgeColor: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'whatsapp',
      title: 'واتساپ تجاری',
      desc: 'کانال و برودکست',
      icon: <SnappWhatsappIcon className="w-11 h-11 sm:w-13 sm:h-13" />,
      badge: 'Cloud API',
      badgeColor: 'bg-sky-50 text-[#3b96cc]',
    },
    {
      id: 'bale',
      title: 'پیام‌رسان بله',
      desc: 'کانال رسمی بانکی',
      icon: <SnappBaleIcon className="w-11 h-11 sm:w-13 sm:h-13" />,
      badge: 'Bale Bot',
      badgeColor: 'bg-teal-50 text-teal-700',
    },
    {
      id: 'ai-studio',
      title: 'استودیو AI',
      desc: 'تولید متن و هوک',
      icon: <SnappAiIcon className="w-11 h-11 sm:w-13 sm:h-13" />,
      badge: 'پلن طلایی 👑',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  ];

  return (
    <div className="space-y-4 pt-2">
      {/* 1. Top Tier: 3 Prominent Large Cards (Directly matching Snapp mobile screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {primaryServices.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectService(item.id)}
            className="relative bg-white rounded-3xl p-5 sm:p-6 border border-gray-100/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-sky-200 transition-all cursor-pointer flex flex-col items-center justify-center text-center group active:scale-[0.98]"
          >
            {/* Top Corner Badge */}
            <span className={`absolute top-3.5 right-3.5 text-[10px] font-black px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
              {item.badge}
            </span>

            {/* 3D Rendered Centered Icon */}
            <div className="my-2 group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </div>

            {/* Title & Desc */}
            <h3 className="text-sm sm:text-base font-black text-[#212121] mt-2 group-hover:text-[#3b96cc] transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-1 max-w-[200px]">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* 2. Second Tier: 6 Connected Channel Cards (Direct access to channels + VIP Gemini AI) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {secondaryServices.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectService(item.id)}
            className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-sky-200 transition-all cursor-pointer flex flex-col items-center text-center group active:scale-[0.98]"
          >
            {/* 3D Icon */}
            <div className="mb-2 group-hover:scale-105 transition-transform duration-300">
              {item.icon}
            </div>

            {/* Title */}
            <span className="text-xs sm:text-sm font-black text-[#212121] group-hover:text-[#3b96cc] transition-colors">
              {item.title}
            </span>

            {/* Micro Badge */}
            <span className={`mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${item.badgeColor}`}>
              {item.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

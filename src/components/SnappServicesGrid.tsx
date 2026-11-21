"use client";

import React from 'react';
import {
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
  BaleIcon,
  RubikaIcon,
} from '@/components/SocialIcons';
import { SocialPlatform } from '@/types';
import { toPersianDigits } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface SnappServicesGridProps {
  selectedPlatform: SocialPlatform | 'all';
  onSelectPlatform: (platform: SocialPlatform | 'all') => void;
  onQuickPost: (platform: SocialPlatform) => void;
}

export function SnappServicesGrid({
  selectedPlatform,
  onSelectPlatform,
  onQuickPost,
}: SnappServicesGridProps) {
  const platforms = [
    {
      id: 'instagram' as SocialPlatform,
      name: 'اینستاگرام',
      icon: InstagramIcon,
      color: 'bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500',
      badgeColor: 'text-pink-600 bg-pink-50 border-pink-200',
      audience: '۲۴.۸K فالوور',
      desc: 'ریلز، پست اسلایدی، استوری',
    },
    {
      id: 'telegram' as SocialPlatform,
      name: 'تلگرام',
      icon: TelegramIcon,
      color: 'bg-gradient-to-tr from-sky-400 to-blue-600',
      badgeColor: 'text-sky-600 bg-sky-50 border-sky-200',
      audience: '۱۲.۳K ممبر',
      desc: 'کانال رسمی و بولتن خبری',
    },
    {
      id: 'whatsapp' as SocialPlatform,
      name: 'واتساپ',
      icon: WhatsappIcon,
      color: 'bg-gradient-to-tr from-[#25D366] to-sky-700',
      badgeColor: 'text-[#00A852] bg-sky-50 border-sky-200',
      audience: '۵.۶K مخاطب',
      desc: 'کانال و برودکست پیام‌رسان',
    },
    {
      id: 'rubika' as SocialPlatform,
      name: 'روبیکا',
      icon: RubikaIcon,
      color: 'bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500',
      badgeColor: 'text-purple-600 bg-purple-50 border-purple-200',
      audience: '۱۸.۴K عضو',
      desc: 'روبینو و کانال‌های عمومی',
    },
    {
      id: 'bale' as SocialPlatform,
      name: 'بله',
      icon: BaleIcon,
      color: 'bg-gradient-to-tr from-[#00A859] to-teal-600',
      badgeColor: 'text-teal-600 bg-teal-50 border-teal-200',
      audience: '۴.۱K عضو',
      desc: 'کانال سازمانی و بانکی',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Title & Filter */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00D166] animate-pulse" />
          <h3 className="text-xs sm:text-sm font-black text-slate-800">
            ۵ درگاه انتشار محتوای کسب‌وکار (خدمات اسنپی)
          </h3>
        </div>
        <button
          onClick={() => onSelectPlatform('all')}
          className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-colors ${
            selectedPlatform === 'all'
              ? 'bg-[#00D166] text-slate-950 font-black shadow-xs'
              : 'text-slate-500 hover:text-slate-900 bg-slate-100'
          }`}
        >
          نمایش همه
        </button>
      </div>

      {/* 5 Snapp Service Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {platforms.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedPlatform === p.id;
          return (
            <div
              key={p.id}
              onClick={() => onSelectPlatform(p.id)}
              className={`p-3.5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between ${
                isSelected
                  ? 'bg-sky-50/40 border-[#00D166] shadow-md shadow-[#00D166]/10 scale-[1.02]'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                {/* Icon Circle */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-2xl ${p.color} flex items-center justify-center text-white shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00D166] ring-4 ring-[#00D166]/20" />
                  )}
                </div>

                {/* Name & Audience */}
                <h4 className="text-xs font-black text-slate-800 mb-0.5">{p.name}</h4>
                <span className="text-[10px] font-mono font-bold text-slate-500 block mb-2">
                  {toPersianDigits(p.audience)}
                </span>
                <p className="text-[10px] text-slate-400 line-clamp-1 leading-tight">
                  {p.desc}
                </p>
              </div>

              {/* Quick AI Trigger */}
              <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] text-[#00A852] font-black">اتصال لایو ✓</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickPost(p.id);
                  }}
                  className="p-1 rounded-lg bg-slate-100 group-hover:bg-[#00D166] text-slate-500 group-hover:text-slate-950 transition-colors"
                  title="تولید سریع محتوا"
                >
                  <Sparkles className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

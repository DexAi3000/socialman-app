"use client";

import type { AppTab } from '@/types';
import {
  SnappAiIcon,
  SnappApprovalIcon,
  SnappBaleIcon,
  SnappCalendarIcon,
  SnappDirectsIcon,
  SnappInstagramIcon,
  SnappPublishIcon,
  SnappRubikaIcon,
  SnappTelegramIcon,
  SnappWhatsappIcon,
} from './SnappIcons';

interface SnappTilesGridProps {
  onSelectService: (serviceId: AppTab) => void;
}

const channels = [
  { id: 'instagram', title: 'اینستاگرام', detail: 'Graph API', icon: SnappInstagramIcon },
  { id: 'telegram', title: 'تلگرام رسمی', detail: 'Bot API', icon: SnappTelegramIcon },
  { id: 'rubika', title: 'روبیکا و روبینو', detail: 'کانال و روبینو', icon: SnappRubikaIcon },
  { id: 'whatsapp', title: 'واتساپ تجاری', detail: 'Cloud API', icon: SnappWhatsappIcon },
  { id: 'bale', title: 'پیام‌رسان بله', detail: 'Bale Bot', icon: SnappBaleIcon },
  { id: 'ai-studio', title: 'استودیو AI', detail: 'پلن طلایی', icon: SnappAiIcon },
];

const cardInteraction = 'cursor-pointer border bg-white transition-colors hover:border-sky-300 hover:bg-sky-50/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600';

export function SnappTilesGrid({ onSelectService }: SnappTilesGridProps) {
  const services = [
    {
      id: 'publish',
      title: 'انتشار همزمان در ۵ پلتفرم',
      detail: 'اینستاگرام، تلگرام، واتساپ، روبیکا و بله',
      icon: SnappPublishIcon,
    },
    {
      id: 'directs',
      title: 'دایرکت هوشمند AI',
      detail: 'پاسخ خودکار به پیام‌های تلگرام و اینستاگرام',
      icon: SnappDirectsIcon,
    },
    {
      id: 'calendar',
      title: 'زمان‌بندی تقویم شمسی',
      detail: 'ارسال خودکار در تاریخ و ساعت مشخص',
      icon: SnappCalendarIcon,
    },
    {
      id: 'client-portal',
      title: 'پورتال تأیید کارفرما',
      detail: 'لینک اختصاصی تأیید پست‌ها قبل از انتشار',
      icon: SnappApprovalIcon,
    },
  ] as const;

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3">
        {services.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectService(item.id)}
            className={`${cardInteraction} flex min-h-[88px] min-w-0 items-center gap-3 rounded-2xl p-3.5 text-start md:flex-col md:gap-3.5 md:p-5 md:text-center ${item.id === 'publish' ? 'border-sky-200' : 'border-slate-200/75'}`}
          >
            <item.icon className="size-12 md:size-14" />
            <span className="min-w-0">
              <span className="block text-sm leading-6 font-black text-slate-900 md:text-base">{item.title}</span>
              <span className="mt-0.5 block text-xs leading-5 font-medium text-slate-600">{item.detail}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2.5 min-[360px]:grid-cols-3 sm:gap-3 lg:grid-cols-6">
        {channels.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectService(item.id === 'ai-studio' ? 'ai-studio' : 'publish')}
            className={`${cardInteraction} grid min-w-0 grid-rows-[auto_1fr_auto] justify-items-center gap-1.5 rounded-2xl border-slate-200/75 px-2 py-3 text-center sm:p-4`}
          >
            <item.icon className="size-10 sm:size-12" />
            <span className="self-center text-xs leading-5 font-black text-slate-900 sm:text-sm">{item.title}</span>
            <span className="text-[11px] leading-4 font-medium text-slate-600">{item.detail}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

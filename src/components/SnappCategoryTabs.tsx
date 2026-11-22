"use client";

import { Layers } from 'lucide-react';
import type { SocialPlatform } from '@/types';
import { BaleIcon, InstagramIcon, RubikaIcon, TelegramIcon, WhatsappIcon } from './SocialIcons';

type Filter = SocialPlatform | 'all';

const tabs = [
  { id: 'all', name: 'همه', icon: <Layers aria-hidden="true" className="size-4 shrink-0" /> },
  { id: 'instagram', name: 'اینستاگرام', icon: <InstagramIcon decorative /> },
  { id: 'telegram', name: 'تلگرام', icon: <TelegramIcon decorative /> },
  { id: 'whatsapp', name: 'واتساپ', icon: <WhatsappIcon decorative /> },
  { id: 'rubika', name: 'روبیکا', icon: <RubikaIcon decorative /> },
  { id: 'bale', name: 'بله', icon: <BaleIcon decorative /> },
] as const;

interface SnappCategoryTabsProps {
  activeCategory: Filter;
  onSelectCategory: (category: Filter) => void;
}

export function SnappCategoryTabs({ activeCategory, onSelectCategory }: SnappCategoryTabsProps) {
  return (
    <div role="group" aria-label="فیلتر پلتفرم" className="flex flex-wrap gap-1.5">
      {tabs.map(({ id, name, icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={activeCategory === id}
          onClick={() => onSelectCategory(id)}
          className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition-colors ${activeCategory === id ? 'border-sky-200 bg-sky-100 text-sky-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}
        >
          {icon}
          {name}
        </button>
      ))}
    </div>
  );
}

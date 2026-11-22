"use client";

import { useState } from 'react';
import { CalendarDays, Clock, FileText, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SnappHero } from './SnappHero';
import { SnappCategoryTabs } from './SnappCategoryTabs';
import { SnappTilesGrid } from './SnappTilesGrid';
import { InstagramIcon, TelegramIcon, WhatsappIcon, BaleIcon, RubikaIcon } from './SocialIcons';
import { getShamsiToday, IRANIAN_EVENTS, toEnglishDigits, toPersianDigits } from '@/lib/utils';
import type { AppTab, PostStatus, SocialPlatform } from '@/types';

interface DashboardViewProps {
  isWorkspace: boolean;
  onNavigateTab: (tab: AppTab) => void;
}

const platforms = {
  instagram: { name: 'اینستاگرام', icon: InstagramIcon },
  telegram: { name: 'تلگرام', icon: TelegramIcon },
  whatsapp: { name: 'واتساپ', icon: WhatsappIcon },
  rubika: { name: 'روبیکا', icon: RubikaIcon },
  bale: { name: 'بله', icon: BaleIcon },
};

const statuses: Record<PostStatus, { label: string; color: string }> = {
  approved: { label: 'تأیید شده', color: 'bg-emerald-50 text-emerald-800' },
  pending_approval: { label: 'در انتظار تأیید', color: 'bg-amber-50 text-amber-800' },
  draft: { label: 'پیش‌نویس', color: 'bg-slate-100 text-slate-700' },
  published: { label: 'منتشر شده', color: 'bg-sky-50 text-sky-800' },
};

function normalizeSearch(value: string) {
  return toEnglishDigits(value.toLocaleLowerCase('fa').trim())
    .replaceAll('ي', 'ی')
    .replaceAll('ك', 'ک')
    .replace(/[\s\u200c]+/g, ' ');
}

export function DashboardView({ isWorkspace, onNavigateTab }: DashboardViewProps) {
  const { posts, activeWorkspace, openConnectModal, connectedAccounts } = useApp();
  const [platform, setPlatform] = useState<SocialPlatform | 'all'>('all');
  const [search, setSearch] = useState('');
  const today = getShamsiToday();

  const connectedChannels = Object.values(connectedAccounts).filter((account) => account?.isConnected && account.handle).length;
  const workspacePosts = posts.filter((post) => post.workspaceId === activeWorkspace.id);
  const query = normalizeSearch(search);
  const visiblePosts = workspacePosts.filter((post) => {
    if (platform !== 'all' && post.platform !== platform) return false;
    if (!query) return true;
    const text = [post.title, post.content, post.hook, platforms[post.platform]?.name].filter(Boolean).join(' ');
    return normalizeSearch(text).includes(query);
  });
  const occasions = IRANIAN_EVENTS
    .filter((event) => event.month === today.monthName && event.day >= today.day)
    .slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-7">
      {isWorkspace ? (
        <SnappHero
          workspaceName={activeWorkspace.name}
          dateLabel={today.fullDateWithWeekday}
          connectedChannels={connectedChannels}
          postCount={workspacePosts.length}
          onOpenPublish={() => onNavigateTab('publish')}
          onOpenCalendar={() => onNavigateTab('calendar')}
          onConnect={() => openConnectModal()}
        />
      ) : (
        <section aria-labelledby="workspace-services">
          <h2 id="workspace-services" className="mb-2.5 text-base font-black sm:text-lg">ابزارهای مدیریت محتوا</h2>
          <SnappTilesGrid onSelectService={onNavigateTab} />
        </section>
      )}

      <div className={occasions.length ? 'grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' : undefined}>
        <section aria-labelledby="workspace-posts" className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="workspace-posts" className="text-base font-black sm:text-lg">پست‌های فضای کاری</h2>
            <button type="button" onClick={() => onNavigateTab('calendar')} className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-bold text-sky-800 hover:bg-sky-50">
              <CalendarDays aria-hidden="true" className="size-4" />
              مشاهدهٔ تقویم
            </button>
          </div>
          {workspacePosts.length > 0 && (
            <div className="my-3 space-y-2.5">
              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-sky-600">
                <Search aria-hidden="true" className="size-4 shrink-0 text-slate-500" />
                <span className="sr-only">جست‌وجوی پست‌ها</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="جست‌وجو در عنوان و متن پست‌ها"
                  className="min-w-0 flex-1 bg-transparent py-2 text-base text-slate-900 placeholder:text-slate-500 sm:text-sm"
                />
              </label>
              <SnappCategoryTabs activeCategory={platform} onSelectCategory={setPlatform} />
            </div>
          )}

          {visiblePosts.length === 0 ? (
            <div className="mt-3 grid justify-items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <span className="grid size-10 place-items-center rounded-xl bg-white text-slate-500"><FileText aria-hidden="true" className="size-5" /></span>
              <p className="text-sm font-bold text-slate-800">
                {workspacePosts.length ? 'پستی با این جست‌وجو یا فیلتر پیدا نشد' : 'هنوز پستی در این فضای کاری نداری'}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!workspacePosts.length) {
                    onNavigateTab('publish');
                    return;
                  }

                  setPlatform('all');
                  setSearch('');
                }}
                className="min-h-10 cursor-pointer rounded-lg px-3 text-sm font-bold text-sky-800 hover:bg-sky-100"
              >
                {workspacePosts.length ? 'پاک‌کردن جست‌وجو و فیلتر' : 'ساخت اولین پست'}
              </button>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
              {visiblePosts.map((post) => {
                const social = platforms[post.platform];
                const status = statuses[post.status];
                const SocialIcon = social?.icon;
                return (
                  <li key={post.id} className="flex flex-wrap items-start gap-2.5 py-3 sm:items-center">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100">
                      {SocialIcon ? <SocialIcon decorative className="size-5" /> : <FileText className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1 basis-32">
                      <h3 className="truncate text-sm font-bold">{post.title}</h3>
                      <p className="truncate text-xs text-slate-600">{post.hook || post.content}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                        <span>{social?.name ?? post.platform}</span>
                        <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />{post.scheduledDateShamsi}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{toPersianDigits(post.scheduledTime)}</span>
                      </div>
                    </div>
                    {status && <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${status.color}`}>{status.label}</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {occasions.length > 0 && (
          <section aria-labelledby="workspace-occasions" className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
            <h2 id="workspace-occasions" className="mb-2 text-base font-black">مناسبت‌های پیش‌ رو</h2>
            <ul className="divide-y divide-slate-100">
              {occasions.map((event) => (
                <li key={event.day} className="flex items-center gap-3 py-2.5">
                  <span className="grid size-10 shrink-0 place-content-center rounded-lg bg-amber-50 p-1 text-center font-bold leading-tight text-amber-900">
                    {toPersianDigits(event.day)}
                    <span className="text-[10px]">{event.month}</span>
                  </span>
                  <p className="text-sm leading-6 text-slate-700">{event.title}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

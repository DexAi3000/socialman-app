"use client";

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Bell, CalendarClock, CheckCheck, ClipboardCheck, Headphones, Send, X } from 'lucide-react';
import type { AppNotification, AppTab } from '@/types';
import { formatSubscriptionDate } from '@/lib/subscription';
import { toPersianDigits } from '@/lib/utils';

const endpoint = '/socialman/api/notifications';
const icons = {
  subscription: CalendarClock,
  publication: Send,
  approval: ClipboardCheck,
  support: Headphones,
};

function authHeaders(): Record<string, string> {
  try {
    const token = localStorage.getItem('socialman_token');
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

export function NotificationBell({ onNavigate }: { onNavigate: (tab: AppTab) => void }) {
  const [open, setOpen] = useState(false);
  const [feed, setFeed] = useState<AppNotification[] | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const fetchRef = useRef<AbortController | null>(null);
  const savingRef = useRef(false);
  const panelId = useId();
  const unread = feed?.filter((notice) => !notice.read) ?? [];

  const refresh = useCallback(async () => {
    if (savingRef.current) return;
    fetchRef.current?.abort();
    const controller = new AbortController();
    fetchRef.current = controller;
    try {
      const response = await fetch(endpoint, { headers: authHeaders(), signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw new Error('Notification feed unavailable');
      const result: { notifications: AppNotification[] } = await response.json();
      if (!controller.signal.aborted) {
        setFeed(result.notifications);
        setError('');
      }
    } catch {
      if (!controller.signal.aborted) setError('اعلان‌ها دریافت نشدند.');
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onVisible = () => {
      if (!document.hidden) void refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    const interval = window.setInterval(onVisible, 30000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(interval);
      fetchRef.current?.abort();
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function markRead(ids: string[]) {
    if (!ids.length || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    fetchRef.current?.abort();
    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) throw new Error('Notification update failed');
      const { read }: { read: string[] } = await response.json();
      setFeed((current) => current?.map((notice) => read.includes(notice.id) ? { ...notice, read: true } : notice) ?? null);
      setError('');
    } catch {
      setError('وضعیت خوانده‌شده ثبت نشد.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={unread.length ? `اعلان‌ها، ${toPersianDigits(unread.length)} خوانده‌نشده` : 'اعلان‌ها'}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          if (!open) void refresh();
          setOpen(!open);
        }}
        className="relative grid h-11 w-10 shrink-0 cursor-pointer place-items-center rounded-xl text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-900"
      >
        <Bell aria-hidden="true" className="size-5" strokeWidth={1.8} />
        {unread.length > 0 && (
          <span aria-hidden="true" className="absolute end-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-sky-800 px-1 text-[10px] font-bold leading-none text-white">
            {toPersianDigits(unread.length)}
          </span>
        )}
      </button>

      {open && (
        <section ref={panelRef} id={panelId} aria-label="مرکز اعلان‌ها" className="absolute end-0 top-full z-50 mt-2 w-[min(23rem,calc(100vw-1.75rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-3.5 py-2">
            <h2 className="text-sm font-black text-slate-900">اعلان‌ها</h2>
            <div className="flex items-center gap-1">
              {unread.length > 0 && (
                <button type="button" disabled={saving} onClick={() => void markRead(unread.map(({ id }) => id))} className="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-lg px-2 text-xs font-bold text-sky-800 hover:bg-sky-50 disabled:opacity-50">
                  <CheckCheck aria-hidden="true" className="size-4" /> خواندن همه
                </button>
              )}
              <button type="button" aria-label="بستن اعلان‌ها" onClick={() => { setOpen(false); buttonRef.current?.focus(); }} className="grid size-10 cursor-pointer place-items-center rounded-lg text-slate-600 hover:bg-slate-100">
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          </header>

          {error && (
            <div role="status" className="flex items-center justify-between gap-2 bg-amber-50 px-3.5 py-2 text-xs text-amber-900">
              {error}
              <button type="button" onClick={() => void refresh()} className="cursor-pointer rounded-lg px-2 py-1 font-bold underline">تلاش دوباره</button>
            </div>
          )}
          {feed?.length ? (
            <ul className="max-h-[min(28rem,65dvh)] divide-y divide-slate-100 overflow-y-auto overscroll-contain">
              {feed.map((notice) => {
                const Icon = icons[notice.kind];
                return (
                  <li key={notice.id}>
                    <button type="button" onClick={() => {
                      if (!notice.read) void markRead([notice.id]);
                      setOpen(false);
                      onNavigate(notice.tab);
                    }} className={`flex w-full cursor-pointer gap-2.5 px-3.5 py-3 text-start transition-colors hover:bg-slate-100 ${notice.read ? 'bg-white' : 'bg-sky-50/70'}`}>
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-sky-800"><Icon aria-hidden="true" className="size-4" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-slate-900">{notice.title}</span>
                        <span className="block truncate text-xs leading-5 text-slate-600">{notice.detail}</span>
                        <time dateTime={notice.occurredAt} className="block text-xs text-slate-500">{formatSubscriptionDate(notice.occurredAt)}</time>
                      </span>
                      {!notice.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-sky-700"><span className="sr-only">خوانده‌نشده</span></span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : !error && (
            <div role="status" className="grid justify-items-center gap-2 px-4 py-7 text-center text-sm text-slate-600">
              <Bell aria-hidden="true" className="size-6 text-slate-400" strokeWidth={1.5} />
              {feed ? 'هنوز اعلانی نداری.' : 'در حال دریافت اعلان‌ها…'}
            </div>
          )}
        </section>
      )}
    </>
  );
}

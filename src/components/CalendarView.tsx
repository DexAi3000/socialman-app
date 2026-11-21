"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Calendar as CalendarIcon,
  Trash2,
  Plus,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  CalendarDays,
  ListOrdered,
} from 'lucide-react';
import {
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
  BaleIcon,
  RubikaIcon,
} from '@/components/SocialIcons';
import { toPersianDigits, IRANIAN_EVENTS, getShamsiToday } from '@/lib/utils';
import { Post, SocialPlatform, PostStatus } from '@/types';

export function CalendarView() {
  const { posts, activeWorkspace, updatePost, deletePost, addPost } = useApp();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [today, setToday] = useState(() => getShamsiToday());
  const [selectedDay, setSelectedDay] = useState<number>(() => getShamsiToday().day);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // Keep date strictly synced with real current clock on mount
  useEffect(() => {
    const cur = getShamsiToday();
    setToday(cur);
    setSelectedDay(cur.day);
  }, []);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('instagram');
  const [newDay, setNewDay] = useState(() => String(getShamsiToday().day));
  const [newTime, setNewTime] = useState(() => getShamsiToday().timeFormatted || '۱۹:۰۰');

  const daysInMonth = today.daysInMonth;
  const startWeekdayIndex = today.startWeekdayIndex;

  const weekDays = [
    { short: 'ش', full: 'شنبه', isHoliday: false },
    { short: '۱ش', full: 'یکشنبه', isHoliday: false },
    { short: '۲ش', full: 'دوشنبه', isHoliday: false },
    { short: '۳ش', full: 'سه‌شنبه', isHoliday: false },
    { short: '۴ش', full: 'چهارشنبه', isHoliday: false },
    { short: '۵ش', full: 'پنج‌شنبه', isHoliday: false },
    { short: 'جمعه', full: 'جمعه', isHoliday: true },
  ];

  const workspacePosts = posts.filter(
    (p) =>
      p.workspaceId === activeWorkspace.id &&
      (platformFilter === 'all' || p.platform === platformFilter)
  );

  const getPlatformIcon = (platform: SocialPlatform, size = 'w-3.5 h-3.5') => {
    switch (platform) {
      case 'instagram':
        return <InstagramIcon className={`${size} text-pink-500`} />;
      case 'telegram':
        return <TelegramIcon className={`${size} text-sky-500`} />;
      case 'whatsapp':
        return <WhatsappIcon className={`${size} text-[#25D366]`} />;
      case 'rubika':
        return <RubikaIcon className={`${size} text-purple-500`} />;
      case 'bale':
        return <BaleIcon className={`${size} text-teal-600`} />;
    }
  };

  const getPlatformLabel = (platform: SocialPlatform) => {
    const names: Record<SocialPlatform, string> = {
      instagram: 'اینستاگرام',
      telegram: 'تلگرام',
      whatsapp: 'واتساپ',
      rubika: 'روبیکا',
      bale: 'بله',
    };
    return names[platform] || platform;
  };

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            تایید شده
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            در انتظار تایید
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200">
            <FileText className="w-3 h-3 text-slate-500" />
            پیش‌نویس
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-50 text-[#3b96cc] border border-sky-200">
            <Send className="w-3 h-3 text-[#3b96cc]" />
            منتشر شده
          </span>
        );
    }
  };

  const handleCreateManualPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const mStr = String(today.month).padStart(2, '0');
    const dStr = String(newDay).padStart(2, '0');

    addPost({
      workspaceId: activeWorkspace.id,
      title: newTitle,
      content: newContent,
      platform: newPlatform,
      status: 'draft',
      hashtags: ['مارکتینگ', 'تولید_محتوا'],
      scheduledDateShamsi: `${toPersianDigits(today.year)}/${toPersianDigits(mStr)}/${toPersianDigits(dStr)}`,
      scheduledTime: newTime,
    });
    setNewTitle('');
    setNewContent('');
    setIsNewPostModalOpen(false);
  };

  // Posts for the actively selected day
  const selectedDayStr = String(selectedDay).padStart(2, '0');
  const selectedDayEvent = IRANIAN_EVENTS.find(
    (e) => e.day === selectedDay && e.month === today.monthName
  );
  const selectedDayPosts = workspacePosts.filter((p) => {
    if (!p.scheduledDateShamsi) return false;
    const postDay = p.scheduledDateShamsi.split('/')[2];
    return (
      postDay === toPersianDigits(selectedDayStr) ||
      postDay === selectedDayStr ||
      postDay === String(selectedDay) ||
      postDay === toPersianDigits(selectedDay)
    );
  });

  return (
    <div className="space-y-4 max-w-4xl mx-auto w-full select-none">
      {/* 1. Calendar Header & Controls */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-sky-50 text-[#3b96cc] border border-sky-200 shrink-0">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  تقویم محتوایی ۵ شبکه ({today.fullTitle})
                </h1>
                <span className="text-[11px] bg-sky-50 text-[#3b96cc] border border-sky-200 px-2.5 py-0.5 rounded-full font-mono font-black">
                  {toPersianDigits(workspacePosts.length)} پست
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                امروز: <strong className="text-slate-800">{today.fullDateWithWeekday}</strong> • زمان‌بندی خودکار در اینستاگرام، تلگرام، واتساپ، روبیکا و بله
              </p>
            </div>
          </div>

          {/* View Mode Toggle Button */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                viewMode === 'month'
                  ? 'bg-white text-[#3b96cc] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>نمای ماهانه</span>
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                viewMode === 'agenda'
                  ? 'bg-white text-[#3b96cc] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>لیست زمان‌بندی</span>
            </button>
          </div>
        </div>

        {/* Platform Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs no-scrollbar">
          {[
            { id: 'all', label: 'همه پلتفرم‌ها' },
            { id: 'instagram', label: 'اینستاگرام' },
            { id: 'telegram', label: 'تلگرام' },
            { id: 'whatsapp', label: 'واتساپ' },
            { id: 'rubika', label: 'روبیکا' },
            { id: 'bale', label: 'بله' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPlatformFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl transition-all font-black text-[11px] whitespace-nowrap cursor-pointer active:scale-95 ${
                platformFilter === item.id
                  ? 'bg-[#3b96cc] text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Monthly Grid View (Calculated with precise starting weekday offset) */}
      {viewMode === 'month' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-2.5 sm:p-5 shadow-xs space-y-3">
          {/* Weekday 7-Column Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center w-full">
            {weekDays.map((wd, i) => (
              <div
                key={i}
                className={`py-1.5 sm:py-2 text-[10px] sm:text-xs font-black rounded-xl border flex items-center justify-center ${
                  wd.isHoliday
                    ? 'text-rose-600 bg-rose-50/70 border-rose-200/80'
                    : 'text-slate-600 bg-slate-50 border-slate-200/70'
                }`}
              >
                <span className="sm:hidden">{wd.short}</span>
                <span className="hidden sm:inline">{wd.full}</span>
              </div>
            ))}
          </div>

          {/* Days Grid with precise start-of-month padding */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 w-full">
            {/* Empty slots for days before day 1 */}
            {Array.from({ length: startWeekdayIndex }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="p-1 sm:p-2.5 rounded-xl sm:rounded-2xl border border-transparent aspect-square sm:aspect-auto sm:min-h-[110px] opacity-10 pointer-events-none"
              />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const dayStr = String(dayNum).padStart(2, '0');
              const dayEvent = IRANIAN_EVENTS.find(
                (e) => e.day === dayNum && e.month === today.monthName
              );

              const dayPosts = workspacePosts.filter((p) => {
                if (!p.scheduledDateShamsi) return false;
                const postDay = p.scheduledDateShamsi.split('/')[2];
                return (
                  postDay === toPersianDigits(dayStr) ||
                  postDay === dayStr ||
                  postDay === String(dayNum) ||
                  postDay === toPersianDigits(dayNum)
                );
              });

              const isSelected = selectedDay === dayNum;
              const isToday = dayNum === today.day;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`relative p-1 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between aspect-square sm:aspect-auto sm:min-h-[110px] active:scale-95 ${
                    isToday
                      ? 'border-[#3b96cc] ring-2 ring-[#3b96cc]/40 bg-sky-50/60 shadow-sm'
                      : isSelected
                      ? 'border-[#3b96cc] ring-1 ring-[#3b96cc]/30 bg-sky-50/30'
                      : dayEvent?.type === 'hot'
                      ? 'bg-rose-50/50 border-rose-200/80 hover:border-rose-300'
                      : 'bg-white border-slate-200/90 hover:border-sky-300 hover:bg-slate-50/50'
                  }`}
                >
                  {/* Top Bar: Day Number & Event Pin */}
                  <div className="flex items-center justify-between gap-0.5 w-full">
                    <span
                      className={`text-[11px] sm:text-xs font-black font-mono w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-lg ${
                        isToday
                          ? 'bg-[#3b96cc] text-white shadow-xs font-black'
                          : isSelected
                          ? 'bg-sky-200 text-[#3b96cc] font-black'
                          : 'text-slate-800 bg-slate-100/90'
                      }`}
                    >
                      {toPersianDigits(dayNum)}
                    </span>

                    {isToday && (
                      <span className="text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#3b96cc] text-white">
                        امروز
                      </span>
                    )}

                    {dayEvent && !isToday && (
                      <span
                        title={dayEvent.title}
                        className="text-[9px] sm:text-[10px] flex items-center justify-center"
                      >
                        {dayEvent.type === 'hot' ? '🔥' : '⭐'}
                      </span>
                    )}
                  </div>

                  {/* Mobile Indicator: Mini Dots for Posts */}
                  <div className="flex sm:hidden items-center justify-center gap-1 mt-auto pb-0.5">
                    {dayPosts.slice(0, 3).map((post, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          post.platform === 'instagram'
                            ? 'bg-pink-500'
                            : post.platform === 'telegram'
                            ? 'bg-sky-500'
                            : post.platform === 'whatsapp'
                            ? 'bg-emerald-500'
                            : post.platform === 'rubika'
                            ? 'bg-purple-500'
                            : 'bg-teal-600'
                        }`}
                      />
                    ))}
                    {dayPosts.length > 3 && (
                      <span className="text-[8px] font-mono font-bold text-slate-500">
                        +{toPersianDigits(dayPosts.length - 3)}
                      </span>
                    )}
                  </div>

                  {/* Desktop Content: Visible Post Cards inside Cell */}
                  <div className="hidden sm:block space-y-1 mt-1.5">
                    {dayPosts.slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPost(post);
                        }}
                        className="p-1 rounded-lg text-[10px] bg-slate-50 hover:bg-sky-50 border border-slate-200 transition-colors flex items-center gap-1 truncate"
                      >
                        {getPlatformIcon(post.platform, 'w-3 h-3')}
                        <span className="truncate font-bold text-slate-800">{post.title}</span>
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <span className="text-[9px] text-[#3b96cc] font-black block text-center">
                        +{toPersianDigits(dayPosts.length - 2)} پست دیگر
                      </span>
                    )}
                  </div>

                  {/* Desktop Add Quick Post Button */}
                  <div className="hidden sm:flex items-center justify-end pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewDay(String(dayNum));
                        setIsNewPostModalOpen(true);
                      }}
                      className="text-[9px] text-[#3b96cc] hover:underline font-black"
                    >
                      + زمان‌بندی
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Selected Day Schedule Drawer / Bottom Panel */}
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3b96cc]" />
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>
                    {selectedDay === today.day
                      ? `برنامه انتشار امروز (${toPersianDigits(selectedDay)} ${today.monthName})`
                      : `برنامه انتشار روز ${toPersianDigits(selectedDay)} ${today.monthName}`}
                  </span>
                  {selectedDay === today.day && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-100 text-[#3b96cc] font-black">
                      امروز
                    </span>
                  )}
                </h3>
                {selectedDayEvent && (
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    {selectedDayEvent.type === 'hot' && <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />}
                    <span>{selectedDayEvent.title}</span>
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setNewDay(String(selectedDay));
                  setIsNewPostModalOpen(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#3b96cc] text-xs font-black transition-colors cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>زمان‌بندی پست جدید</span>
              </button>
            </div>

            {/* List of Posts on the Selected Day */}
            {selectedDayPosts.length > 0 ? (
              <div className="space-y-2">
                {selectedDayPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        {getPlatformIcon(post.platform, 'w-4 h-4')}
                      </div>
                      <div className="min-w-0 text-right">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 truncate">
                            {post.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{toPersianDigits(post.scheduledTime || '۱۹:۰۰')}</span>
                          <span>•</span>
                          <span>{getPlatformLabel(post.platform)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(post.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-500 font-medium">
                  {selectedDay === today.day
                    ? `هنوز پستی برای امروز (${toPersianDigits(selectedDay)} ${today.monthName}) زمان‌بندی نشده است.`
                    : `هنوز پستی برای روز ${toPersianDigits(selectedDay)} ${today.monthName} زمان‌بندی نشده است.`}
                </p>
                <button
                  onClick={() => {
                    setNewDay(String(selectedDay));
                    setIsNewPostModalOpen(true);
                  }}
                  className="text-xs font-black text-[#3b96cc] hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن اولین پست این روز</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Agenda / Schedule List View */}
      {viewMode === 'agenda' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs sm:text-sm font-black text-slate-900">
              لیست کامل پست‌های زمان‌بندی‌شده (به ترتیب تاریخ)
            </h3>
            <button
              onClick={() => setIsNewPostModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#3b96cc] text-white text-xs font-black transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>پست جدید</span>
            </button>
          </div>

          <div className="space-y-2">
            {workspacePosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-all flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                    {getPlatformIcon(post.platform, 'w-5 h-5')}
                  </div>
                  <div className="min-w-0 text-right">
                    <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">
                      {post.title}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                      <span>{post.scheduledDateShamsi}</span>
                      <span>ساعت {toPersianDigits(post.scheduledTime || '۱۹:۰۰')}</span>
                      <span>•</span>
                      <span>{getPlatformLabel(post.platform)}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {getStatusBadge(post.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Selected Post Modal Detail & Edit */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {getPlatformIcon(selectedPost.platform, 'w-5 h-5')}
                <h3 className="text-sm font-black text-slate-900">{selectedPost.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200 whitespace-pre-line max-h-48 overflow-y-auto">
              {selectedPost.content}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedPost.scheduledDateShamsi}</span>
                <span>-</span>
                <span>ساعت {toPersianDigits(selectedPost.scheduledTime || '۱۹:۰۰')}</span>
              </div>
              <span className="font-bold text-[11px] text-[#3b96cc]">
                {getPlatformLabel(selectedPost.platform)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">وضعیت:</span>
                <select
                  value={selectedPost.status}
                  onChange={(e) => {
                    const status = e.target.value as PostStatus;
                    updatePost(selectedPost.id, { status });
                    setSelectedPost({ ...selectedPost, status });
                  }}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-xl px-2.5 py-1.5 outline-none font-bold"
                >
                  <option value="draft">پیش‌نویس</option>
                  <option value="pending_approval">در انتظار تایید کارفرما</option>
                  <option value="approved">تایید شده</option>
                  <option value="published">منتشر شده</option>
                </select>
              </div>

              <button
                onClick={() => {
                  deletePost(selectedPost.id);
                  setSelectedPost(null);
                }}
                className="text-rose-600 text-xs flex items-center gap-1 font-bold hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف پست</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Manual Post Schedule Modal */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-black text-slate-900">
                زمان‌بندی پست برای روز {toPersianDigits(newDay)} {today.monthName}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewPostModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-800 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualPost} className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">عنوان پست:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: معرفی ویژگی‌های جدید..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#3b96cc] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">متن یا سناریوی پست:</label>
                <textarea
                  rows={3}
                  placeholder="کپشن یا سناریو محتوا..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#3b96cc] focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">پلتفرم:</label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 outline-none"
                  >
                    <option value="instagram">اینستاگرام</option>
                    <option value="telegram">تلگرام</option>
                    <option value="whatsapp">واتساپ</option>
                    <option value="rubika">روبیکا</option>
                    <option value="bale">بله</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    روز {today.monthName} (۱ تا {toPersianDigits(today.daysInMonth)}):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={today.daysInMonth}
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 outline-none text-center font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">ساعت انتشار:</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 outline-none text-center font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black bg-[#3b96cc] hover:bg-[#2c7ead] text-white rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  ذخیره و ثبت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

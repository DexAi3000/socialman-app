"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Calendar as CalendarIcon,
  Trash2,
} from 'lucide-react';
import {
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
  BaleIcon,
  RubikaIcon,
} from '@/components/SocialIcons';
import { toPersianDigits, IRANIAN_EVENTS } from '@/lib/utils';
import { Post, SocialPlatform, PostStatus } from '@/types';

export function CalendarView() {
  const { posts, activeWorkspace, updatePost, deletePost, addPost } = useApp();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>('instagram');
  const [newDay, setNewDay] = useState('۱۴');
  const [newTime, setNewTime] = useState('۱۹:۰۰');

  const daysInAzar = 30;
  const weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

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

  const getStatusBorder = (status: PostStatus) => {
    switch (status) {
      case 'approved':
        return 'border-r-4 border-[#00D166] bg-emerald-50 text-emerald-900';
      case 'pending_approval':
        return 'border-r-4 border-amber-500 bg-amber-50 text-amber-900';
      case 'draft':
        return 'border-r-4 border-slate-400 bg-slate-50 text-slate-800';
      case 'published':
        return 'border-r-4 border-blue-500 bg-blue-50 text-blue-900';
    }
  };

  const handleCreateManualPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addPost({
      workspaceId: activeWorkspace.id,
      title: newTitle,
      content: newContent,
      platform: newPlatform,
      status: 'draft',
      hashtags: ['مارکتینگ', 'تولید_محتوا'],
      scheduledDateShamsi: `۱۴۰۳/۰۹/${newDay.padStart(2, '۰')}`,
      scheduledTime: newTime,
    });
    setNewTitle('');
    setNewContent('');
    setIsNewPostModalOpen(false);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-50 text-[#00A852] border border-emerald-200">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900">تقویم ۵ پلتفرم (آذر ۱۴۰۳)</h1>
              <span className="text-[11px] bg-emerald-50 text-[#00A852] border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono font-bold">
                {toPersianDigits(workspacePosts.length)} پست
              </span>
            </div>
            <p className="text-xs text-slate-500">
              مدیریت زمان انتشار در اینستاگرام، تلگرام، واتساپ، روبیکا و بله
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-2xl p-1 text-xs">
          {[
            { id: 'all', label: 'همه' },
            { id: 'instagram', label: 'اینستا' },
            { id: 'telegram', label: 'تلگرام' },
            { id: 'whatsapp', label: 'واتساپ' },
            { id: 'rubika', label: 'روبیکا' },
            { id: 'bale', label: 'بله' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPlatformFilter(item.id)}
              className={`px-2.5 py-1 rounded-xl transition-all font-bold ${
                platformFilter === item.id
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shamsi Calendar Grid */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-xs overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 mb-3 min-w-[650px]">
          {weekDays.map((wd, i) => (
            <div
              key={i}
              className="text-center py-2 text-xs font-black text-slate-500 bg-slate-50 rounded-xl border border-slate-200/70"
            >
              {wd}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 min-w-[650px]">
          {Array.from({ length: daysInAzar }).map((_, index) => {
            const dayNum = index + 1;
            const dayStr = String(dayNum).padStart(2, '۰');
            const dayEvent = IRANIAN_EVENTS.find((e) => e.day === dayNum && e.month === 'آذر');

            const dayPosts = workspacePosts.filter((p) => {
              const postDay = p.scheduledDateShamsi.split('/')[2];
              return postDay === toPersianDigits(dayStr) || postDay === dayStr;
            });

            return (
              <div
                key={dayNum}
                className={`min-h-[110px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                  dayEvent?.type === 'hot'
                    ? 'bg-rose-50/70 border-rose-300'
                    : 'bg-white border-slate-200 hover:border-[#00D166]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-black font-mono w-6 h-6 flex items-center justify-center rounded-lg ${
                        dayNum === 14
                          ? 'bg-[#00D166] text-slate-950 font-bold'
                          : 'text-slate-700 bg-slate-100'
                      }`}
                    >
                      {toPersianDigits(dayNum)}
                    </span>
                    {dayEvent && (
                      <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-200 px-1 py-0.5 rounded font-black truncate max-w-[65px]">
                        {dayEvent.type === 'hot' ? '🔥 یلدا' : dayEvent.title.split(' ')[0]}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className={`p-1.5 rounded-lg text-[10px] cursor-pointer hover:opacity-90 transition-all ${getStatusBorder(
                          post.status
                        )}`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          {getPlatformIcon(post.platform)}
                          <span className="text-[9px] font-mono text-slate-500">
                            {toPersianDigits(post.scheduledTime)}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 truncate">{post.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => {
                      setNewDay(String(dayNum));
                      setIsNewPostModalOpen(true);
                    }}
                    className="text-[9px] text-[#00A852] font-black"
                  >
                    + پست
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {getPlatformIcon(selectedPost.platform, 'w-5 h-5')}
                <h3 className="text-sm font-black text-slate-900">{selectedPost.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-xs text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200 whitespace-pre-line max-h-48 overflow-y-auto">
              {selectedPost.content}
            </p>

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
                className="text-rose-600 text-xs flex items-center gap-1 font-bold hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Post Modal */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-black text-slate-900 mb-3">افزودن پست به تقویم</h3>
            <form onSubmit={handleCreateManualPost} className="space-y-3">
              <input
                type="text"
                required
                placeholder="عنوان پست..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#00D166] focus:bg-white"
              />

              <textarea
                rows={3}
                placeholder="متن پست..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#00D166] focus:bg-white"
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value as SocialPlatform)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                >
                  <option value="instagram">اینستاگرام</option>
                  <option value="telegram">تلگرام</option>
                  <option value="whatsapp">واتساپ</option>
                  <option value="rubika">روبیکا</option>
                  <option value="bale">بله</option>
                </select>

                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                  placeholder="روز آذر"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-[#00D166] text-slate-950 rounded-xl shadow-xs"
                >
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

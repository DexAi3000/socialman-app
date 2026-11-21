"use client";

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Send,
  Calendar,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  Crown,
  Eye,
  AlertCircle,
  Hash,
  Link2,
  X,
  Share2,
} from 'lucide-react';
import {
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
  BaleIcon,
  RubikaIcon,
} from './SocialIcons';
import {
  SnappInstagramIcon,
  SnappTelegramIcon,
  SnappWhatsappIcon,
  SnappRubikaIcon,
  SnappBaleIcon,
} from './SnappIcons';
import { SocialPlatform } from '@/types';
import { toPersianDigits } from '@/lib/utils';

export function MultiPublishView() {
  const {
    activeWorkspace,
    addPost,
    currentPlan,
    openUpgradeModal,
    openConnectModal,
    connectedAccounts,
  } = useApp();

  // Selected Target Platforms (default: all 5 platforms)
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([
    'instagram',
    'telegram',
    'whatsapp',
    'rubika',
    'bale',
  ]);

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('سوشال_من، رشد_کسب_و_کار، بازاریابی');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<SocialPlatform>('instagram');

  // Scheduling state
  const [scheduleDate, setScheduleDate] = useState('۱۴۰۳/۰۹/۱۰');
  const [scheduleTime, setScheduleTime] = useState('۱۸:۳۰');
  const [isScheduledMode, setIsScheduledMode] = useState(false);

  // Publishing simulation state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [publishProgress, setPublishProgress] = useState<{ [key in SocialPlatform]?: 'pending' | 'success' }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (p: SocialPlatform) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishNow = async () => {
    if (!caption.trim() && !title.trim()) return;

    setIsPublishing(true);
    setPublishedSuccess(false);

    // Progressive publishing simulation across selected platforms
    const progressMap: { [key in SocialPlatform]?: 'pending' | 'success' } = {};
    for (const p of selectedPlatforms) {
      progressMap[p] = 'pending';
    }
    setPublishProgress({ ...progressMap });

    for (const p of selectedPlatforms) {
      await new Promise((r) => setTimeout(r, 400));
      progressMap[p] = 'success';
      setPublishProgress({ ...progressMap });

      // Save to posts context
      addPost({
        workspaceId: activeWorkspace.id,
        title: title || caption.slice(0, 30) || 'پست انتشار همزمان',
        content: caption,
        hook: title,
        hashtags: hashtags.split(/[،, ]+/).filter(Boolean),
        platform: p,
        status: 'published',
        scheduledDateShamsi: 'امروز',
        scheduledTime: 'هم‌اکنون',
      });
    }

    setIsPublishing(false);
    setPublishedSuccess(true);
    setTimeout(() => setPublishedSuccess(false), 5000);
  };

  const handleSchedulePost = () => {
    if (!caption.trim() && !title.trim()) return;

    for (const p of selectedPlatforms) {
      addPost({
        workspaceId: activeWorkspace.id,
        title: title || caption.slice(0, 30) || 'پست زمان‌بندی شده',
        content: caption,
        hook: title,
        hashtags: hashtags.split(/[،, ]+/).filter(Boolean),
        platform: p,
        status: 'approved',
        scheduledDateShamsi: scheduleDate,
        scheduledTime: scheduleTime,
      });
    }

    setPublishedSuccess(true);
    setTimeout(() => setPublishedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-2xl bg-sky-50 text-[#3b96cc] border border-sky-100 shadow-xs">
              <Send className="w-5 h-5 fill-[#3b96cc] rotate-45 -mr-0.5" />
            </div>
            <h1 className="text-lg sm:text-xl font-black text-gray-900">
              مرکز انتشار و زمان‌بندی همزمان ۵ پلتفرم
            </h1>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            محتوا را یک‌بار آماده کنید و همزمان در اینستاگرام، تلگرام، واتساپ، روبیکا و بله منتشر یا زمان‌بندی نمایید.
          </p>
        </div>

        {/* AI Generator Gate status chip */}
        <div className="flex items-center gap-2">
          {currentPlan === 'agency' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
              <span>هوش مصنوعی Gemini فعال ✨</span>
            </span>
          ) : (
            <button
              onClick={() => openUpgradeModal('agency')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-black transition-colors"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>دستیار هوش مصنوعی (ویژه پلن طلایی)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Composer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Post Creator Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-5 sm:p-7 shadow-xs space-y-5">
          {/* 1. Target Platforms Toggle Bar */}
          <div>
            <label className="block text-xs font-black text-gray-800 mb-2.5 text-right">
              ۱. انتخاب شبکه‌های هدف برای انتشار همزمان ({toPersianDigits(selectedPlatforms.length)} پلتفرم فعال):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'instagram' as SocialPlatform, name: 'اینستاگرام', icon: SnappInstagramIcon },
                { id: 'telegram' as SocialPlatform, name: 'تلگرام', icon: SnappTelegramIcon },
                { id: 'whatsapp' as SocialPlatform, name: 'واتساپ', icon: SnappWhatsappIcon },
                { id: 'rubika' as SocialPlatform, name: 'روبیکا', icon: SnappRubikaIcon },
                { id: 'bale' as SocialPlatform, name: 'بله', icon: SnappBaleIcon },
              ].map((item) => {
                const isSelected = selectedPlatforms.includes(item.id);
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePlatform(item.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all text-center ${
                      isSelected
                        ? 'bg-sky-50/70 border-[#3b96cc] shadow-xs'
                        : 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <IconComponent className="w-8 h-8" />
                    <span className={`text-[11px] font-black ${isSelected ? 'text-[#3b96cc]' : 'text-gray-600'}`}>
                      {item.name}
                    </span>
                    <span className="text-[9px] font-bold text-gray-400">
                      {isSelected ? '✓ انتخاب شده' : 'غیرفعال'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Post Title / Hook */}
          <div>
            <label className="block text-xs font-black text-gray-800 mb-1.5 text-right">
              ۲. عنوان یا قلاب پست (Hook):
            </label>
            <input
              type="text"
              placeholder="مثال: ۵ راز مهم برای افزایش فروش پاییزی در شبکه‌های اجتماعی"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] rounded-2xl px-4 py-3 text-xs sm:text-sm text-gray-900 font-medium outline-none transition-all"
            />
          </div>

          {/* 3. Main Content / Caption Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black text-gray-800 text-right">
                ۳. متن پست و کپشن مشترک:
              </label>
              <span className="text-[10px] text-gray-400 font-mono">
                {toPersianDigits(caption.length)} کاراکتر
              </span>
            </div>
            <textarea
              rows={5}
              placeholder="متن اصلی پست را اینجا بنویسید... (این متن همزمان برای تلگرام، واتساپ، بله، اینستاگرام و روبیکا ارسال خواهد شد)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] rounded-2xl p-4 text-xs sm:text-sm text-gray-900 font-medium outline-none leading-relaxed transition-all resize-none"
            />
          </div>

          {/* 4. Hashtags */}
          <div>
            <label className="block text-xs font-black text-gray-800 mb-1.5 text-right">
              ۴. هشتگ‌ها (با کاما جدا کنید):
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="سوشال_من، رشد_کسب_و_کار، بازاریابی"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] rounded-2xl px-4 py-2.5 text-xs text-gray-800 font-medium outline-none pr-9"
              />
              <Hash className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* 5. Media Upload (Photo / Banner) */}
          <div>
            <label className="block text-xs font-black text-gray-800 mb-1.5 text-right">
              ۵. تصویر یا بنر ضمیمه پست:
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-44 bg-gray-100 flex items-center justify-center group">
                <img src={imagePreview} alt="پیش‌نمایش" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 left-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 hover:border-sky-300 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-sky-50/30 flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#3b96cc] flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-gray-700">کلیک برای انتخاب تصویر پست</span>
                <span className="text-[10px] text-gray-400">فرمت‌های PNG، JPG، WebP تا حجم ۱۰ مگابایت</span>
              </div>
            )}
          </div>

          {/* 6. Scheduling or Immediate Publish Option */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-800">نحوه انتشار:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduledMode(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    !isScheduledMode ? 'bg-[#3b96cc] text-white shadow-xs' : 'text-gray-500 bg-white border border-gray-200'
                  }`}
                >
                  انتشار آنی 🚀
                </button>
                <button
                  type="button"
                  onClick={() => setIsScheduledMode(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isScheduledMode ? 'bg-[#3b96cc] text-white shadow-xs' : 'text-gray-500 bg-white border border-gray-200'
                  }`}
                >
                  زمان‌بندی در تقویم 📅
                </button>
              </div>
            </div>

            {isScheduledMode && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">تاریخ شمسی:</label>
                  <input
                    type="text"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold font-mono text-center outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">ساعت انتشار:</label>
                  <input
                    type="text"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold font-mono text-center outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div className="pt-2">
            {!isScheduledMode ? (
              <button
                type="button"
                disabled={isPublishing || (!caption.trim() && !title.trim())}
                onClick={handlePublishNow}
                className="w-full py-4 rounded-2xl font-black text-xs sm:text-sm bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-lg shadow-[#3b96cc]/30 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>در حال مخابره به ۵ پلتفرم...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 fill-white rotate-45 -mr-0.5" />
                    <span>انتشار آنی در {toPersianDigits(selectedPlatforms.length)} شبکه اجتماعی</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSchedulePost}
                disabled={!caption.trim() && !title.trim()}
                className="w-full py-4 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-[#3b96cc] to-sky-600 text-white shadow-lg shadow-[#3b96cc]/30 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
              >
                <Calendar className="w-4 h-4" />
                <span>ثبت زمان‌بندی در تقویم محتوایی آذر</span>
              </button>
            )}

            {publishedSuccess && (
              <div className="mt-3 p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold flex items-center justify-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-[#3b96cc]" />
                <span>عملیات با موفقیت انجام شد و در صف انتشار ثبت گردید!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Multi-Channel Simulator Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#3b96cc]" />
                پیش‌نمایش زنده در کانال‌های ارتباطی
              </span>
              <span className="text-[10px] text-gray-400 font-bold">شبیه‌ساز رسمی</span>
            </div>

            {/* Platform Selector for Preview */}
            <div className="flex items-center justify-between gap-1 p-1 bg-gray-50 rounded-2xl border border-gray-100">
              {[
                { id: 'instagram' as SocialPlatform, label: 'اینستاگرام', icon: '/instagram-clean.png' },
                { id: 'telegram' as SocialPlatform, label: 'تلگرام', icon: '/telegram-clean.png' },
                { id: 'whatsapp' as SocialPlatform, label: 'واتساپ', icon: '/whatsapp-clean.png' },
                { id: 'rubika' as SocialPlatform, label: 'روبیکا', icon: '/rubika-icon.png' },
                { id: 'bale' as SocialPlatform, label: 'بله' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePreviewTab(p.id)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
                    activePreviewTab === p.id
                      ? 'bg-white text-[#3b96cc] shadow-xs font-black'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {p.icon && <img src={p.icon} alt={p.label} className="w-3.5 h-3.5 object-contain" />}
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Device Frame Simulation */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50/70 p-4 space-y-3 shadow-inner">
              {/* Account header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3b96cc] to-sky-400 flex items-center justify-center text-white text-xs font-black">
                    {activeWorkspace.name.charAt(0)}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-gray-800 block">{activeWorkspace.name}</span>
                    <span className="text-[9px] text-gray-400 font-mono">
                      {activePreviewTab === 'telegram'
                        ? '@official_channel'
                        : activePreviewTab === 'instagram'
                        ? 'Instagram Post'
                        : 'Official Account'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">هم‌اکنون</span>
              </div>

              {/* Post Image Preview */}
              {imagePreview && (
                <div className="rounded-xl overflow-hidden max-h-48 bg-black/5">
                  <img src={imagePreview} alt="پست" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Title & Body Text */}
              <div className="space-y-1.5 text-right text-xs leading-relaxed text-gray-800">
                {title && <h4 className="font-black text-sm text-gray-900">{title}</h4>}
                <p className="whitespace-pre-line text-gray-700 font-medium">
                  {caption || 'متن پست شما پس از تایپ در اینجا به صورت زنده پیش‌نمایش داده می‌شود...'}
                </p>
                {hashtags && (
                  <p className="text-[11px] text-sky-600 font-bold dir-ltr text-right">
                    {hashtags.split(/[،, ]+/).filter(Boolean).map((h) => `#${h} `)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Publishing Dispatch Status Monitor */}
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-800 block">
                وضعیت کانال‌های متصل ({toPersianDigits(selectedPlatforms.length)} کانال فعال):
              </span>
              <button
                type="button"
                onClick={() => openConnectModal()}
                className="text-[11px] font-black text-[#3b96cc] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>تنظیم و اتصال اکانت‌ها</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { id: 'instagram' as SocialPlatform, name: 'اینستاگرام (Graph API)', desc: 'ریلز و استوری', icon: '/instagram-clean.png' },
                { id: 'telegram' as SocialPlatform, name: 'تلگرام رسمی (Bot API)', desc: 'پست متنی و عکس', icon: '/telegram-clean.png' },
                { id: 'whatsapp' as SocialPlatform, name: 'واتساپ (Cloud API)', desc: 'کانال و برودکست', icon: '/whatsapp-clean.png' },
                { id: 'rubika' as SocialPlatform, name: 'روبیکا و روبینو', desc: 'کانال و روبینو', icon: '/rubika-icon.png' },
                { id: 'bale' as SocialPlatform, name: 'پیام‌رسان بله (Bale Bot)', desc: 'کانال رسمی', icon: null },
              ].map((c) => {
                const isSelected = selectedPlatforms.includes(c.id);
                const isConnected = connectedAccounts[c.id]?.isConnected;
                return (
                  <div
                    key={c.id}
                    onClick={() => openConnectModal(c.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer hover:border-[#3b96cc] transition-colors ${
                      isSelected && isConnected
                        ? 'bg-sky-50/40 border-sky-100'
                        : 'bg-gray-50/60 border-gray-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {c.icon ? (
                          <img src={c.icon} alt={c.name} className="w-4 h-4 object-contain" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-teal-600 flex items-center justify-center text-[8px] text-white font-bold">ب</span>
                        )}
                      </div>
                      <span className="font-bold text-gray-800">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-medium">{c.desc}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                          isConnected
                            ? 'bg-sky-100 text-[#3b96cc]'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {isConnected ? 'متصل' : 'قطع'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

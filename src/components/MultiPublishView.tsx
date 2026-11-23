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
  SnappPublishIcon,
} from './SnappIcons';
import { SocialPlatform, AppTab } from '@/types';
import { toPersianDigits, getShamsiToday } from '@/lib/utils';

export function MultiPublishView({ onNavigateTab }: { onNavigateTab?: (tab: AppTab) => void } = {}) {
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
  const [scheduleDate, setScheduleDate] = useState(() => getShamsiToday().formatted);
  const [scheduleTime, setScheduleTime] = useState(() => getShamsiToday().timeFormatted || '۱۹:۰۰');
  const [isScheduledMode, setIsScheduledMode] = useState(false);

  // Publishing simulation state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [publishErrorMessage, setPublishErrorMessage] = useState<string | null>(null);
  const [publishProgress, setPublishProgress] = useState<{ [key in SocialPlatform]?: 'pending' | 'success' | 'error' }>({});

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
    setPublishErrorMessage(null);

    // Validate if at least one selected platform is actually connected
    const connectedSelected = selectedPlatforms.filter(
      (p) => connectedAccounts[p]?.isConnected && connectedAccounts[p]?.handle
    );

    if (connectedSelected.length === 0) {
      setIsPublishing(false);
      setPublishErrorMessage(
        'هیچ‌کدام از پلتفرم‌های انتخابی متصل نیستند! لطفاً ابتدا با کلیک روی گزینه «تنظیم و اتصال اکانت‌ها» در پنل سمت چپ، آیدی کانال خود را متصل کنید.'
      );
      openConnectModal(selectedPlatforms[0]);
      return;
    }

    // Progressive publishing simulation across selected platforms
    const progressMap: { [key in SocialPlatform]?: 'pending' | 'success' | 'error' } = {};
    for (const p of selectedPlatforms) {
      progressMap[p] = 'pending';
    }
    setPublishProgress({ ...progressMap });

    try {
      // Build accounts config from user's connected channels
      const accountsConfig: Record<string, { channelId?: string }> = {};
      for (const p of selectedPlatforms) {
        if (connectedAccounts[p]?.handle) {
          accountsConfig[p] = {
            channelId: connectedAccounts[p].handle,
          };
        }
      }

      // Call real publisher API
      const res = await fetch('/socialman/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: activeWorkspace.id,
          title: title || caption.slice(0, 30) || 'پست انتشار همزمان',
          content: caption,
          hook: title,
          hashtags: hashtags.split(/[،, ]+/).filter(Boolean),
          platforms: selectedPlatforms,
          isImmediate: true,
          scheduledDateShamsi: 'امروز',
          scheduledTime: 'هم‌اکنون',
          mediaUrl: imagePreview,
          accountsConfig,
        }),
      });
      const data = await res.json().catch(() => null);
      console.log('Publish API result:', data);

      if (data?.publishResults) {
        let hasFailure = false;
        const failedMsgs: string[] = [];
        for (const p of selectedPlatforms) {
          const pRes = data.publishResults[p];
          if (pRes && pRes.success === false) {
            progressMap[p] = 'error';
            hasFailure = true;
            failedMsgs.push(`${p}: ${pRes.error || 'خطا در انتشار'}`);
          } else {
            progressMap[p] = 'success';
          }
        }
        setPublishProgress({ ...progressMap });

        if (hasFailure) {
          setPublishErrorMessage(data.message || failedMsgs.join(' | '));
        } else {
          setPublishedSuccess(true);
          setTimeout(() => setPublishedSuccess(false), 5000);
        }
      } else if (!res.ok) {
        for (const p of selectedPlatforms) {
          progressMap[p] = 'error';
        }
        setPublishProgress({ ...progressMap });
        setPublishErrorMessage(data?.error || 'خطا در ارسال پست به پلتفرم‌های انتخابی');
      } else {
        for (const p of selectedPlatforms) {
          progressMap[p] = 'success';
        }
        setPublishProgress({ ...progressMap });
        setPublishedSuccess(true);
        setTimeout(() => setPublishedSuccess(false), 5000);
      }

      // Save to local context
      for (const p of selectedPlatforms) {
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
          mediaUrl: imagePreview || undefined,
        });
      }
    } catch (err: any) {
      console.error('Publish API error:', err);
      setPublishErrorMessage(err.message || 'خطای شبکه در ارتباط با سرور انتشار');
    } finally {
      setIsPublishing(false);
    }
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header Info */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <SnappPublishIcon className="size-11 sm:size-12" />
          <div className="min-w-0">
            <h1 className="text-lg font-black text-slate-900 sm:text-2xl">انتشار و زمان‌بندی</h1>
            <p className="mt-0.5 text-sm leading-6 text-slate-600">یک پست بساز و کانال‌های مقصدش را انتخاب کن.</p>
          </div>
        </div>

        {/* AI Generator Gate status chip */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab?.('ai-studio')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95"
            title="ورود به استودیوی هوش مصنوعی"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
            <span>هوش مصنوعی فعال</span>
          </button>
        </div>
      </div>

      {/* Main Composer Grid */}
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-5">
        {/* Left Column: Post Creator Form (7 cols) */}
        <div className="min-w-0 space-y-5 rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-6 lg:col-span-7">
          {/* 1. Target Platforms Toggle Bar */}
          <div role="group" aria-labelledby="publish-networks">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-1">
              <h2 id="publish-networks" className="text-sm font-black text-slate-900">کانال‌های مقصد</h2>
              <span className="text-xs font-medium text-slate-600">{toPersianDigits(selectedPlatforms.length)} انتخاب‌شده</span>
            </div>
            <div className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-3 sm:grid-cols-5">
              {[
                { id: 'instagram' as SocialPlatform, name: 'اینستاگرام', icon: SnappInstagramIcon },
                { id: 'telegram' as SocialPlatform, name: 'تلگرام', icon: SnappTelegramIcon },
                { id: 'whatsapp' as SocialPlatform, name: 'واتساپ', icon: SnappWhatsappIcon },
                { id: 'rubika' as SocialPlatform, name: 'روبیکا', icon: SnappRubikaIcon },
                { id: 'bale' as SocialPlatform, name: 'بله', icon: SnappBaleIcon },
              ].map((item) => {
                const isSelected = selectedPlatforms.includes(item.id);
                const isConnected = !!(connectedAccounts[item.id]?.isConnected && connectedAccounts[item.id]?.handle);
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => togglePlatform(item.id)}
                    className={`flex min-w-0 cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 text-center transition-colors ${
                      isSelected
                        ? isConnected
                          ? 'bg-sky-50/70 border-[#3b96cc] shadow-xs'
                          : 'bg-amber-50/50 border-amber-300 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <IconComponent className="w-8 h-8" />
                    <span className={`text-[11px] font-black ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                      {item.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? isConnected
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-amber-800 bg-amber-100'
                          : 'text-gray-400'
                      }`}
                    >
                      {isSelected
                        ? isConnected
                          ? 'متصل و فعال'
                          : 'نیاز به اتصال'
                        : isConnected
                        ? 'متصل'
                        : 'غیرفعال'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Post Title / Hook */}
          <div>
            <label htmlFor="publish-title" className="mb-1.5 block text-sm font-bold text-slate-900">
              عنوان پست
            </label>
            <input
              id="publish-title"
              type="text"
              placeholder="مثال: ۵ راز مهم برای افزایش فروش پاییزی در شبکه‌های اجتماعی"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base font-medium text-slate-900 focus:bg-white sm:text-sm"
            />
          </div>

          {/* 3. Main Content / Caption Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="publish-caption" className="block text-sm font-bold text-slate-900">
                متن پست
              </label>
              <span className="text-[10px] text-gray-400 font-mono">
                {toPersianDigits(caption.length)} نویسه
              </span>
            </div>
            <textarea
              id="publish-caption"
              rows={5}
              placeholder="متن یا کپشن پست را بنویس…"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base leading-7 font-medium text-slate-900 focus:bg-white sm:text-sm"
            />
          </div>

          {/* 4. Hashtags */}
          <div>
            <label htmlFor="publish-hashtags" className="mb-1.5 block text-sm font-bold text-slate-900">
              هشتگ‌ها
            </label>
            <div className="relative">
              <input
                id="publish-hashtags"
                type="text"
                placeholder="سوشال_من، رشد_کسب_و_کار، بازاریابی"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 ps-9 pe-3 text-base font-medium text-slate-900 focus:bg-white sm:text-sm"
              />
              <Hash className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* 5. Media Upload (Photo / Banner) */}
          <div>
            <h2 className="mb-1.5 text-sm font-bold text-slate-900">تصویر پست</h2>
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
                  aria-label="حذف تصویر پست"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 left-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center transition-colors hover:border-sky-500 hover:bg-sky-50"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#3b96cc] flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-black text-gray-700">کلیک برای انتخاب تصویر پست</span>
                <span className="text-[10px] text-gray-400">فرمت‌های PNG، JPG، WebP تا حجم ۱۰ مگابایت</span>
              </button>
            )}
          </div>

          {/* 6. Scheduling or Immediate Publish Option */}
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-slate-900">زمان انتشار</span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  aria-pressed={!isScheduledMode}
                  onClick={() => setIsScheduledMode(false)}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition-colors ${
                    !isScheduledMode ? 'bg-[#3b96cc] text-white shadow-xs' : 'text-gray-500 bg-white border border-gray-200'
                  }`}
                >
                  <Send className="h-4 w-4" />
                  انتشار آنی
                </button>
                <button
                  type="button"
                  aria-pressed={isScheduledMode}
                  onClick={() => setIsScheduledMode(true)}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold transition-colors ${
                    isScheduledMode ? 'bg-[#3b96cc] text-white shadow-xs' : 'text-gray-500 bg-white border border-gray-200'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  زمان‌بندی
                </button>
              </div>
            </div>

            {isScheduledMode && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                <div>
                  <label htmlFor="publish-date" className="mb-1 block text-xs font-bold text-slate-700">تاریخ شمسی</label>
                  <input
                    id="publish-date"
                    type="text"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="min-h-10 w-full rounded-lg border border-slate-200 bg-white p-2 text-center text-base font-bold sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="publish-time" className="mb-1 block text-xs font-bold text-slate-700">ساعت انتشار</label>
                  <input
                    id="publish-time"
                    type="text"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="min-h-10 w-full rounded-lg border border-slate-200 bg-white p-2 text-center text-base font-bold sm:text-sm"
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
                    <span>در حال انتشار...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 fill-white rotate-45 -mr-0.5" />
                    <span>انتشار</span>
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
                <span>ثبت زمان‌بندی در تقویم</span>
              </button>
            )}

            {publishedSuccess && (
              <div className="mt-3 p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-black flex items-center justify-center gap-2 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-[#3b96cc]" />
                <span>پست با موفقیت در کانال‌های انتخابی منتشر شد</span>
              </div>
            )}

            {publishErrorMessage && (
              <div className="mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-start gap-2 shadow-xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="leading-relaxed">{publishErrorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Multi-Channel Simulator Preview (5 cols) */}
        <div className="min-w-0 space-y-4 lg:col-span-5">
          <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#3b96cc]" />
                پیش‌نمایش زنده در کانال‌های ارتباطی
              </span>
              <span className="text-[10px] text-gray-400 font-bold">شبیه‌ساز رسمی</span>
            </div>

            {/* Platform Selector for Preview */}
            <div className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {[
                { id: 'instagram' as SocialPlatform, label: 'اینستاگرام', icon: <InstagramIcon className="h-3.5 w-3.5" /> },
                { id: 'telegram' as SocialPlatform, label: 'تلگرام', icon: <TelegramIcon className="h-3.5 w-3.5" /> },
                { id: 'whatsapp' as SocialPlatform, label: 'واتساپ', icon: <WhatsappIcon className="h-3.5 w-3.5" /> },
                { id: 'rubika' as SocialPlatform, label: 'روبیکا', icon: <RubikaIcon className="h-3.5 w-3.5" /> },
                { id: 'bale' as SocialPlatform, label: 'بله', icon: <BaleIcon className="h-3.5 w-3.5" /> },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={activePreviewTab === p.id}
                  onClick={() => setActivePreviewTab(p.id)}
                  className={`flex min-h-9 grow items-center justify-center gap-1 rounded-lg px-1.5 text-xs font-bold transition-colors ${
                    activePreviewTab === p.id
                      ? 'bg-white text-[#3b96cc] shadow-xs font-black'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {p.icon}
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
              {(() => {
                const connectedCount = Object.values(connectedAccounts || {}).filter(
                  (a) => a?.isConnected && a?.handle
                ).length;
                return (
                  <span className="text-xs font-black text-gray-800 block">
                    {connectedCount === 0
                      ? 'وضعیت کانال‌ها (هیچ کانالی متصل نیست):'
                      : `وضعیت کانال‌های متصل (${toPersianDigits(connectedCount)} از ۵ کانال فعال):`}
                  </span>
                );
              })()}
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
                { id: 'instagram' as SocialPlatform, name: 'اینستاگرام (Graph API)', desc: 'ریلز و استوری', icon: <InstagramIcon className="h-4 w-4" /> },
                { id: 'telegram' as SocialPlatform, name: 'تلگرام رسمی (Bot API)', desc: 'پست متنی و عکس', icon: <TelegramIcon className="h-4 w-4" /> },
                { id: 'whatsapp' as SocialPlatform, name: 'واتساپ (Cloud API)', desc: 'کانال و برودکست', icon: <WhatsappIcon className="h-4 w-4" /> },
                { id: 'rubika' as SocialPlatform, name: 'روبیکا و روبینو', desc: 'کانال و روبینو', icon: <RubikaIcon className="h-4 w-4" /> },
                { id: 'bale' as SocialPlatform, name: 'پیام‌رسان بله (Bale Bot)', desc: 'کانال رسمی', icon: <BaleIcon className="h-4 w-4" /> },
              ].map((c) => {
                const isSelected = selectedPlatforms.includes(c.id);
                const account = connectedAccounts[c.id];
                const isConnected = !!(account?.isConnected && account?.handle);
                return (
                  <div
                    key={c.id}
                    onClick={() => openConnectModal(c.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer hover:border-[#3b96cc] transition-colors ${
                      isConnected
                        ? 'bg-sky-50/40 border-sky-100'
                        : 'bg-gray-50/70 border-gray-100 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {c.icon}
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="font-bold text-gray-800">{c.name}</span>
                        {isConnected && account?.handle ? (
                          <span className="text-[10px] text-sky-700 font-mono font-bold">{account.handle}</span>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-medium">{c.desc}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-md font-bold transition-all ${
                          isConnected
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {isConnected ? 'متصل' : '+ اتصال اکانت'}
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

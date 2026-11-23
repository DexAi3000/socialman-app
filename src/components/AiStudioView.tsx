"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  Copy,
  Check,
  CalendarPlus,
  Clock,
  Smartphone,
  Crown,
  Type,
  ImageIcon,
  Download,
  ExternalLink,
  Layers,
  Wand2,
} from 'lucide-react';
import {
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
  BaleIcon,
  RubikaIcon,
} from '@/components/SocialIcons';
import { SocialPlatform, ContentTone, AiGenerationResponse } from '@/types';
import { getShamsiToday } from '@/lib/utils';

interface AiStudioViewProps {
  initialPlatform?: SocialPlatform;
}

export function AiStudioView({ initialPlatform = 'instagram' }: AiStudioViewProps) {
  const {
    currentPlan,
    aiUsageCount,
    canUseAi,
    recordAiUsage,
    openUpgradeModal,
    addPost,
    activeWorkspace,
  } = useApp();

  // Section toggle between Text and Image generation
  const [section, setSection] = useState<'text' | 'image'>('text');

  // --- Text generation state ---
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<SocialPlatform>(initialPlatform);
  const [tone, setTone] = useState<ContentTone>('friendly');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiGenerationResponse | null>({
    hook: 'راز مهمی درباره الگوریتم جدید که نباید از دست بدی! 💡',
    content: 'در بروزرسانی جدید، استمرار و تعامل مخاطب در ساعات اولیه انتشار اهمیت دوچندان پیدا کرده است.\n\n۳ نکته کلیدی:\n۱. انتشار در زمان اوج آنلاین بودن کاربران\n۲. پاسخ سریع به ۳ کامنت اول\n۳. استفاده از قلاب توقف‌کننده در خط اول',
    cta: 'برای دریافت فایل چک‌لیست کلمه «رشد» را ارسال کنید 👇',
    hashtags: ['تولید_محتوا', 'سوشال_مدیا', 'رشد_پیج', 'کسب_و_کار'],
    suggestedBestTime: '۱۹:۳۰ عصر',
  });
  const [copied, setCopied] = useState(false);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  // --- Image generation state ---
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageStyle, setImageStyle] = useState<'realistic' | 'cartoon' | 'digital_art' | 'minimal'>('realistic');
  const [imageAspectRatio, setImageAspectRatio] = useState<'square' | 'portrait' | 'landscape'>('square');
  const [imageResultUrl, setImageResultUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [imageScheduledSuccess, setImageScheduledSuccess] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);

  const platforms = [
    { id: 'instagram' as SocialPlatform, label: 'اینستاگرام', icon: InstagramIcon, color: 'text-pink-500' },
    { id: 'telegram' as SocialPlatform, label: 'تلگرام', icon: TelegramIcon, color: 'text-sky-500' },
    { id: 'whatsapp' as SocialPlatform, label: 'واتساپ', icon: WhatsappIcon, color: 'text-[#25D366]' },
    { id: 'rubika' as SocialPlatform, label: 'روبیکا', icon: RubikaIcon, color: 'text-purple-600' },
    { id: 'bale' as SocialPlatform, label: 'بله', icon: BaleIcon, color: 'text-teal-600' },
  ];

  const quickIdeasText = [
    'تخفیف ویژه شب یلدا با کد تخفیف YALDA',
    '۵ اشتباه رایج در تولید محتوا و راه‌حل آن‌ها',
    'پشت صحنه بسته‌بندی سفارشات فروشگاه',
    'معرفی ویژگی جدید محصول برای مشتریان',
  ];

  const quickIdeasImage = [
    'عکاسی تبلیغاتی و لوکس از بطری عطر روی سنگ مرمر با نور طلایی',
    'کاراکتر سه بعدی توت فرنگی شاداب و خندان به سبک پیکسار',
    'پیتزای پپرونی داغ با پنیر کش‌دار روی تخته چوبی در کافه دنج',
    'کفش ورزشی مدرن در حال دویدن با افکت‌های نئونی آینده‌نگرانه',
  ];

  // --- Text generation handler ---
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (!canUseAi()) {
      openUpgradeModal('agency');
      return;
    }

    setLoading(true);
    setScheduledSuccess(false);

    try {
      const res = await fetch('/socialman/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, tone, keywords }),
      });

      if (res.ok) {
        const data: AiGenerationResponse = await res.json();
        setResult(data);
        recordAiUsage();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Image generation handler ---
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;

    if (!canUseAi()) {
      openUpgradeModal('agency');
      return;
    }

    setImageLoading(true);
    setImageError('');
    setImageScheduledSuccess(false);

    try {
      const res = await fetch('/socialman/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          style: imageStyle,
          aspectRatio: imageAspectRatio,
        }),
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setImageResultUrl(data.imageUrl);
        recordAiUsage();
      } else {
        setImageError(data.error || 'خطایی در تولید تصویر رخ داد.');
      }
    } catch (err: any) {
      console.error(err);
      setImageError('عدم امکان برقراری ارتباط با سرویس هوش مصنوعی');
    } finally {
      setImageLoading(false);
    }
  };

  const handleCopyFullText = () => {
    if (!result) return;
    const fullText = `${result.hook}\n\n${result.content}\n\n${result.cta}\n\n${result.hashtags.map((h) => `#${h}`).join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCalendar = () => {
    if (!result) return;
    addPost({
      workspaceId: activeWorkspace.id,
      title: topic || 'پست تولید شده با هوش مصنوعی',
      hook: result.hook,
      content: result.content,
      cta: result.cta,
      hashtags: result.hashtags,
      platform,
      status: 'draft',
      scheduledDateShamsi: getShamsiToday().formatted,
      scheduledTime: getShamsiToday().timeFormatted || '۱۹:۳۰',
    });
    setScheduledSuccess(true);
    setTimeout(() => setScheduledSuccess(false), 3000);
  };

  const handleAddImageToCalendar = () => {
    if (!imageResultUrl) return;
    addPost({
      workspaceId: activeWorkspace.id,
      title: imagePrompt.slice(0, 40) || 'تصویر هوش مصنوعی',
      hook: 'تصویر طراحی شده با هوش مصنوعی',
      content: imagePrompt,
      cta: '',
      hashtags: ['هوش_مصنوعی', 'طراحی', 'محتوا'],
      platform: 'instagram',
      status: 'draft',
      mediaUrl: imageResultUrl,
      scheduledDateShamsi: getShamsiToday().formatted,
      scheduledTime: getShamsiToday().timeFormatted || '۲۰:۰۰',
    });
    setImageScheduledSuccess(true);
    setTimeout(() => setImageScheduledSuccess(false), 3000);
  };

  const handleCopyImageUrl = () => {
    if (!imageResultUrl) return;
    navigator.clipboard.writeText(window.location.origin + imageResultUrl);
    setImageCopied(true);
    setTimeout(() => setImageCopied(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* VIP Locked Banner if not Agency Plan */}
      {currentPlan !== 'agency' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-100/60 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5 text-right">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-400/30 shrink-0">
              <Crown className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                  ویژه پلن طلایی (آژانس)
                </span>
                <span className="text-xs text-amber-700 font-bold">قابلیت VIP</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-amber-950 mt-1">
                تولید محتوا و تصاویر با هوش مصنوعی
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed font-medium mt-0.5">
                تمرکز اصلی اپلیکیشن سوشال‌من بر روی انتشار و زمان‌بندی همزمان ۵ پلتفرم است. برای فعال‌سازی نامحدود دستیار هوش مصنوعی و نگارش متن و تولید عکس، پلن خود را به «طلایی» ارتقا دهید.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openUpgradeModal('agency')}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-400/25 shrink-0 transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Crown className="w-4 h-4 fill-slate-950" />
            <span>ارتقا به پلن طلایی</span>
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-sky-50 text-[#3b96cc] border border-sky-200">
              <Sparkles className="w-5 h-5 fill-[#3b96cc]" />
            </div>
            <h1 className="text-lg font-black text-slate-900 sm:text-2xl">
              استودیوی هوش مصنوعی
            </h1>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            تولید هوشمند متن کپشن و طراحی تصاویر اختصاصی برای شبکه‌های اجتماعی
          </p>
        </div>

        {/* AI Wallet / Plan Status */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl text-xs self-start sm:self-auto">
          <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-slate-600 font-bold">وضعیت هوش مصنوعی:</span>
          <span className="font-black text-amber-800 font-mono">
            {currentPlan === 'agency' ? 'فعال (نامحدود)' : 'قفل (ویژه پلن طلایی)'}
          </span>
        </div>
      </div>

      {/* Section Switcher (Text vs Image) */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSection('text')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black border transition-all ${
            section === 'text'
              ? 'bg-[#3b96cc] text-white border-[#3b96cc] shadow-md shadow-[#3b96cc]/20'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>تولید متن و کپشن</span>
        </button>
        <button
          type="button"
          onClick={() => setSection('image')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black border transition-all ${
            section === 'image'
              ? 'bg-[#3b96cc] text-white border-[#3b96cc] shadow-md shadow-[#3b96cc]/20'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>تولید عکس هوشمند</span>
        </button>
      </div>

      {/* ==================== TEXT GENERATION SECTION ==================== */}
      {section === 'text' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Form Column (7 cols) */}
          <div className="min-w-0 space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 lg:col-span-7">
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* 5 Platforms Selector */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">
                  ۱. انتخاب پلتفرم انتشار
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {platforms.map((item) => {
                    const Icon = item.icon;
                    const isSelected = platform === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPlatform(item.id)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border text-[11px] font-bold transition-all ${
                          isSelected
                            ? 'bg-sky-50 border-[#00D166] text-[#00A852] shadow-xs scale-102'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${item.color}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tone Selector */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">
                  ۲. لحن متن
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'friendly', label: 'صمیمی' },
                    { id: 'informative', label: 'آموزشی' },
                    { id: 'promotional', label: 'تبلیغاتی و فروشگاهی' },
                    { id: 'storytelling', label: 'داستانی' },
                    { id: 'professional', label: 'رسمی' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id as ContentTone)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        tone === t.id
                          ? 'bg-[#00D166] border-[#00D166] text-slate-950 font-black shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Input */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  ۳. موضوع پست یا کمپین
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="مثال: تخفیف ۴۰ درصدی یلدا برای محصولات چرمی همراه با ارسال رایگان..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00D166] focus:bg-white transition-colors"
                />
              </div>

              {/* Quick Ideas */}
              <div>
                <span className="block text-[11px] text-slate-500 mb-1.5 font-bold">ایده‌های آماده سریع:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickIdeasText.map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(idea)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-xl transition-colors text-right font-medium"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  ۴. کلمات کلیدی یا کد تخفیف (اختیاری)
                </label>
                <input
                  type="text"
                  placeholder="مثال: کد تخفیف SNAPP، تحویل فوری"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00D166] focus:bg-white transition-colors"
                />
              </div>

              {/* Generate Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95 ${
                    currentPlan === 'agency'
                      ? 'bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-[#3b96cc]/20'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                      <span>هوش مصنوعی در حال نگارش محتوا...</span>
                    </>
                  ) : currentPlan === 'agency' ? (
                    <>
                      <Sparkles className="w-4 h-4 fill-white" />
                      <span>تولید خودکار پست با هوش مصنوعی</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 fill-slate-950" />
                      <span>تولید خودکار محتوا (ویژه پلن طلایی)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Column (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#00A852]" />
                  <span className="text-xs font-black text-slate-900">
                    پیش‌نمایش در {platforms.find((p) => p.id === platform)?.label}
                  </span>
                </div>
                {result && (
                  <button
                    onClick={handleCopyFullText}
                    className="flex items-center gap-1 text-xs text-[#00A852] hover:underline font-bold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'کپی شد!' : 'کپی متن'}</span>
                  </button>
                )}
              </div>

              {result && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200">
                    <span className="text-[10px] font-black text-[#00A852] block mb-1">
                      قلاب توقف‌کننده (Hook):
                    </span>
                    <p className="text-xs font-bold text-slate-900 leading-relaxed">{result.hook}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line shadow-xs">
                    {result.content}
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-bold">
                    {result.cta}
                  </div>

                  <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                    {result.hashtags.map((h, i) => (
                      <span key={i} className="text-[#00A852] bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md font-bold">
                        #{h}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-[10px] text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-[#00A852]" />
                    <span>زمان طلایی انتشار: </span>
                    <strong className="text-slate-900 font-mono">{result.suggestedBestTime}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Add to Calendar Action */}
            {result && (
              <button
                onClick={handleAddToCalendar}
                className="w-full py-3 rounded-2xl text-xs font-black bg-[#00D166] hover:bg-[#00be5b] text-slate-950 flex items-center justify-center gap-2 shadow-md shadow-[#00D166]/20 transition-all active:scale-95"
              >
                {scheduledSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>در تقویم محتوایی ذخیره شد!</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4" />
                    <span>زمان‌بندی و ذخیره در تقویم ۵ پلتفرم</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ==================== IMAGE GENERATION SECTION ==================== */}
      {section === 'image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Form Column (7 cols) */}
          <div className="min-w-0 space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 lg:col-span-7">
            <form onSubmit={handleGenerateImage} className="space-y-4">
              {/* Prompt Input */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-[#3b96cc]" />
                  <span>۱. توصیف تصویر مورد نظر (پرامپت)</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="مثال: عکاسی حرفه‌ای از یک ساعت مچی لوکس مردانه با بند چرمی مشکی روی پس‌زمینه تیره و نورپردازی ملایم..."
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00D166] focus:bg-white transition-colors"
                />
              </div>

              {/* Style Selector */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">
                  ۲. سبک بصری تصویر
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'realistic', label: 'واقع‌گرایانه (عکس)' },
                    { id: 'cartoon', label: 'کارتونی ۳بعدی' },
                    { id: 'digital_art', label: 'دیجیتال آرت' },
                    { id: 'minimal', label: 'محصول / استودیویی' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setImageStyle(s.id as any)}
                      className={`py-2.5 px-2 rounded-xl text-[11px] font-bold border text-center transition-all ${
                        imageStyle === s.id
                          ? 'bg-[#00D166] border-[#00D166] text-slate-950 font-black shadow-xs scale-102'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">
                  ۳. ابعاد و کاربرد تصویر
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'square', label: 'مربع (پست)', sub: '۱:۱ استاندارد' },
                    { id: 'portrait', label: 'عمودی (استوری)', sub: '۹:۱۶ ریلز' },
                    { id: 'landscape', label: 'افقی (بنر)', sub: '۱۶:۹ تلگرام' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setImageAspectRatio(r.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        imageAspectRatio === r.id
                          ? 'bg-sky-50 border-[#3b96cc] text-[#3b96cc] font-black shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs font-bold">{r.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{r.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Ideas */}
              <div>
                <span className="block text-[11px] text-slate-500 mb-1.5 font-bold">ایده‌های آماده سریع:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickIdeasImage.map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImagePrompt(idea)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1 rounded-xl transition-colors text-right font-medium"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={imageLoading}
                  className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95 bg-[#3b96cc] hover:bg-[#2c7ead] text-white shadow-[#3b96cc]/20"
                >
                  {imageLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>هوش مصنوعی در حال طراحی و رندر تصویر (چند ثانیه)...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      <span>تولید عکس با هوش مصنوعی (GapGPT)</span>
                    </>
                  )}
                </button>
              </div>

              {imageError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
                  {imageError}
                </div>
              )}
            </form>
          </div>

          {/* Live Preview Column (5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#3b96cc]" />
                  <span className="text-xs font-black text-slate-900">
                    پیش‌نمایش تصویر تولید شده
                  </span>
                </div>
                {imageResultUrl && (
                  <button
                    onClick={handleCopyImageUrl}
                    className="flex items-center gap-1 text-xs text-[#3b96cc] hover:underline font-bold"
                  >
                    {imageCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{imageCopied ? 'کپی شد!' : 'کپی لینک عکس'}</span>
                  </button>
                )}
              </div>

              {imageResultUrl ? (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-md group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageResultUrl}
                      alt="تصویر تولید شده با هوش مصنوعی"
                      className="w-full h-auto object-cover max-h-80 mx-auto transition-transform duration-300 group-hover:scale-102"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      کیفیت اصلی ۱۰۲۴×۱۰۲۴
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-800 block mb-0.5">پرامپت اجرا شده:</span>
                    <p className="line-clamp-2 text-[11px]">{imagePrompt}</p>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={imageResultUrl}
                      download="ai-generated-image.png"
                      className="flex-1 py-2.5 rounded-xl bg-[#00D166] hover:bg-[#00be5b] text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>دانلود فایل اصلی</span>
                    </a>
                    <a
                      href={imageResultUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs flex items-center justify-center"
                      title="مشاهده فول‌اسکرین"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-50 text-[#3b96cc] flex items-center justify-center">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-600">هنوز تصویری تولید نشده است</p>
                  <p className="text-[11px] text-slate-400">
                    پرامپت مورد نظرت رو بنویس و دکمه «تولید عکس» رو بزن تا تصویر اختصاصی‌ت اینجا آماده بشه.
                  </p>
                </div>
              )}
            </div>

            {/* Add to Calendar Action */}
            {imageResultUrl && (
              <button
                onClick={handleAddImageToCalendar}
                className="w-full py-3 rounded-2xl text-xs font-black bg-[#3b96cc] hover:bg-[#2c7ead] text-white flex items-center justify-center gap-2 shadow-md shadow-[#3b96cc]/20 transition-all active:scale-95"
              >
                {imageScheduledSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>تصویر در تقویم محتوایی ذخیره شد!</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4" />
                    <span>افزودن تصویر به تقویم محتوای اینستاگرام</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

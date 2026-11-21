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
  Zap,
  Crown,
  Lock,
} from 'lucide-react';
import {
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
  BaleIcon,
  RubikaIcon,
} from '@/components/SocialIcons';
import { SocialPlatform, ContentTone, AiGenerationResponse } from '@/types';
import { toPersianDigits } from '@/lib/utils';

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

  const platforms = [
    { id: 'instagram' as SocialPlatform, label: 'اینستاگرام', icon: InstagramIcon, color: 'text-pink-500' },
    { id: 'telegram' as SocialPlatform, label: 'تلگرام', icon: TelegramIcon, color: 'text-sky-500' },
    { id: 'whatsapp' as SocialPlatform, label: 'واتساپ', icon: WhatsappIcon, color: 'text-[#25D366]' },
    { id: 'rubika' as SocialPlatform, label: 'روبیکا', icon: RubikaIcon, color: 'text-purple-600' },
    { id: 'bale' as SocialPlatform, label: 'بله', icon: BaleIcon, color: 'text-teal-600' },
  ];

  const quickIdeas = [
    'تخفیف ویژه شب یلدا با کد تخفیف YALDA',
    '۵ اشتباه رایج در تولید محتوا و راه‌حل آن‌ها',
    'پشت صحنه بسته‌بندی سفارشات فروشگاه',
    'معرفی ویژگی جدید محصول برای مشتریان',
  ];

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
      const res = await fetch('/api/ai/generate', {
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
      scheduledDateShamsi: '۱۴۰۳/۰۹/۱۰',
      scheduledTime: '۱۹:۳۰',
    });
    setScheduledSuccess(true);
    setTimeout(() => setScheduledSuccess(false), 3000);
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
                تولید محتوا با هوش مصنوعی Google Gemini
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed font-medium mt-0.5">
                تمرکز اصلی اپلیکیشن سوشال‌من بر روی انتشار و زمان‌بندی همزمان ۵ پلتفرم است. برای فعال‌سازی دستیار هوش مصنوعی و نگارش خودکار متن، پلن خود را به «طلایی» ارتقا دهید.
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
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#21aa58] border border-emerald-200">
              <Sparkles className="w-5 h-5 fill-[#21aa58]" />
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900">
              استودیوی تولید محتوای هوشمند Gemini
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            تولید متن و هوک اختصاصی برای تلگرام، واتساپ، بله، اینستاگرام و روبیکا
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
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
                          ? 'bg-emerald-50 border-[#00D166] text-[#00A852] shadow-xs scale-102'
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
                {quickIdeas.map((idea, idx) => (
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

            {/* Generate Button (Snapp Green or VIP Golden) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95 ${
                  currentPlan === 'agency'
                    ? 'bg-[#21aa58] hover:bg-[#1e9b50] text-white shadow-[#21aa58]/20'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>هوش مصنوعی در حال تدوین محتوا...</span>
                  </>
                ) : currentPlan === 'agency' ? (
                  <>
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>تولید خودکار پست با هوش مصنوعی Gemini</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 fill-slate-950" />
                    <span>تولید خودکار محتوا (ویژه پلن طلایی 👑)</span>
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
                {/* Hook Box */}
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[10px] font-black text-[#00A852] block mb-1">
                    قلاب توقف‌کننده (Hook):
                  </span>
                  <p className="text-xs font-bold text-slate-900 leading-relaxed">{result.hook}</p>
                </div>

                {/* Content */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line shadow-xs">
                  {result.content}
                </div>

                {/* CTA */}
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-bold">
                  {result.cta}
                </div>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  {result.hashtags.map((h, i) => (
                    <span key={i} className="text-[#00A852] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md font-bold">
                      #{h}
                    </span>
                  ))}
                </div>

                {/* Best Time */}
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
    </div>
  );
}

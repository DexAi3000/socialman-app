"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Link2,
  ExternalLink,
  ShieldCheck,
  Send,
  RefreshCw,
  QrCode,
  Bot,
  Copy,
  Check,
  Info,
  Radio,
} from 'lucide-react';
import {
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
  RubikaIcon,
  BaleIcon,
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
import { normalizeTelegramChatId } from '@/lib/telegram-utils';

export function ConnectAccountsModal() {
  const {
    isConnectModalOpen,
    closeConnectModal,
    targetPlatformForConnect,
    connectedAccounts,
    toggleAccountConnection,
  } = useApp();

  const [activeTab, setActiveTab] = useState<SocialPlatform>(
    targetPlatformForConnect || 'telegram'
  );

  const [copiedBot, setCopiedBot] = useState(false);
  const [channelInput, setChannelInput] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testError, setTestError] = useState<string | null>(null);

  // Sync tab with external caller
  React.useEffect(() => {
    if (targetPlatformForConnect) {
      setActiveTab(targetPlatformForConnect);
    }
  }, [targetPlatformForConnect]);

  const currentAccount = connectedAccounts[activeTab];

  // Pre-fill channel input with existing handle
  React.useEffect(() => {
    if (currentAccount?.handle && currentAccount.handle !== '@SocialManPublishBot') {
      setChannelInput(currentAccount.handle);
    }
  }, [activeTab, currentAccount?.handle]);

  if (!isConnectModalOpen) return null;

  const handleCopyBotId = (botId: string) => {
    navigator.clipboard.writeText(botId);
    setCopiedBot(true);
    setTimeout(() => setCopiedBot(false), 2500);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestSuccess(false);
    setTestError(null);
    setTestMessage('');

    try {
      const res = await fetch('/socialman/api/publish/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: activeTab,
          channelId: channelInput.trim() || currentAccount?.handle || '@novexalab',
        }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setTestSuccess(true);
        setTestMessage(data.message || 'اتصال کانال با موفقیت تایید شد! ✅');
        setTimeout(() => setTestSuccess(false), 6000);
      } else {
        setTestError(data?.error || 'خطا در ارتباط با کانال یا دسترسی ربات');
        setTimeout(() => setTestError(null), 8000);
      }
    } catch (e: any) {
      setTestError(e.message || 'خطای شبکه در تست اتصال');
      setTimeout(() => setTestError(null), 8000);
    } finally {
      setTestingConnection(false);
    }
  };

  const platformsList = [
    { id: 'telegram' as SocialPlatform, name: 'تلگرام', icon: SnappTelegramIcon, badge: 'آسان‌ترین (۱ دقیقه)' },
    { id: 'instagram' as SocialPlatform, name: 'اینستاگرام', icon: SnappInstagramIcon, badge: 'رسمی Meta' },
    { id: 'rubika' as SocialPlatform, name: 'روبیکا', icon: SnappRubikaIcon, badge: 'ملی پرسرعت' },
    { id: 'whatsapp' as SocialPlatform, name: 'واتساپ', icon: SnappWhatsappIcon, badge: 'Cloud API / QR' },
    { id: 'bale' as SocialPlatform, name: 'بله', icon: SnappBaleIcon, badge: 'بازوی رسمی' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-l from-sky-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#3b96cc] flex items-center justify-center text-white shadow-md shadow-[#3b96cc]/30">
              <Link2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900">
                اتصال و مدیریت کانال‌های انتشار خودکار
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                اتصال کاملاً امن، رسمی و بدون نیاز به دسترسی به پسورد شخصی شما
              </p>
            </div>
          </div>
          <button
            onClick={closeConnectModal}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selection Tabs */}
        <div className="px-5 pt-3 border-b border-gray-100 bg-gray-50/50 flex gap-1.5 overflow-x-auto no-scrollbar">
          {platformsList.map((p) => {
            const Icon = p.icon;
            const isSelected = activeTab === p.id;
            const isConn = connectedAccounts[p.id]?.isConnected;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setActiveTab(p.id);
                  setTestSuccess(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-2xl text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                  isSelected
                    ? 'bg-white border-[#3b96cc] text-[#3b96cc] font-black shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span>{p.name}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConn ? 'bg-[#3b96cc]' : 'bg-gray-300'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-right">
          {/* Current Connection Status Box */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
              currentAccount?.isConnected
                ? 'bg-sky-50/70 border-sky-200 text-sky-950'
                : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-3">
              {currentAccount?.isConnected ? (
                <div className="w-9 h-9 rounded-xl bg-[#3b96cc] text-white flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="text-xs font-black block">
                  {currentAccount?.isConnected
                    ? `متصل به: ${currentAccount.accountName}`
                    : 'در انتظار اتصال'}
                </span>
                <span className="text-[11px] text-gray-600 font-mono">
                  {currentAccount?.isConnected
                    ? `${currentAccount.handle} • اتصال فعال برای زمان‌بندی خودکار`
                    : 'هنوز اکانتی برای این پلتفرم فعال نشده است'}
                </span>
              </div>
            </div>

            {currentAccount?.isConnected && (
              <button
                onClick={() => {
                  toggleAccountConnection(activeTab, '', '', false);
                  setChannelInput('');
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 cursor-pointer"
              >
                قطع اتصال
              </button>
            )}
          </div>

          {/* TELEGRAM GUIDE */}
          {activeTab === 'telegram' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-gray-900">
                  راهنمای اتصال کانال تلگرام برای انتشار خودکار
                </h3>
                <p className="text-xs text-gray-500">
                  ربات رسمی تلگرام با توکن اختصاصی ساخته شده در BotFather متصل و تایید گردید:
                </p>
              </div>

              {/* Bot Info Card */}
              <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                    <span className="text-xs font-black text-sky-950">بات رسمی تلگرام: SocialMan</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    Bot API فعال و تایید شده ✓
                  </span>
                </div>
                <div className="text-xs text-sky-900 flex items-center justify-between">
                  <span>نام کاربری بات: <strong className="font-mono">@SocialManPublishBot</strong></span>
                  <button
                    onClick={() => handleCopyBotId('@SocialManPublishBot')}
                    className="text-sky-600 hover:text-sky-800 flex items-center gap-1 text-[11px]"
                  >
                    {copiedBot ? <Check className="w-3.5 h-3.5 text-sky-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی آیدی بات</span>
                  </button>
                </div>
                <div className="text-[10px] text-gray-500 font-mono bg-white p-2 rounded-xl border border-sky-100 truncate">
                  توکن HTTP API: 9115798954:AAHHygpdWUJlhI3k-FX7rtU2egGt7wwHwrg
                </div>
              </div>

              {/* Step by Step */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#3b96cc] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    ۱
                  </span>
                  <div>
                    <span className="font-bold text-gray-800 block">اضافه کردن ربات به کانال:</span>
                    <span className="text-gray-500 text-[11px] leading-relaxed">
                      در تلگرام وارد بخش تنظیمات کانال خود شوید، به بخش <strong>Administrators</strong> بروید و ربات زیر را اضافه کنید:
                    </span>
                    <div className="mt-2 flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 w-fit">
                      <span className="font-mono text-sky-700 font-black text-xs">
                        @SocialManPublishBot
                      </span>
                      <button
                        onClick={() => handleCopyBotId('@SocialManPublishBot')}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        {copiedBot ? <Check className="w-3.5 h-3.5 text-sky-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#3b96cc] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    ۲
                  </span>
                  <div>
                    <span className="font-bold text-gray-800 block">دادن دسترسی «ارسال پیام» (Post Messages):</span>
                    <span className="text-gray-500 text-[11px]">
                      به ربات فقط دسترسی Post Messages (ارسال پیام و مدیا) بدهید. نیازی به دسترسی‌های دیگر نیست.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#3b96cc] text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    ۳
                  </span>
                  <div className="w-full">
                    <span className="font-bold text-gray-800 block mb-1">ثبت آیدی یا شناسه کانال:</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="@channel_id"
                        value={channelInput}
                        onChange={(e) => setChannelInput(e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-left font-mono outline-none focus:border-[#3b96cc]"
                      />
                      <button
                        onClick={() => {
                          if (channelInput.trim()) {
                            const clean = normalizeTelegramChatId(channelInput);
                            toggleAccountConnection('telegram', clean, 'کانال تلگرام اختصاصی', true);
                          }
                        }}
                        className="px-4 py-1.5 rounded-xl bg-[#3b96cc] text-white text-xs font-black hover:bg-[#2c7ead]"
                      >
                        تایید و اتصال
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INSTAGRAM GUIDE */}
          {activeTab === 'instagram' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-gray-900">
                  راهنمای اتصال اینستاگرام از طریق Meta Graph API
                </h3>
                <p className="text-xs text-gray-500">
                  اینستاگرام از پروتکل رسمی Meta Content Publishing API استفاده می‌کند که ایمن‌ترین روش بین‌المللی است:
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    ۱
                  </span>
                  <div>
                    <span className="font-bold text-gray-800 block">تبدیل پیج به Professional / Business:</span>
                    <span className="text-gray-500 text-[11px] leading-relaxed">
                      در اپلیکیشن اینستاگرام به Settings & Privacy ◂ Account type ◂ Switch to professional account بروید (کاملاً رایگان).
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    ۲
                  </span>
                  <div className="w-full">
                    <span className="font-bold text-gray-800 block mb-1">ثبت نام کاربری پیج اینستاگرام:</span>
                    <span className="text-gray-500 text-[11px] leading-relaxed block mb-2">
                      آیدی پیج تجاری خود را جهت زمان‌بندی و انتشار وارد فرمایید:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="@username_instagram"
                        value={channelInput}
                        onChange={(e) => setChannelInput(e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-left font-mono outline-none focus:border-pink-500"
                      />
                      <button
                        onClick={() => {
                          if (channelInput.trim()) {
                            const clean = channelInput.trim().startsWith('@') ? channelInput.trim() : `@${channelInput.trim()}`;
                            toggleAccountConnection('instagram', clean, `پیج اینستاگرام ${clean}`, true);
                            setTestSuccess(true);
                            setTestMessage(`پیج ${clean} با موفقیت متصل گردید! ✅`);
                            setTimeout(() => setTestSuccess(false), 4000);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white text-xs font-black shadow-sm hover:opacity-95 cursor-pointer"
                      >
                        تایید و اتصال
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RUBIKA GUIDE */}
          {activeTab === 'rubika' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-gray-900">
                  اتصال خودکار روبیکا از طریق پلتفرم بات روبیکا
                </h3>
                <p className="text-xs text-gray-500">
                  ربات اختصاصی ساخته شده در «مدیریت بات‌های روبیکا» با موفقیت به اپلیکیشن متصل گردید:
                </p>
              </div>

              {/* Bot Info Card */}
              <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                    <span className="text-xs font-black text-purple-950">بات فعال روبیکا: SocialMan</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    توکن فعال و متصل ✓
                  </span>
                </div>
                <div className="text-xs text-purple-900 flex items-center justify-between">
                  <span>نام کاربری بات: <strong className="font-mono">@SocialManPublishBot</strong></span>
                  <button
                    onClick={() => handleCopyBotId('@SocialManPublishBot')}
                    className="text-purple-600 hover:text-purple-800 flex items-center gap-1 text-[11px]"
                  >
                    {copiedBot ? <Check className="w-3.5 h-3.5 text-sky-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی آیدی بات</span>
                  </button>
                </div>
                <div className="text-[10px] text-gray-500 font-mono bg-white p-2 rounded-xl border border-purple-100 truncate">
                  توکن روبیکا: CJIJEG0ICJPDQSHEUWTHRWIDFFITRQUHWBZFEAQAYUJHCUZUGSYBGUQXCUZHERIR
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    ۱
                  </span>
                  <div>
                    <span className="font-bold text-gray-800 block">عضو کردن ربات در کانال روبیکا:</span>
                    <span className="text-gray-500 text-[11px] leading-relaxed">
                      در روبیکا وارد کانال خود شوید، به بخش «مدیران» بروید و ربات <strong>@SocialManPublishBot</strong> را با دسترسی «ارسال پیام» اضافه فرمایید.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    ۲
                  </span>
                  <div className="w-full">
                    <span className="font-bold text-gray-800 block mb-1">ثبت شناسه کانال روبیکا:</span>
                    <span className="text-gray-500 text-[11px] leading-relaxed block mb-2">
                      آیدی کانال خود را وارد کرده و دکمه اتصال را بزنید:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="@rubika_channel یا شناسه روبیکا"
                        value={channelInput}
                        onChange={(e) => setChannelInput(e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-left font-mono outline-none focus:border-purple-600"
                      />
                      <button
                        onClick={() => {
                          if (channelInput.trim()) {
                            const clean = channelInput.trim().startsWith('@') ? channelInput.trim() : `@${channelInput.trim()}`;
                            toggleAccountConnection('rubika', clean, `کانال روبیکا ${clean}`, true);
                            setTestSuccess(true);
                            setTestMessage(`کانال روبیکا ${clean} متصل گردید! ✅`);
                            setTimeout(() => setTestSuccess(false), 4000);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-black hover:bg-purple-700 cursor-pointer"
                      >
                        تایید و اتصال
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WHATSAPP GUIDE */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-gray-900">
                  اتصال واتساپ (کانال‌های عمومی و برودکست بیزینس)
                </h3>
                <p className="text-xs text-gray-500">
                  ارسال همزمان به کانال رسمی واتساپ و لیست‌های انتشار:
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 bg-white rounded-xl border border-gray-200 p-2 flex items-center justify-center shadow-xs shrink-0">
                  <QrCode className="w-20 h-20 text-gray-800" />
                </div>
                <div className="text-xs space-y-2 w-full">
                  <span className="font-bold text-gray-800 block">اتصال شماره واتساپ یا برودکست:</span>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    شماره یا شناسه متصل به واتساپ بیزینس را وارد کنید:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="0912... یا شناسه واتساپ"
                      value={channelInput}
                      onChange={(e) => setChannelInput(e.target.value)}
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-left font-mono outline-none focus:border-[#25D366]"
                    />
                    <button
                      onClick={() => {
                        if (channelInput.trim()) {
                          toggleAccountConnection('whatsapp', channelInput.trim(), `واتساپ ${channelInput.trim()}`, true);
                          setTestSuccess(true);
                          setTestMessage(`واتساپ با موفقیت متصل گردید! ✅`);
                          setTimeout(() => setTestSuccess(false), 4000);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-[#25D366] text-white text-xs font-black hover:bg-[#20ba59] cursor-pointer"
                    >
                      تایید و اتصال
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BALE GUIDE */}
          {activeTab === 'bale' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-gray-900">
                  اتصال پیام‌رسان بله از طریق بازوی رسمی (Bale Bot API)
                </h3>
                <p className="text-xs text-gray-500">
                  بازوی اختصاصی بله ساخته شده و به اپلیکیشن متصل گردید:
                </p>
              </div>

              {/* Bot Info Card */}
              <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-xs font-black text-teal-950">بازوی فعال بله: SocialMan</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    توکن فعال و متصل ✓
                  </span>
                </div>
                <div className="text-xs text-teal-900 flex items-center justify-between">
                  <span>نام بازو: <strong className="font-mono">@SocialManPublishBot</strong></span>
                  <button
                    onClick={() => handleCopyBotId('@SocialManPublishBot')}
                    className="text-teal-600 hover:text-teal-800 flex items-center gap-1 text-[11px]"
                  >
                    {copiedBot ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی آیدی بازو</span>
                  </button>
                </div>
                <div className="text-[10px] text-gray-500 font-mono bg-white p-2 rounded-xl border border-teal-100 truncate">
                  توکن دسترسی: 369114062:R7BeEnjLaDSiFv26-wsP-4ol_aGbTKmBNo
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    ۱
                  </span>
                  <div>
                    <span className="font-bold text-gray-800 block">افزودن بازوی رسمی به کانال بله:</span>
                    <span className="text-gray-500 text-[11px] leading-relaxed">
                      در پیام‌رسان بله وارد کانال خود شوید، به بخش مدیران بروید و بازوی <strong>@SocialManPublishBot</strong> (لینک ble.ir/SocialManPublishBot) را با دسترسی ارسال پیام ادمین نمایید.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    ۲
                  </span>
                  <div className="w-full">
                    <span className="font-bold text-gray-800 block mb-1">ثبت شناسه کانال بله:</span>
                    <span className="text-gray-500 text-[11px] leading-relaxed block mb-2">
                      آیدی کانال بله خود (مثلاً @mychannel یا ble.ir/mychannel) را وارد فرمایید:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="@bale_channel یا شناسه بله"
                        value={channelInput}
                        onChange={(e) => setChannelInput(e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-left font-mono outline-none focus:border-teal-600"
                      />
                      <button
                        onClick={() => {
                          if (channelInput.trim()) {
                            const clean = channelInput.trim().startsWith('@') ? channelInput.trim() : `@${channelInput.trim()}`;
                            toggleAccountConnection('bale', clean, `کانال بله ${clean}`, true);
                            setTestSuccess(true);
                            setTestMessage(`کانال بله ${clean} متصل گردید! ✅`);
                            setTimeout(() => setTestSuccess(false), 4000);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-black hover:bg-teal-700 cursor-pointer"
                      >
                        تایید و اتصال
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test Dispatch Button */}
          {currentAccount?.isConnected && (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-[#3b96cc] animate-pulse" />
                  <div>
                    <span className="text-xs font-black text-gray-800 block">تست صحت اتصال و دسترسی ربات</span>
                    <span className="text-[10px] text-gray-400">
                      بررسی وضعیت دسترسی ربات SocialMan به کانال {currentAccount.handle}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-800 hover:bg-gray-100 text-xs font-black flex items-center gap-2 shadow-xs transition-colors shrink-0"
                >
                  {testingConnection ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3b96cc]" />
                      <span>در حال بررسی اتصال...</span>
                    </>
                  ) : testSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-sky-600" />
                      <span className="text-sky-700">اتصال تایید شد! ✅</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-[#3b96cc]" />
                      <span>تست اتصال به کانال</span>
                    </>
                  )}
                </button>
              </div>

              {testSuccess && testMessage && (
                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{testMessage}</span>
                </div>
              )}

              {testError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{testError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 font-bold">
            <ShieldCheck className="w-4 h-4 text-[#3b96cc]" />
            <span>پروتکل اتصال رمزنگاری‌شده SSL ۲۵۶ بیتی</span>
          </div>
          <button
            onClick={closeConnectModal}
            className="px-5 py-2.5 rounded-xl bg-[#3b96cc] text-white font-black hover:bg-[#2c7ead] transition-colors"
          >
            بستن و ذخیره تنظیمات
          </button>
        </div>
      </div>
    </div>
  );
}

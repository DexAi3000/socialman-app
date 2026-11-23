"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  Bot,
  User,
  Send,
  Search,
  Check,
  CheckCheck,
  Settings,
  Flame,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Zap,
  Key,
  Shield,
  HelpCircle,
  Phone,
  Tag,
  Truck,
  ExternalLink,
} from 'lucide-react';
import {
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
  BaleIcon,
  RubikaIcon,
} from '@/components/SocialIcons';
import { SocialPlatform } from '@/types';
import { toPersianDigits } from '@/lib/utils';

interface DirectMessage {
  id: string;
  sender: 'customer' | 'ai' | 'admin';
  senderName: string;
  text: string;
  createdAt: string;
}

interface CustomerDirect {
  id: string;
  platform: SocialPlatform;
  customerName: string;
  customerHandle: string;
  customerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  isAiEnabled: boolean;
  unreadCount: number;
  messages?: DirectMessage[];
}

export function DirectsInboxView() {
  const [directs, setDirects] = useState<CustomerDirect[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDirect, setSelectedDirect] = useState<CustomerDirect | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [activePlatformFilter, setActivePlatformFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sending messages state
  const [adminInput, setAdminInput] = useState('');
  const [sendingAdmin, setSendingAdmin] = useState(false);

  // Customer simulation state
  const [simulatedCustomerText, setSimulatedCustomerText] = useState('');
  const [simulating, setSimulating] = useState(false);

  // Settings modal & Complete Customization state
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'connection' | 'persona' | 'security'>('connection');
  const [businessName, setBusinessName] = useState('فروشگاه و برند من');
  const [telegramBotUsername, setTelegramBotUsername] = useState('@MyBrand_Bot');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('@mybrand_official');
  const [aiTone, setAiTone] = useState<'friendly' | 'formal' | 'sales' | 'fast'>('friendly');
  const [shippingInfo, setShippingInfo] = useState('ارسال با پست پیشتاز به سراسر کشور ظرف ۲ تا ۳ روز کاری. امکان پیک فوری در تهران.');
  const [discountCode, setDiscountCode] = useState('OFF20');
  const [supportPhone, setSupportPhone] = useState('۰۹۱۲۳۴۵۶۷۸۹');
  const [knowledgeBase, setKnowledgeBase] = useState(
    'سفارش‌ها ظرف ۲ روز با پست پیشتاز ارسال می‌شوند. ارسال بالای ۴۰۰ هزار تومان رایگان است. تمامی اجناس ضمانت بازگشت ۷ روزه دارند.'
  );
  const [customInstructions, setCustomInstructions] = useState('در انتهای پیام مشتری را با روی خوش ترغیب کن که خریدش را نهایی کند.');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Load custom settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('socialman_ai_direct_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.businessName) setBusinessName(parsed.businessName);
        if (parsed.telegramBotUsername) setTelegramBotUsername(parsed.telegramBotUsername);
        if (parsed.telegramBotToken) setTelegramBotToken(parsed.telegramBotToken);
        if (parsed.instagramHandle) setInstagramHandle(parsed.instagramHandle);
        if (parsed.aiTone) setAiTone(parsed.aiTone);
        if (parsed.shippingInfo) setShippingInfo(parsed.shippingInfo);
        if (parsed.discountCode) setDiscountCode(parsed.discountCode);
        if (parsed.supportPhone) setSupportPhone(parsed.supportPhone);
        if (parsed.knowledgeBase) setKnowledgeBase(parsed.knowledgeBase);
        if (parsed.customInstructions) setCustomInstructions(parsed.customInstructions);
      }
    } catch (_) {}
  }, []);

  const handleSaveSettings = () => {
    try {
      const dataToSave = {
        businessName,
        telegramBotUsername,
        telegramBotToken,
        instagramHandle,
        aiTone,
        shippingInfo,
        discountCode,
        supportPhone,
        knowledgeBase,
        customInstructions,
      };
      localStorage.setItem('socialman_ai_direct_settings', JSON.stringify(dataToSave));
      setSettingsSaved(true);
      setTimeout(() => {
        setSettingsSaved(false);
        setShowSettings(false);
      }, 1000);
    } catch (_) {}
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const platformsList = [
    { id: 'all', label: 'همه پلتفرم‌ها', icon: MessageSquare, color: 'text-slate-700' },
    { id: 'telegram', label: 'تلگرام', icon: TelegramIcon, color: 'text-sky-500' },
    { id: 'instagram', label: 'اینستاگرام', icon: InstagramIcon, color: 'text-pink-500' },
    { id: 'rubika', label: 'روبیکا', icon: RubikaIcon, color: 'text-purple-600' },
    { id: 'bale', label: 'بله', icon: BaleIcon, color: 'text-teal-600' },
    { id: 'whatsapp', label: 'واتساپ', icon: WhatsappIcon, color: 'text-[#25D366]' },
  ];

  const quickCustomerQuestions = [
    'سلام، قیمت این کار چنده و موجود دارید؟',
    'ارسال به شهرستان چند روزه به دستم میرسه؟',
    'شرایط خرید عمده یا تخفیف همکار چطوریه؟',
    'شماره کارت جهت پرداخت می‌فرستید؟',
  ];

  // Fetch list of directs
  const fetchDirects = async () => {
    try {
      const url = new URL('/socialman/api/directs', window.location.origin);
      if (activePlatformFilter !== 'all') {
        url.searchParams.set('platform', activePlatformFilter);
      }
      if (searchQuery.trim()) {
        url.searchParams.set('q', searchQuery.trim());
      }

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setDirects(data.directs || []);
        if (!selectedId && data.directs?.length > 0) {
          setSelectedId(data.directs[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchDirects();
  }, [activePlatformFilter, searchQuery]);

  // Fetch active conversation details
  const fetchChatDetails = async (id: string) => {
    setLoadingChat(true);
    try {
      const res = await fetch(`/socialman/api/directs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedDirect(data.direct);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    if (selectedId) {
      fetchChatDetails(selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedDirect?.messages]);

  // Toggle AI Auto-Reply for current conversation
  const toggleAi = async () => {
    if (!selectedDirect) return;
    const newStatus = !selectedDirect.isAiEnabled;
    setSelectedDirect({ ...selectedDirect, isAiEnabled: newStatus });
    setDirects((prev) =>
      prev.map((d) => (d.id === selectedDirect.id ? { ...d, isAiEnabled: newStatus } : d))
    );

    try {
      await fetch(`/socialman/api/directs/${selectedDirect.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAiEnabled: newStatus }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Send admin manual reply
  const handleSendAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInput.trim() || !selectedDirect || sendingAdmin) return;

    setSendingAdmin(true);
    const textToSend = adminInput.trim();
    setAdminInput('');

    try {
      const res = await fetch(`/socialman/api/directs/${selectedDirect.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          sender: 'admin',
          senderName: 'مدیر پیج',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setSelectedDirect((prev) =>
            prev ? { ...prev, messages: [...(prev.messages || []), data.message] } : null
          );
        }
        fetchDirects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingAdmin(false);
    }
  };

  // Simulate customer incoming message and trigger AI auto-reply
  const handleSimulateCustomer = async (text: string) => {
    if (!text.trim() || !selectedDirect || simulating) return;

    setSimulating(true);
    setSimulatedCustomerText('');

    try {
      const res = await fetch(`/socialman/api/directs/${selectedDirect.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          sender: 'customer',
          senderName: selectedDirect.customerName,
          settings: {
            businessName,
            aiTone,
            shippingInfo,
            discountCode,
            supportPhone,
            knowledgeBase,
            customInstructions,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const newMsgs: DirectMessage[] = [];
        if (data.message) newMsgs.push(data.message);
        if (data.aiMessage) newMsgs.push(data.aiMessage);

        setSelectedDirect((prev) =>
          prev ? { ...prev, messages: [...(prev.messages || []), ...newMsgs] } : null
        );
        fetchDirects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'telegram':
        return <TelegramIcon className="w-3.5 h-3.5 text-sky-500" />;
      case 'instagram':
        return <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />;
      case 'whatsapp':
        return <WhatsappIcon className="w-3.5 h-3.5 text-[#25D366]" />;
      case 'rubika':
        return <RubikaIcon className="w-3.5 h-3.5 text-purple-600" />;
      case 'bale':
        return <BaleIcon className="w-3.5 h-3.5 text-teal-600" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Banner & Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-sky-50 text-[#3b96cc] border border-sky-100">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900">
              مرکز دایرکت و پاسخگوی خودکار هوش مصنوعی
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            پاسخگویی آنی، هوشمند و ۲۴ ساعته به سوالات و سفارش‌های مشتریان در تلگرام، اینستاگرام، واتساپ، بله و روبیکا
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span>تنظیمات پاسخگو</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>هوش مصنوعی آنلاین (GapGPT)</span>
          </div>
        </div>
      </div>

      {/* Platform Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {platformsList.map((p) => {
          const Icon = p.icon;
          const isActive = activePlatformFilter === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePlatformFilter(p.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                isActive
                  ? 'bg-[#3b96cc] text-white border-[#3b96cc] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : p.color}`} />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Inbox Grid: Left Chat List (4 cols) & Right Active Chat (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[750px] min-h-[600px]">
        {/* ================= CHAT LIST COLUMN ================= */}
        <div
          className={`lg:col-span-4 rounded-2xl border border-slate-200 bg-white flex flex-col overflow-hidden shadow-xs ${
            selectedId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
              <input
                type="text"
                placeholder="جستجو در بین نام یا پیام مشتری..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl ps-9 pe-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3b96cc]"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingList ? (
              <div className="p-8 text-center text-xs text-slate-400">در حال دریافت دایرکت‌ها...</div>
            ) : directs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">پیامی در این پلتفرم یافت نشد.</div>
            ) : (
              directs.map((d) => {
                const isSelected = selectedId === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedId(d.id)}
                    className={`w-full p-3.5 flex items-start gap-3 text-right transition-colors hover:bg-slate-50 ${
                      isSelected ? 'bg-sky-50/70 border-r-4 border-r-[#3b96cc]' : ''
                    }`}
                  >
                    {/* Avatar with platform badge */}
                    <div className="relative shrink-0">
                      {d.customerAvatar ? (
                        <img
                          src={d.customerAvatar}
                          alt={d.customerName}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                          {d.customerName.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -left-1 p-0.5 rounded-full bg-white shadow-xs border border-slate-100">
                        {getPlatformIcon(d.platform)}
                      </div>
                    </div>

                    {/* Customer Info & Last Message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-black text-slate-900 truncate">
                          {d.customerName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatMessageTime(d.lastMessageAt)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mb-1 truncate font-mono">
                        {d.customerHandle}
                      </div>
                      <p className="text-[11px] text-slate-600 truncate">{d.lastMessage}</p>
                    </div>

                    {/* AI Indicator or Unread Badge */}
                    <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
                      {d.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#3b96cc] text-white text-[9px] font-black leading-none">
                          {toPersianDigits(d.unreadCount)}
                        </span>
                      )}
                      {d.isAiEnabled && (
                        <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md font-bold">
                          ربات فعال
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================= ACTIVE CHAT WINDOW ================= */}
        <div
          className={`lg:col-span-8 rounded-2xl border border-slate-200 bg-white flex flex-col overflow-hidden shadow-xs ${
            !selectedId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {selectedDirect ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="lg:hidden p-1.5 rounded-lg bg-slate-200 text-slate-700"
                    title="بازگشت به لیست چت‌ها"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    {selectedDirect.customerAvatar ? (
                      <img
                        src={selectedDirect.customerAvatar}
                        alt={selectedDirect.customerName}
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center font-bold text-sm">
                        {selectedDirect.customerName.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -left-1 p-0.5 rounded-full bg-white shadow-xs">
                      {getPlatformIcon(selectedDirect.platform)}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <span>{selectedDirect.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">
                        ({selectedDirect.customerHandle})
                      </span>
                    </h2>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      کانال ارتباطی فعال
                    </span>
                  </div>
                </div>

                {/* AI Toggle for this Conversation */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600 hidden sm:inline">
                    پاسخگوی خودکار AI:
                  </span>
                  <button
                    type="button"
                    onClick={toggleAi}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      selectedDirect.isAiEnabled
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>{selectedDirect.isAiEnabled ? 'فعال' : 'غیرفعال'}</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f8fafc]">
                {loadingChat ? (
                  <div className="p-8 text-center text-xs text-slate-400">در حال بارگذاری پیام‌ها...</div>
                ) : (
                  selectedDirect.messages?.map((msg) => {
                    const isCustomer = msg.sender === 'customer';
                    const isAi = msg.sender === 'ai';
                    const isAdmin = msg.sender === 'admin';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                      >
                        {/* Sender Label Badge */}
                        <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-400 px-1">
                          {isCustomer && (
                            <>
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{msg.senderName}</span>
                            </>
                          )}
                          {isAi && (
                            <span className="text-sky-600 font-bold flex items-center gap-1 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-md">
                              <Bot className="w-3 h-3" />
                              <span>پاسخ هوش مصنوعی (AI)</span>
                            </span>
                          )}
                          {isAdmin && (
                            <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                              <ShieldCheck className="w-3 h-3" />
                              <span>ارسال توسط شما (مدیر)</span>
                            </span>
                          )}
                          <span>· {formatMessageTime(msg.createdAt)}</span>
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                            isCustomer
                              ? 'bg-white text-slate-800 rounded-tr-xs border border-slate-200'
                              : isAi
                              ? 'bg-gradient-to-r from-sky-50 to-blue-50 text-slate-900 rounded-tl-xs border border-sky-200'
                              : 'bg-[#00D166] text-slate-950 font-medium rounded-tl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                {simulating && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-sky-50 text-sky-800 text-xs font-bold w-fit">
                    <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                    <span>هوش مصنوعی در حال تحلیل و پاسخ به مشتری...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Live Customer Simulation Bar */}
              <div className="p-3 bg-amber-50/70 border-t border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                    <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    <span>تست ارسال پیام مشتری (شبیه‌ساز هوش مصنوعی):</span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-bold">
                    پیام تست بفرست تا ببینی هوش مصنوعی چطور جواب می‌ده!
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="پیام دلخواه مشتری را بنویسید یا از دکمه‌های آماده انتخاب کنید..."
                    value={simulatedCustomerText}
                    onChange={(e) => setSimulatedCustomerText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSimulateCustomer(simulatedCustomerText);
                      }
                    }}
                    className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    disabled={simulating || !simulatedCustomerText.trim()}
                    onClick={() => handleSimulateCustomer(simulatedCustomerText)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shrink-0 transition-transform active:scale-95 disabled:opacity-50"
                  >
                    ارسال تست مشتری
                  </button>
                </div>

                {/* Quick Prompts for testing */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                  {quickCustomerQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={simulating}
                      onClick={() => handleSimulateCustomer(q)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 text-[10px] font-bold hover:bg-amber-100 shrink-0 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Manual Reply Input */}
              <form onSubmit={handleSendAdmin} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="پاسخ دستی شما به عنوان مدیر پیج..."
                  value={adminInput}
                  onChange={(e) => setAdminInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#3b96cc] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={sendingAdmin || !adminInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#3b96cc] hover:bg-[#2c7ead] text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 rotate-180" />
                  <span>ارسال پاسخ دستی</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">یک گفتگو را از لیست راست انتخاب کنید</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                می‌توانید پیام‌های مشتریان در تلگرام و اینستاگرام را مشاهده کنید، پاسخ دستی بفرستید یا هوش مصنوعی را برای پاسخگویی خودکار فعال کنید.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 text-right my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-50 text-[#3b96cc]">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">شخصی‌سازی و اتصال ربات اختصاصی</h3>
                  <p className="text-[11px] text-slate-500">تنظیم هویت برند شما و تضمین تفکیک ۱۰۰٪ پیام‌ها</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕ بستن
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl shrink-0">
              <button
                type="button"
                onClick={() => setSettingsTab('connection')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  settingsTab === 'connection'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Key className="w-3.5 h-3.5 text-[#3b96cc]" />
                <span>۱. اتصال ربات اختصاصی</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsTab('persona')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  settingsTab === 'persona'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>۲. لحن و اطلاعات فروشگاه</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsTab('security')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  settingsTab === 'security'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>۳. امنیت و تفکیک</span>
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* TAB 1: CONNECTION GUIDE & INPUTS */}
              {settingsTab === 'connection' && (
                <div className="space-y-4">
                  {/* Notice Banner */}
                  <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200 text-sky-950 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-black text-xs text-sky-900">
                      <ShieldCheck className="w-4 h-4 text-[#3b96cc]" />
                      <span>چرا ربات اختصاصی برای هر کاربر؟</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-sky-800">
                      برای اینکه مشتریان نام و لوگوی برند <strong>خود شما</strong> را ببینند و پیام‌های هیچ کسب‌وکار دیگری با پیج شما تداخل پیدا نکند، هر کسب‌وکار ربات اختصاصی تلگرام و پیج رسمی اینستاگرام خود را متصل می‌کند.
                    </p>
                  </div>

                  {/* Step by step guide */}
                  <div className="rounded-2xl border border-slate-200 p-3.5 bg-slate-50 space-y-2.5">
                    <span className="font-black text-slate-800 block text-xs">
                      راهنمای ۱ دقیقه‌ای ساخت ربات رایگان تلگرام با برند خودتان:
                    </span>
                    <ol className="space-y-2 text-[11px] text-slate-600 list-decimal list-inside pr-1">
                      <li>
                        در تلگرام وارد ربات رسمی تلگرام <strong className="font-mono text-sky-700">@BotFather</strong> شوید.
                      </li>
                      <li>
                        دستور <strong className="font-mono text-slate-800">/newbot</strong> را ارسال کنید و نام برندتان (مثال: <em>فروشگاه پوشاک نورا</em>) را وارد کنید.
                      </li>
                      <li>
                        یک آیدی انگلیسی با پسوند <strong className="font-mono">bot</strong> بنویسید (مثال: <span className="font-mono text-slate-800">Nora_Shop_Bot</span>).
                      </li>
                      <li>
                        تلگرام یک کد توکن اختصاصی (API Token) به شما می‌دهد؛ آن را کپی کرده و در کادر پایین ثبت کنید.
                      </li>
                    </ol>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="block font-black text-slate-800 mb-1">
                        آیدی ربات تلگرام اختصاصی شما:
                      </label>
                      <input
                        type="text"
                        placeholder="@YourBrand_Bot"
                        value={telegramBotUsername}
                        onChange={(e) => setTelegramBotUsername(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-left font-mono text-slate-900 focus:outline-none focus:border-[#3b96cc]"
                      />
                    </div>

                    <div>
                      <label className="block font-black text-slate-800 mb-1">
                        توکن اختصاصی ربات تلگرام (HTTP API Token):
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="مثال: 123456789:ABCdefGhIklMnoPQRstuVWXyz..."
                          value={telegramBotToken}
                          onChange={(e) => setTelegramBotToken(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-left font-mono text-slate-900 focus:outline-none focus:border-[#3b96cc]"
                        />
                        <span className="absolute left-2.5 top-2.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          محرمانه و امن
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        این توکن کلید اتصال به تلگرام است و فقط توسط شما مدیریت می‌شود.
                      </span>
                    </div>

                    <div>
                      <label className="block font-black text-slate-800 mb-1">
                        آیدی پیج اینستاگرام شما (جهت دایرکت اینستاگرام):
                      </label>
                      <input
                        type="text"
                        placeholder="@yourbrand_page"
                        value={instagramHandle}
                        onChange={(e) => setInstagramHandle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-left font-mono text-slate-900 focus:outline-none focus:border-[#3b96cc]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI PERSONA & BUSINESS DETAILS */}
              {settingsTab === 'persona' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-black text-slate-800 mb-1">نام رسمی فروشگاه / برند شما:</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="مثال: گالری شیک‌پوشان نیما"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#3b96cc]"
                    />
                  </div>

                  {/* AI Tone Selection */}
                  <div>
                    <label className="block font-black text-slate-800 mb-1.5">انتخاب لحن صحبت هوش مصنوعی با مشتریان:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'friendly', label: '🌸 صمیمی و پرانرژی', desc: 'استفاده از ایموجی‌های شاد، گرم و محترمانه' },
                        { id: 'formal', label: '💼 رسمی و اداری', desc: 'بسیار متین، بدون شوخی، مناسب سازمان‌ها' },
                        { id: 'sales', label: '🛍️ فروشنده حرفه‌ای', desc: 'ترغیب به خرید، پیشنهاد تخفیف و نهایی کردن' },
                        { id: 'fast', label: '⚡ کوتاه و تلگرافی', desc: 'پاسخ مستقیم و بدون اضافه گویی به قیمت و موجودی' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAiTone(item.id as any)}
                          className={`p-2.5 rounded-xl border text-right transition-all ${
                            aiTone === item.id
                              ? 'bg-sky-50 border-[#3b96cc] text-[#3b96cc] shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block font-black text-xs mb-0.5">{item.label}</span>
                          <span className="block text-[10px] text-slate-500 leading-tight">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shipping & Discounts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-black text-slate-800 mb-1">کد تخفیف اختصاصی (اختیاری):</label>
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="مثال: WELCOME20"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#3b96cc]"
                      />
                    </div>
                    <div>
                      <label className="block font-black text-slate-800 mb-1">شماره تماس پشتیبان انسانی:</label>
                      <input
                        type="text"
                        value={supportPhone}
                        onChange={(e) => setSupportPhone(e.target.value)}
                        placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#3b96cc]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-black text-slate-800 mb-1">شرایط و نحوه ارسال سفارشات:</label>
                    <input
                      type="text"
                      value={shippingInfo}
                      onChange={(e) => setShippingInfo(e.target.value)}
                      placeholder="مثال: پست پیشتاز ۲ روزه به سراسر کشور - تهران پیک فوری"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#3b96cc]"
                    />
                  </div>

                  {/* Knowledge Base */}
                  <div>
                    <label className="block font-black text-slate-800 mb-1">
                      راهنمای محصولات، قیمت‌ها و سوالات متداول (پایگاه دانش AI):
                    </label>
                    <textarea
                      rows={3}
                      value={knowledgeBase}
                      onChange={(e) => setKnowledgeBase(e.target.value)}
                      placeholder="قیمت‌ها، نحوه سفارش، شماره کارت، شرایط مرجوعی ۷ روزه و ضمانت..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#3b96cc]"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      هوش مصنوعی با خواندن این بخش، دقیقاً به سوالات قیمت و اطلاعات شما پاسخ می‌دهد.
                    </span>
                  </div>

                  {/* Custom Prompt */}
                  <div>
                    <label className="block font-black text-slate-800 mb-1">
                      دستورالعمل ویژه به هوش مصنوعی (اختیاری):
                    </label>
                    <input
                      type="text"
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="مثال: همیشه در انتهای پیام لینک خرید آنلاین را بفرست"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#3b96cc]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: SECURITY & DATA ISOLATION */}
              {settingsTab === 'security' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-black text-xs text-emerald-900">
                      <Shield className="w-4 h-4 text-emerald-600" />
                      <span>تضمین عدم مشاهده پیام‌های دیگران و حریم خصوصی</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-emerald-800">
                      سیستم سوشال‌من پیام‌ها را بر اساس مدل Multi-Tenant ایزوله می‌کند. در این ساختار:
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <h4 className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                        <Key className="w-3.5 h-3.5 text-[#3b96cc]" />
                        <span>۱. تفکیک با کلید کاربری یکتا (User ID Isolation):</span>
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        هر پیامی که در سیستم ثبت می‌شود به شناسه اختصاصی حساب شما قفل می‌شود. کاربر دیگری حتی اگر همزمان با شما وارد برنامه شود، به پیام‌های پیج شما دسترسی نخواهد داشت.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <h4 className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                        <Bot className="w-3.5 h-3.5 text-purple-600" />
                        <span>۲. پاسخگویی انحصاری با توکن اختصاصی شما:</span>
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        هوش مصنوعی پاسخ را فقط از طریق توکن رباتِ خود شما به همان مشتری در تلگرام/اینستاگرام ریپلای می‌زند و پیام هرگز در چت ربات دیگری ظاهر نمی‌شود.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <h4 className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>۳. حفظ ۱۰۰٪ هویت و برند شما:</span>
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        مشتری شما هیچ نام یا نشانه‌ای از سوشال‌من نمی‌بیند؛ او حس می‌کند با پشتیبان رسمی پیج و برند خود شما در حال گفتگو است.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 shrink-0 space-y-2">
              {settingsSaved && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 border border-emerald-200 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>تنظیمات اختصاصی با موفقیت ذخیره و روی هوش مصنوعی اعمال شد.</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveSettings}
                className="w-full py-3 rounded-2xl bg-[#3b96cc] hover:bg-[#2c7ead] text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>ذخیره تنظیمات و فعال‌سازی هوش مصنوعی اختصاصی</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

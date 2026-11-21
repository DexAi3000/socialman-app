"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  MessageSquare,
  LifeBuoy,
  Send,
  Bot,
  User,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Paperclip,
  Sparkles,
  PhoneCall,
  Headphones,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';
import {
  SupportTicket,
  TicketDepartment,
  TicketPriority,
  TicketMessage,
} from '@/types';

export function SupportView() {
  const { currentUser, tickets, addTicket, addTicketReply, openConnectModal, openUpgradeModal } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'chatbot' | 'tickets'>('chatbot');

  // -------------------------------------------------------------
  // 1. CHATBOT STATE
  // -------------------------------------------------------------
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: 'bot' | 'user'; text: string; time: string }[]
  >([
    {
      id: 'm1',
      sender: 'bot',
      text: 'سلام نیما عزیز! 👋 من دستیار هوشمند و ۲۴ ساعته پشتیبانی سوشال‌من هستم.\nبرای هرگونه راهنمایی در مورد اتصال شبکه‌ها (اینستاگرام، تلگرام، روبیکا، واتساپ، بله)، زمان‌بندی محتوا، یا ارتقای پلن در خدمت شما هستم. سوال خود را بنویسید یا از گزینه‌های زیر انتخاب کنید:',
      time: 'هم‌اکنون',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'چطور کانال تلگرام رو برای انتشار وصل کنم؟',
    'نحوه اتصال اینستاگرام از طریق Meta API چیه؟',
    'آیا برای انتشار در شبکه‌ها نیاز به فیلترشکن دارم؟',
    'چطور پستم رو برای یک روز مشخص زمان‌بندی کنم؟',
    'تفاوت پلن نقره‌ای و طلایی چیه؟',
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isBotTyping]);

  const handleSendChatMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user' as const,
      text: text.trim(),
      time: 'هم‌اکنون',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsBotTyping(true);

    // Dynamic Intelligent Bot Answers
    await new Promise((r) => setTimeout(r, 1000));

    let botReply = '';
    const q = text.toLowerCase();

    if (q.includes('تلگرام') || q.includes('telegram')) {
      botReply = `📌 **راهنمای اتصال کانال تلگرام:**
۱. در تلگرام وارد کانال خود شوید و به بخش **Administrators** بروید.
۲. ربات رسمی **@SocialManPublishBot** را جستجو و اد کنید.
۳. دسترسی **Post Messages (ارسال پیام)** را به ربات بدهید.
۴. در اپلیکیشن ما به پنجره «تنظیم و اتصال اکانت‌ها» بروید و آیدی کانال را ثبت کنید.
پس از آن، تمام پست‌های زمان‌بندی‌شده شما دقیقاً سر وقت در کانال منتشر می‌شوند.`;
    } else if (q.includes('اینستاگرام') || q.includes('instagram') || q.includes('متا')) {
      botReply = `📷 **نحوه اتصال اینستاگرام با Meta Graph API:**
۱. پیج اینستاگرام شما باید از نوع حرفه‌ای (Professional / Creator / Business) باشد.
۲. پیج را به یک صفحه فیس‌بوک متصل کنید.
۳. در اپلیکیشن، دکمه «اتصال با اینستاگرام (Meta)» را بزنید و لاگین رسمی فیس‌بوک را تایید کنید.
این روش کاملاً قانونی و بدون خطر دیسیبل شدن پیج است و نیازی به پسورد شما ندارد.`;
    } else if (q.includes('فیلترشکن') || q.includes('vpn') || q.includes('پراکسی')) {
      botReply = `🛡️ **پاسخ به سوال فیلترشکن:**
خیر! سرورهای پردازش ابری سوشال‌من در خارج از کشور و بر روی سرورهای پایدار مستقر هستند. بنابراین شما و مخاطبانتان بدون نیاز به روشن بودن فیلترشکن می‌توانید پست‌ها را زمان‌بندی کنید و سیستم خودکار در زمان مشخص پست را در تلگرام و اینستاگرام و بله و روبیکا منتشر می‌کند.`;
    } else if (q.includes('زمان‌بندی') || q.includes('سه‌شنبه') || q.includes('تقویم')) {
      botReply = `⏰ **نحوه زمان‌بندی پست:**
در صفحه «انتشار ۵ پلتفرم»، عکس و متن کپشن را آماده کنید. سپس در پایین فرم، گزینه **«زمان‌بندی در تاریخ و ساعت مشخص»** را فعال کنید. تاریخ شمسی (مثلاً ۱۴۰۳/۰۹/۱۰) و ساعت دلخواه را انتخاب کرده و دکمه زمان‌بندی را بزنید. سرور ما رأس ثانیه تعیین‌شده پست را ارسال می‌کند.`;
    } else if (q.includes('پلن') || q.includes('طلایی') || q.includes('قیمت') || q.includes('هوش مصنوعی')) {
      botReply = `👑 **تفاوت پلن‌ها و هوش مصنوعی:**
• **پلن برنز (رایگان):** اتصال ۲ پلتفرم و تا ۱۰ پست در ماه.
• **پلن نقره‌ای (۱۸۹ هزار تومان):** انتشار نامحدود در تمام ۵ پلتفرم و تا ۵ پیج کاری.
• **پلن طلایی / آژانس (۵۸۰ هزار تومان):** علاوه بر انتشار نامحدود ۵ پلتفرم، دسترسی کامل به دستیار هوش مصنوعی Google Gemini برای نوشتن خودکار ایده، کپشن و هوک ویروسی + پورتال کارفرما را دارد.`;
    } else {
      botReply = `متوجه سوال شما شدم! 💡 
سوشال‌من هاب متمرکز انتشار و زمان‌بندی همزمان در ۵ پلتفرم (اینستاگرام، تلگرام، واتساپ، روبیکا و بله) است.
اگر موضوع شما نیاز به بررسی کارشناسی یا دسترسی‌های فنی دارد، می‌توانید از تب کناری **«ثبت و پیگیری تیکت»** یک تیکت رسمی ثبت فرمایید تا کارشناسان ما فوراً به آن رسیدگی کنند.`;
    }

    setIsBotTyping(false);
    setChatMessages((prev) => [
      ...prev,
      {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        time: 'هم‌اکنون',
      },
    ]);
  };

  // -------------------------------------------------------------
  // 2. TICKETS STATE
  // -------------------------------------------------------------
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDept, setTicketDept] = useState<TicketDepartment>('technical');
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>('medium');
  const [ticketMessage, setTicketMessage] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [ticketSuccessNotice, setTicketSuccessNotice] = useState<string | null>(null);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    const newTicket = addTicket(
      ticketSubject.trim(),
      ticketDept,
      ticketPriority,
      ticketMessage.trim()
    );

    setTicketSubject('');
    setTicketMessage('');
    setShowNewTicketForm(false);
    setSelectedTicketId(newTicket.id);
    setTicketSuccessNotice(`تیکت جدید با کد پیگیری ${newTicket.trackingCode} با موفقیت ثبت شد.`);
    setTimeout(() => setTicketSuccessNotice(null), 5000);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicketId) return;

    addTicketReply(selectedTicketId, replyMessage.trim());
    setReplyMessage('');
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            در انتظار بررسی کارشناس
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-500" />
            در حال پیگیری فنی
          </span>
        );
      case 'answered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-50 text-[#3b96cc] border border-sky-200">
            <CheckCircle2 className="w-3 h-3 text-[#3b96cc]" />
            پاسخ داده شده
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
            بسته شده
          </span>
        );
    }
  };

  const getDeptName = (dept: TicketDepartment) => {
    switch (dept) {
      case 'technical':
        return 'پشتیبانی فنی و اتصال پلتفرم‌ها';
      case 'billing':
        return 'امور مالی و ارتقای حساب';
      case 'channels':
        return 'گزارش اتصال ربات‌ها و API';
      case 'feature_request':
        return 'پیشنهادات و قابلیت‌های جدید';
    }
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-right">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#3b96cc] to-sky-400 flex items-center justify-center text-white shadow-md shadow-[#3b96cc]/30 shrink-0">
            <Headphones className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[#3b96cc] text-[10px] font-black">
                مرکز پشتیبانی رسمی
              </span>
              <span className="text-[10px] text-gray-400 font-bold">پاسخ‌گویی ۲۴ ساعته</span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-gray-900">
              مرکز پشتیبانی و خدمات مشترکین سوشال‌من
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              پاسخ آنی سوالات با چت‌بات هوش مصنوعی و پیگیری اختصاصی تیکت‌های فنی
            </p>
          </div>
        </div>

        {/* Two Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-2xl border border-gray-100 shrink-0">
          <button
            onClick={() => setActiveSubTab('chatbot')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'chatbot'
                ? 'bg-[#3b96cc] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>چت‌بات هوشمند (۲۴/۷)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tickets')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeSubTab === 'tickets'
                ? 'bg-[#3b96cc] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>سامانه تیکت پشتیبانی</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'tickets' ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {toPersianDigits(tickets.length)}
            </span>
          </button>
        </div>
      </div>

      {/* 2. CHATBOT TAB VIEW */}
      {activeSubTab === 'chatbot' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="p-4 px-6 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3b96cc] to-sky-400 flex items-center justify-center text-white shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-gray-900 block">
                  دستیار هوشمند پشتیبانی سوشال‌من
                </span>
                <span className="text-[10px] text-sky-600 font-bold">
                  آنلاین • آماده پاسخ به سوالات انتشار و اتصال
                </span>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 font-mono hidden sm:block">
              پاسخگویی آنی با هوش مصنوعی
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-[#3b96cc] text-white shadow-xs'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-3xl text-xs leading-relaxed text-right space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-[#3b96cc] text-white rounded-tr-xs shadow-xs'
                      : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-xs whitespace-pre-line'
                  }`}
                >
                  <p className="font-medium">{msg.text}</p>
                  <span
                    className={`text-[9px] block text-left font-mono ${
                      msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isBotTyping && (
              <div className="flex gap-3 max-w-[85%] ml-auto">
                <div className="w-8 h-8 rounded-xl bg-[#3b96cc] text-white flex items-center justify-center text-xs shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 px-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-1.5 text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] mr-2 font-bold">دستیار در حال تایپ...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-5 py-2.5 bg-gray-50/80 border-t border-gray-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChatMessage(prompt)}
                className="text-[10px] bg-white hover:bg-sky-50 hover:text-[#3b96cc] border border-gray-200 hover:border-sky-200 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap font-bold text-gray-600 shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 pr-4 focus-within:border-[#3b96cc] focus-within:bg-white transition-all"
            >
              <input
                type="text"
                placeholder="سوال خود درباره اتصال، انتشار یا پلن‌ها را بنویسید..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-transparent text-xs text-gray-900 outline-none placeholder-gray-400 text-right font-medium"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="w-10 h-10 rounded-xl bg-[#3b96cc] hover:bg-[#2c7ead] disabled:opacity-40 text-white flex items-center justify-center transition-transform active:scale-95 shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4 fill-white rotate-45 -mr-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. TICKETS TAB VIEW */}
      {activeSubTab === 'tickets' && (
        <div className="space-y-5">
          {/* Success Banner */}
          {ticketSuccessNotice && (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-[#3b96cc] flex items-center justify-between text-xs font-black animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3b96cc]" />
                <span>{ticketSuccessNotice}</span>
              </div>
            </div>
          )}

          {/* Top Row: Action Button to create ticket */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black text-gray-900">
              لیست تیکت‌های ثبت‌شده شما
            </h2>
            <button
              onClick={() => {
                setShowNewTicketForm(!showNewTicketForm);
                setSelectedTicketId(null);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#3b96cc] hover:bg-[#2c7ead] text-white text-xs font-black shadow-md shadow-[#3b96cc]/20 transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{showNewTicketForm ? 'بستن فرم' : 'ثبت تیکت جدید'}</span>
            </button>
          </div>

          {/* Create New Ticket Form */}
          {showNewTicketForm && (
            <form
              onSubmit={handleCreateTicket}
              className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200 text-right"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-xs font-black text-gray-900">
                  فرم ارسال تیکت جدید به کارشناسان پشتیبانی
                </span>
                <span className="text-[10px] text-gray-400">میانگین زمان پاسخ: کمتر از ۱۵ دقیقه</span>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-black text-gray-800 mb-1.5">
                  عنوان تیکت:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سوال درباره نحوه اتصال کانال روبیکا به سیستم"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] rounded-2xl px-4 py-3 text-xs text-gray-900 font-medium outline-none transition-colors"
                />
              </div>

              {/* Department & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-800 mb-1.5">
                    دپارتمان مربوطه:
                  </label>
                  <select
                    value={ticketDept}
                    onChange={(e) => setTicketDept(e.target.value as TicketDepartment)}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] rounded-2xl px-4 py-3 text-xs text-gray-900 font-medium outline-none transition-colors"
                  >
                    <option value="technical">پشتیبانی فنی و اتصال پلتفرم‌ها</option>
                    <option value="billing">امور مالی، ارتقای پلن و فاکتور</option>
                    <option value="channels">گزارش خطا در ارسال خودکار پست</option>
                    <option value="feature_request">پیشنهاد قابلیت و انتقادات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-800 mb-1.5">
                    اولویت بررسی:
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as TicketPriority)}
                    className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] rounded-2xl px-4 py-3 text-xs text-gray-900 font-medium outline-none transition-colors"
                  >
                    <option value="low">معمولی</option>
                    <option value="medium">متوسط</option>
                    <option value="high">مهم</option>
                    <option value="urgent">بسیار فوری ⚡</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-black text-gray-800 mb-1.5">
                  متن پیام و توضیحات کامل:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="مشکل، سوال یا درخواست خود را به همراه جزئیات کامل بنویسید..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] rounded-2xl p-4 text-xs text-gray-900 font-medium outline-none transition-colors leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#3b96cc] hover:bg-[#2c7ead] text-white text-xs font-black shadow-md shadow-[#3b96cc]/20 transition-transform active:scale-95"
                >
                  ارسال تیکت به کارشناس
                </button>
              </div>
            </form>
          )}

          {/* Tickets List & Detail View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Tickets Table (7 cols) */}
            <div className="lg:col-span-7 space-y-2.5">
              {tickets.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 text-gray-400 text-xs">
                  هنوز تیکتی ثبت نکرده‌اید. با کلیک بر روی «ثبت تیکت جدید» اولین درخواست خود را ثبت کنید.
                </div>
              ) : (
                tickets.map((t) => {
                  const isSelected = selectedTicketId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTicketId(t.id);
                        setShowNewTicketForm(false);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-right ${
                        isSelected
                          ? 'bg-sky-50/60 border-[#3b96cc] shadow-xs'
                          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] font-black text-gray-500">
                          {t.trackingCode}
                        </span>
                        {getStatusBadge(t.status)}
                      </div>

                      <h4 className="text-xs sm:text-sm font-black text-gray-900 mb-1.5 leading-snug">
                        {t.subject}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100/60 font-medium">
                        <span>{getDeptName(t.department)}</span>
                        <span>{t.updatedAtShamsi}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Conversation Thread (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between min-h-[400px]">
              {selectedTicket ? (
                <div className="space-y-4 flex flex-col h-full justify-between">
                  {/* Thread Header */}
                  <div className="pb-3 border-b border-gray-100 text-right space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-mono">
                        کد پیگیری: {selectedTicket.trackingCode}
                      </span>
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <h3 className="text-xs font-black text-gray-900 leading-snug">
                      {selectedTicket.subject}
                    </h3>
                  </div>

                  {/* Messages Bubble Stream */}
                  <div className="space-y-3 overflow-y-auto max-h-[300px] p-1 flex-1">
                    {selectedTicket.messages.map((m) => {
                      const isSupport = m.sender === 'support';
                      return (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-2xl text-xs space-y-1 text-right ${
                            isSupport
                              ? 'bg-sky-50/80 border border-sky-100 text-sky-950 ml-4'
                              : 'bg-gray-50 border border-gray-100 text-gray-800 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className={isSupport ? 'text-[#3b96cc]' : 'text-gray-500'}>
                              {m.senderName}
                            </span>
                            <span className="text-gray-400 font-mono">{m.timestamp}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed whitespace-pre-line font-medium">
                            {m.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleSendReply} className="pt-3 border-t border-gray-100 space-y-2">
                    <textarea
                      rows={2}
                      placeholder="پاسخ خود به کارشناس را بنویسید..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#3b96cc] rounded-xl p-2.5 text-xs text-gray-900 outline-none text-right font-medium"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!replyMessage.trim()}
                        className="px-4 py-1.5 rounded-xl bg-[#3b96cc] hover:bg-[#2c7ead] disabled:opacity-40 text-white text-xs font-black transition-colors"
                      >
                        ارسال پاسخ
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400 space-y-2">
                  <FileText className="w-10 h-10 stroke-1 text-gray-300" />
                  <span className="text-xs font-bold text-gray-500">
                    برای مشاهده جزییات و پاسخ‌ها، یک تیکت را از لیست انتخاب کنید.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

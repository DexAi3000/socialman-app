"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Users,
  CheckCircle2,
  Copy,
  Check,
  MessageSquare,
  Lock,
  ExternalLink,
  Share2,
  Send,
  PlusCircle,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

// Resilient clipboard helper that works everywhere (including HTTP on mobile)
function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  // Fallback using textarea execCommand (works in insecure HTTP contexts)
  const fallback = () => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(el);
      return successful;
    } catch (e) {
      console.error('Fallback copy failed:', e);
      return false;
    }
  };

  if (navigator?.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => fallback());
  }
  return Promise.resolve(fallback());
}

export function ClientPortalView() {
  const { currentPlan, posts, updatePost, openUpgradeModal, activeWorkspace } = useApp();
  const [commentInput, setCommentInput] = useState<{ [postId: string]: string }>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDedicatedLink, setCopiedDedicatedLink] = useState(false);
  const [showDedicatedModal, setShowDedicatedModal] = useState(false);
  const [selectedPostForDedicatedLink, setSelectedPostForDedicatedLink] = useState<string>('workspace');

  const pendingPosts = posts.filter(
    (p) => p.workspaceId === activeWorkspace?.id && p.status === 'pending_approval'
  );

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/socialman` : 'http://194.117.64.88/socialman';
  const workspacePortalLink = `${baseUrl}/approve/${activeWorkspace?.id || 'main'}`;

  const dedicatedLink =
    selectedPostForDedicatedLink === 'workspace'
      ? workspacePortalLink
      : `${baseUrl}/approve/${selectedPostForDedicatedLink}`;

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(workspacePortalLink);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyDedicatedLink = async () => {
    const ok = await copyToClipboard(dedicatedLink);
    if (ok) {
      setCopiedDedicatedLink(true);
      setTimeout(() => setCopiedDedicatedLink(false), 2000);
    }
  };

  const handleApprove = (postId: string) => {
    updatePost(postId, { status: 'approved' });
  };

  const handleRequestChange = (postId: string) => {
    const comment = commentInput[postId];
    if (!comment) return;
    updatePost(postId, { clientComment: comment, status: 'draft' });
    setCommentInput((prev) => ({ ...prev, [postId]: '' }));
  };

  const shareText = encodeURIComponent(
    `سلام وقت بخیر 🌸\nمحتواهای جدید آماده بررسی شما هستند. لطفاً از طریق لینک زیر تاییدیه یا اصلاحات را ثبت کنید:\n${dedicatedLink}`
  );
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(dedicatedLink)}&text=${shareText}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Agency Gate / Promo Notice */}
      {currentPlan !== 'agency' && (
        <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-0.5">
                پورتال آنلاین کارفرما (ویژه پلن طلایی آژانس)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                دیگر نیازی به ارسال اسکرین‌شات و تایید گرفتن در چت‌های شلوغ نیست! یک لینک اختصاصی برای کارفرما بفرستید تا با یک کلیک تاییدیه نهایی یا کامنت اصلاحیه ثبت کند.
              </p>
            </div>
          </div>
          <button
            onClick={() => openUpgradeModal('agency')}
            className="whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm shrink-0 cursor-pointer"
          >
            فعال‌سازی پلن طلایی
          </button>
        </div>
      )}

      {/* Client Portal Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b96cc] animate-ping" />
              <h1 className="text-base font-black text-slate-900">
                پورتال تایید آنلاین محتوا: {activeWorkspace?.name || 'فضای کاری'}
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              این نمایی است که کارفرمای شما مشاهده خواهد کرد (بدون نیاز به نام کاربری یا ثبت‌نام)
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowDedicatedModal(true)}
              className="px-3.5 py-2 rounded-2xl text-xs font-black bg-sky-50 text-[#3b96cc] hover:bg-sky-100 border border-sky-200 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>ساخت لینک اختصاصی</span>
            </button>

            {/* Share Link Copy */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-2xl">
              <input
                type="text"
                readOnly
                value={workspacePortalLink}
                className="bg-transparent text-xs text-slate-600 font-mono px-2 outline-none w-40 sm:w-52 truncate dir-ltr text-left"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#3b96cc] hover:bg-[#2c7ead] text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'کپی شد ✓' : 'کپی لینک'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated Link Creator Modal */}
        {showDedicatedModal && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50/90 to-indigo-50/50 border border-sky-200 space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3b96cc]" />
                <h3 className="text-xs font-black text-slate-900">ساخت و ارسال لینک اختصاصی کارفرما</h3>
              </div>
              <button
                onClick={() => setShowDedicatedModal(false)}
                className="text-xs text-gray-400 hover:text-gray-700 font-bold cursor-pointer"
              >
                بستن ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              لینک ایجاد شده نیاز به ورود یا پسورد ندارد. کارفرما در موبایل یا لپ‌تاپ خود با لمس لینک می‌تواند مستقیماً پست‌ها را مشاهده، تایید یا درخواست اصلاح ثبت کند.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 block">انتخاب دامنه دسترسی لینک:</label>
              <select
                value={selectedPostForDedicatedLink}
                onChange={(e) => setSelectedPostForDedicatedLink(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-[#3b96cc]"
              >
                <option value="workspace">
                  🌐 لینک پورتال جامع پیج: {activeWorkspace?.name} (نمایش همه پست‌های در نوبت)
                </option>
                {pendingPosts.map((p) => (
                  <option key={p.id} value={p.id}>
                    📄 لینک اختصاصی فقط برای: {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Generated URL Box */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-xl">
              <input
                type="text"
                readOnly
                value={dedicatedLink}
                className="bg-transparent text-xs text-slate-700 font-mono flex-1 outline-none truncate dir-ltr text-left px-1"
              />
              <button
                onClick={handleCopyDedicatedLink}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#3b96cc] hover:bg-[#2c7ead] text-white flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedDedicatedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDedicatedLink ? 'کپی شد' : 'کپی'}</span>
              </button>
              <a
                href={dedicatedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                title="مشاهده پیش‌نمایش"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Direct Send to Messengers */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={telegramShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ارسال در تلگرام</span>
              </a>

              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>ارسال در واتساپ</span>
              </a>
            </div>
          </div>
        )}

        {/* Pending Approval List */}
        <div>
          <h2 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            پست‌های در نوبت بررسی کارفرما ({toPersianDigits(pendingPosts.length)} مورد)
          </h2>

          {pendingPosts.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-slate-50 border border-slate-200 p-6 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-[#00A852] mx-auto mb-2" />
              <h3 className="text-sm font-black text-slate-900">تمامی پست‌ها بررسی شده‌اند!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                هیچ پستی در انتظار بررسی کارفرما نیست. در بخش تقویم وضعیت پست‌های دیگر را به «در انتظار تایید» تغییر دهید تا در این صفحه فعال شوند.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <span className="text-sm font-black text-slate-900">{post.title}</span>
                    <span className="text-[11px] text-slate-500 font-mono font-bold">
                      📅 تاریخ: {post.scheduledDateShamsi} ساعت {toPersianDigits(post.scheduledTime)}
                    </span>
                  </div>

                  {post.hook && (
                    <div className="text-xs p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950">
                      <strong className="text-[#00A852] ml-1">قلاب اولیه: </strong> {post.hook}
                    </div>
                  )}

                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    {post.content}
                  </p>

                  {/* Actions for Client */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="ثبت نظر یا اصلاحیه..."
                        value={commentInput[post.id] || ''}
                        onChange={(e) =>
                          setCommentInput({ ...commentInput, [post.id]: e.target.value })
                        }
                        className="w-full bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#00D166]"
                      />
                      <button
                        onClick={() => handleRequestChange(post.id)}
                        className="whitespace-nowrap px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
                      >
                        ارسال اصلاحیه
                      </button>
                    </div>

                    <button
                      onClick={() => handleApprove(post.id)}
                      className="whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black bg-[#00D166] hover:bg-[#00be5b] text-slate-950 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      تایید نهایی برای انتشار
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

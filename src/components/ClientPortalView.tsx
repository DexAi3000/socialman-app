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
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

export function ClientPortalView() {
  const { currentPlan, posts, updatePost, openUpgradeModal, activeWorkspace } = useApp();
  const [commentInput, setCommentInput] = useState<{ [postId: string]: string }>({});
  const [copiedLink, setCopiedLink] = useState(false);

  const pendingPosts = posts.filter(
    (p) => p.workspaceId === activeWorkspace.id && p.status === 'pending_approval'
  );

  const handleApprove = (postId: string) => {
    updatePost(postId, { status: 'approved' });
  };

  const handleRequestChange = (postId: string) => {
    const comment = commentInput[postId];
    if (!comment) return;
    updatePost(postId, { clientComment: comment, status: 'draft' });
    setCommentInput(prev => ({ ...prev, [postId]: '' }));
  };

  const dummyShareLink = `https://socialman.ir/review/${activeWorkspace.id}-token789`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(dummyShareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

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
                پیش‌نمایش زنده پورتال کارفرما (ویژه پلن طلایی آژانس)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                دیگر نیازی به ارسال اسکرین‌شات و تایید گرفتن در چت‌های شلوغ نیست! یک لینک اختصاصی برای کارفرما بفرستید تا با یک کلیک تاییدیه نهایی یا کامنت اصلاحیه ثبت کند.
              </p>
            </div>
          </div>
          <button
            onClick={() => openUpgradeModal('agency')}
            className="whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm shrink-0"
          >
            فعال‌سازی پلن طلایی
          </button>
        </div>
      )}

      {/* Client Portal Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D166] animate-ping" />
              <h1 className="text-base font-black text-slate-900">
                پورتال تایید آنلاین محتوا: {activeWorkspace.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              این نمایی است که کارفرمای شما مشاهده خواهد کرد (بدون نیاز به نام کاربری یا ثبت‌نام)
            </p>
          </div>

          {/* Share Link Copy */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl">
            <input
              type="text"
              readOnly
              value={dummyShareLink}
              className="bg-transparent text-xs text-slate-600 font-mono px-2 outline-none w-48 sm:w-60 truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00D166] hover:bg-[#00be5b] text-slate-950 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'کپی شد' : 'کپی لینک'}</span>
            </button>
          </div>
        </div>

        {/* Pending Approval List */}
        <div>
          <h2 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            پست‌های در نوبت بررسی کارفرما ({toPersianDigits(pendingPosts.length)} مورد)
          </h2>

          {pendingPosts.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-slate-50 border border-slate-200 p-6 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-[#00A852] mx-auto mb-2" />
              <h3 className="text-sm font-black text-slate-900">تمام پست‌ها تایید شده‌اند!</h3>
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
                        className="whitespace-nowrap px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
                      >
                        ارسال اصلاحیه
                      </button>
                    </div>

                    <button
                      onClick={() => handleApprove(post.id)}
                      className="whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black bg-[#00D166] hover:bg-[#00be5b] text-slate-950 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
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

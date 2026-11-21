"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Building,
  Check,
} from 'lucide-react';
import { toPersianDigits } from '@/lib/utils';

function ClientApprovalContent() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [dataMode, setDataMode] = useState<'post' | 'workspace'>('post');
  const [post, setPost] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [workspacePosts, setWorkspacePosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [feedbackModePostId, setFeedbackModePostId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch(`/socialman/api/posts/approve?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          if (data.mode === 'workspace') {
            setDataMode('workspace');
            setWorkspace(data.workspace);
            setWorkspacePosts(data.posts || []);
          } else {
            setDataMode('post');
            setPost(data.post);
          }
        } else {
          setError(data.error || 'پست یا پورتال مورد نظر یافت نشد.');
        }
      })
      .catch(() => setError('خطای شبکه در دریافت اطلاعات محتوا'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleApprove = async (targetPostId: string) => {
    setSubmittingId(targetPostId);
    try {
      const res = await fetch('/socialman/api/posts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, postId: targetPostId, action: 'approve' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (dataMode === 'workspace') {
          setWorkspacePosts((prev) =>
            prev.map((p) => (p.id === targetPostId ? { ...p, status: 'approved', clientFeedback: null } : p))
          );
        } else {
          setPost((prev: any) => ({ ...prev, status: 'approved', clientFeedback: null }));
        }
        setStatusMessage('محتوا با موفقیت تایید شد.');
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      alert('خطایی در تایید پست رخ داد.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (targetPostId: string) => {
    if (!feedbackText.trim()) {
      alert('لطفاً نظر یا توضیحات اصلاحیه را بنویسید.');
      return;
    }
    setSubmittingId(targetPostId);
    try {
      const res = await fetch('/socialman/api/posts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, postId: targetPostId, action: 'reject', feedback: feedbackText }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (dataMode === 'workspace') {
          setWorkspacePosts((prev) =>
            prev.map((p) => (p.id === targetPostId ? { ...p, status: 'draft', clientFeedback: feedbackText } : p))
          );
        } else {
          setPost((prev: any) => ({
            ...prev,
            status: 'draft',
            clientFeedback: feedbackText,
          }));
        }
        setFeedbackModePostId(null);
        setFeedbackText('');
        setStatusMessage('اصلاحیه شما ثبت شد و به اطلاع ادمین محتوا رسید.');
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch {
      alert('خطایی در ثبت اصلاحیه رخ داد.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#3b96cc] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500 font-bold">در حال بارگذاری محتوای ارسالی...</span>
        </div>
      </div>
    );
  }

  if (error || (!post && !workspace)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 max-w-sm w-full space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-black text-gray-900">{error || 'محتوایی یافت نشد'}</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            احتمالاً این لینک منقضی شده است یا پیج کاری مربوطه تغییر کرده است.
          </p>
        </div>
      </div>
    );
  }

  const postsList = dataMode === 'workspace' ? workspacePosts : post ? [post] : [];
  const pendingCount = postsList.filter((p) => p.status === 'pending_approval').length;

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6" dir="rtl">
      <div className="max-w-xl mx-auto space-y-4">
        
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-[#3b96cc] border border-sky-100 flex items-center justify-center font-black text-sm">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-black block">پورتال اختصاصی تایید محتوا</span>
              <h1 className="text-sm font-black text-gray-900">
                {workspace?.name || post?.workspaceName || 'پیج کاری'}
              </h1>
            </div>
          </div>

          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-sky-50 text-[#3b96cc] border border-sky-100">
            {dataMode === 'workspace' ? `${toPersianDigits(postsList.length)} پست در نوبت` : 'بررسی پست اختصاصی'}
          </span>
        </div>

        {/* Status Toast Message */}
        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Empty state when workspace has no pending posts */}
        {postsList.length === 0 && (
          <div className="text-center py-12 rounded-3xl bg-white border border-gray-100 p-6 space-y-2 shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-[#00A852] mx-auto mb-2" />
            <h3 className="text-sm font-black text-gray-900">تمامی محتواها بررسی شده‌اند!</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              هم‌اکنون پستی در نوبت تایید قرار ندارد. به محض آماده‌سازی محتوای جدید توسط تیم تولید محتوا، در این صفحه نمایش داده خواهد شد.
            </p>
          </div>
        )}

        {/* Posts List */}
        {postsList.map((item: any) => {
          const isFeedbackOpen = feedbackModePostId === item.id;
          const isSubmitting = submittingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-4"
            >
              {/* Post Header details */}
              <div className="flex items-center justify-between text-xs text-gray-500 font-bold pb-3 border-b border-gray-50">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#3b96cc]" />
                  {item.scheduledDateShamsi || 'تاریخ مقرر'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    item.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : item.status === 'draft'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-sky-50 text-[#3b96cc] border-sky-200 animate-pulse'
                  }`}
                >
                  {item.status === 'approved'
                    ? 'تایید شده ✓'
                    : item.status === 'draft'
                    ? 'دارای اصلاحیه'
                    : 'در انتظار تایید شما ⏳'}
                </span>
              </div>

              {/* Media if present */}
              {item.mediaUrl && (
                <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video relative">
                  <Image
                    src={item.mediaUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Title and Hook */}
              <div>
                <h2 className="text-sm font-black text-gray-900 leading-snug">{item.title}</h2>
                {item.hook && (
                  <p className="text-xs text-sky-800 bg-sky-50/70 p-2 rounded-xl mt-1.5 border border-sky-100 font-medium">
                    ⚡ {item.hook}
                  </p>
                )}
              </div>

              {/* Caption Content */}
              <div className="bg-gray-50/80 rounded-2xl p-3.5 text-xs text-gray-700 whitespace-pre-line leading-relaxed font-medium text-right border border-gray-100">
                {item.content}
              </div>

              {/* Hashtags */}
              {item.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.hashtags.map((h: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[10px] text-[#3b96cc] bg-sky-50 px-2 py-0.5 rounded-lg font-bold"
                    >
                      #{h.replace(/^#/, '')}
                    </span>
                  ))}
                </div>
              )}

              {/* Existing Feedback if any */}
              {item.clientFeedback && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-[11px] text-amber-800">
                    <MessageSquare className="w-3.5 h-3.5" />
                    آخرین بازخورد ثبت‌شده شما:
                  </span>
                  <p className="text-xs font-medium">{item.clientFeedback}</p>
                </div>
              )}

              {/* Actions for Client */}
              {item.status !== 'approved' && !isFeedbackOpen && (
                <div className="space-y-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => handleApprove(item.id)}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs py-3 px-4 rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    تایید نهایی انتشار این پست
                  </button>

                  <button
                    onClick={() => setFeedbackModePostId(item.id)}
                    disabled={isSubmitting}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-2.5 px-4 rounded-2xl border border-gray-200 shadow-2xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                    نیاز به تغییر یا اصلاح دارد
                  </button>
                </div>
              )}

              {/* Feedback Input Mode */}
              {isFeedbackOpen && (
                <div className="bg-white rounded-3xl p-4 border border-sky-100 shadow-md space-y-3 animate-in fade-in">
                  <h4 className="text-xs font-black text-gray-900">یادداشت و اصلاحات مد نظر شما:</h4>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="مثلاً: تصویر اسلاید دوم عوض شود، یا کپشن اصلاح شود..."
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#3b96cc] resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={isSubmitting}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      {isSubmitting ? 'در حال ثبت...' : 'ارسال نظر به ادمین'}
                    </button>
                    <button
                      onClick={() => {
                        setFeedbackModePostId(null);
                        setFeedbackText('');
                      }}
                      className="px-4 py-2.5 text-xs text-gray-500 hover:text-gray-700 font-bold cursor-pointer"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Brand Footer */}
        <div className="text-center pt-4">
          <p className="text-[11px] text-gray-400 font-medium">
            پشتیبانی‌شده توسط سیستم مدیریت هوشمند محتوای Social Man
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ClientApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#3b96cc] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ClientApprovalContent />
    </Suspense>
  );
}

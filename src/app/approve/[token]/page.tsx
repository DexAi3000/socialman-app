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
} from 'lucide-react';
import Link from 'next/link';

function ClientApprovalContent() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [feedbackMode, setFeedbackMode] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/posts/approve?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.post) {
          setPost(data.post);
        } else {
          setError(data.error || 'پست مورد نظر یافت نشد.');
        }
      })
      .catch(() => setError('خطای شبکه در دریافت اطلاعات پست'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/posts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'approve' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPost((prev: any) => ({ ...prev, status: 'approved' }));
        setStatusMessage('محتوا با موفقیت تایید شد. راس ساعت تنظیم‌شده منتشر می‌شود.');
      }
    } catch {
      alert('خطایی در تایید پست رخ داد.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!feedbackText.trim()) {
      alert('لطفاً نظر یا توضیحات اصلاحیه را بنویسید.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/posts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'reject', feedback: feedbackText }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPost((prev: any) => ({
          ...prev,
          status: 'draft',
          clientFeedback: feedbackText,
        }));
        setFeedbackMode(false);
        setStatusMessage('اصلاحیه شما ثبت شد و به اطلاع ادمین محتوا رسید.');
      }
    } catch {
      alert('خطایی در ثبت اصلاحیه رخ داد.');
    } finally {
      setSubmitting(false);
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 max-w-sm w-full space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-black text-gray-900">{error || 'پست یافت نشد'}</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            احتمالاً این لینک منقضی شده است یا پست قبلاً حذف گردیده است.
          </p>
          <Link
            href="/"
            className="inline-block w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold"
          >
            ورود به سوشال من
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 p-4 sm:p-6 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center overflow-hidden shrink-0">
              <Image
                src="/app-icon.jpg"
                alt="Social Man"
                width={36}
                height={36}
                className="object-cover"
              />
            </div>
            <div className="text-right">
              <h1 className="text-xs font-black text-gray-900">پورتال تایید کارفرما</h1>
              <span className="text-[11px] text-gray-500 font-medium">{post.workspaceName}</span>
            </div>
          </div>

          <span
            className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
              post.status === 'approved'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : post.status === 'draft'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-sky-50 text-[#3b96cc] border border-sky-200 animate-pulse'
            }`}
          >
            {post.status === 'approved'
              ? 'تایید شده ✓'
              : post.status === 'draft'
              ? 'در حال ویرایش'
              : 'در انتظار تایید شما ⏳'}
          </span>
        </div>

        {/* Success / Status Banner */}
        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Post Preview Card */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-4">
          {/* Post Header details */}
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold pb-3 border-b border-gray-50">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#3b96cc]" />
              {post.scheduledDateShamsi || 'تاریخ مقرر'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {post.scheduledTime || 'زمان انتشار'}
            </span>
          </div>

          {/* Media if present */}
          {post.mediaUrl && (
            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 aspect-video relative">
              <Image
                src={post.mediaUrl}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Title and Hook */}
          <div>
            <h2 className="text-sm font-black text-gray-900 leading-snug">{post.title}</h2>
          </div>

          {/* Caption Content */}
          <div className="bg-gray-50/80 rounded-2xl p-3.5 text-xs text-gray-700 whitespace-pre-line leading-relaxed font-medium text-right border border-gray-100">
            {post.content}
          </div>

          {/* Hashtags */}
          {post.hashtags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.hashtags.map((h: string, idx: number) => (
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
          {post.clientFeedback && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1 text-[11px] text-amber-800">
                <MessageSquare className="w-3.5 h-3.5" />
                آخرین بازخورد ثبت‌شده شما:
              </span>
              <p className="text-xs font-medium">{post.clientFeedback}</p>
            </div>
          )}
        </div>

        {/* Action Controls for Client */}
        {post.status !== 'approved' && !feedbackMode && (
          <div className="space-y-2 pt-2">
            <button
              onClick={handleApprove}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs py-3 px-4 rounded-2xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              تایید نهایی انتشار این پست
            </button>

            <button
              onClick={() => setFeedbackMode(true)}
              disabled={submitting}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs py-2.5 px-4 rounded-2xl border border-gray-200 shadow-2xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
              نیاز به تغییر یا اصلاح دارد
            </button>
          </div>
        )}

        {/* Feedback Input Mode */}
        {feedbackMode && (
          <div className="bg-white rounded-3xl p-4 border border-sky-100 shadow-md space-y-3 animate-in fade-in">
            <h4 className="text-xs font-black text-gray-900">یادداشت و اصلاحات مد نظر شما:</h4>
            <textarea
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="مثلاً: تصویر اسلاید دوم عوض شود، یا قیمت تصحیح شود..."
              className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 outline-none focus:border-[#3b96cc] resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleReject}
                disabled={submitting}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                {submitting ? 'در حال ثبت...' : 'ارسال نظر به ادمین'}
              </button>
              <button
                onClick={() => setFeedbackMode(false)}
                className="px-4 py-2.5 text-xs text-gray-500 hover:text-gray-700 font-bold"
              >
                انصراف
              </button>
            </div>
          </div>
        )}

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

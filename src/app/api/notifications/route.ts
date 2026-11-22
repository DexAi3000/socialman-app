import { connection, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, verifySession } from '@/lib/session';
import { DAY_MS, daysRemaining, EXPIRY_REMINDER_DAYS, getSubscriptionPeriod } from '@/lib/subscription';
import type { AppNotification } from '@/types';
import { toPersianDigits } from '@/lib/utils';

const FEED_LIMIT = 25;
const headers = { 'Cache-Control': 'private, no-store' };

async function signedUserId(request: Request) {
  const cookieSession = await getSession();
  if (cookieSession) return cookieSession.userId;
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;
  return verifySession(authorization.slice(7))?.userId ?? null;
}

async function getFeed(userId: string): Promise<Omit<AppNotification, 'read'>[]> {
  const now = new Date();
  const recent = new Date(now.getTime() - 30 * DAY_MS);
  const [user, posts, replies] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planStartedAt: true, planExpiresAt: true },
    }),
    prisma.post.findMany({
      where: {
        workspace: { userId },
        updatedAt: { gte: recent },
        OR: [
          { status: 'published' },
          { status: 'approved' },
          { status: 'draft', clientFeedback: { not: null } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: FEED_LIMIT,
      select: { id: true, title: true, status: true, clientFeedback: true, updatedAt: true },
    }),
    prisma.ticketMessage.findMany({
      where: { ticket: { userId }, sender: 'support', createdAt: { gte: recent } },
      orderBy: { createdAt: 'desc' },
      take: FEED_LIMIT,
      select: { id: true, createdAt: true, ticket: { select: { subject: true } } },
    }),
  ]);

  const activity: Omit<AppNotification, 'read'>[] = posts.map((post) => {
    const published = post.status === 'published';
    return {
      id: `post:${post.id}:${post.status}`,
      kind: published ? 'publication' : 'approval',
      title: published ? 'پست منتشر شد' : post.status === 'approved' ? 'پست آمادهٔ انتشار است' : 'درخواست بازبینی پست',
      detail: post.title,
      occurredAt: post.updatedAt.toISOString(),
      tab: 'workspace',
    };
  });

  activity.push(...replies.map((reply) => ({
    id: `support:${reply.id}`,
    kind: 'support' as const,
    title: 'پاسخ جدید پشتیبانی',
    detail: reply.ticket.subject,
    occurredAt: reply.createdAt.toISOString(),
    tab: 'support' as const,
  })));

  const subscription = user ? getSubscriptionPeriod(user) : null;
  if (subscription?.expiresAt) {
    const expires = Date.parse(subscription.expiresAt);
    const reminder = expires - EXPIRY_REMINDER_DAYS * DAY_MS;
    if (expires <= now.getTime()) {
      activity.push({
        id: `subscription:expired:${subscription.expiresAt}`,
        kind: 'subscription',
        title: 'دورهٔ اشتراک به پایان رسید',
        detail: 'برای فعال‌سازی دوباره، پلن‌های اشتراک را ببین.',
        occurredAt: subscription.expiresAt,
        tab: 'pricing',
      });
    } else if (reminder <= now.getTime()) {
      const days = daysRemaining(subscription.expiresAt, now.getTime());
      activity.push({
        id: `subscription:reminder:${subscription.expiresAt}`,
        kind: 'subscription',
        title: 'پایان اشتراک نزدیک است',
        detail: `تا ${toPersianDigits(days)} روز دیگر به پایان دوره می‌رسی.`,
        occurredAt: new Date(reminder).toISOString(),
        tab: 'pricing',
      });
    }
  }

  return activity
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, FEED_LIMIT);
}

export async function GET(request: Request) {
  await connection();
  const userId = await signedUserId(request);
  if (!userId) return NextResponse.json({ error: 'ورود لازم است.' }, { status: 401, headers });

  try {
    const feed = await getFeed(userId);
    const readRows = await prisma.notificationRead.findMany({
      where: { userId, key: { in: feed.map((notice) => notice.id) } },
      select: { key: true },
    });
    const readKeys = new Set(readRows.map(({ key }) => key));
    return NextResponse.json({
      notifications: feed.map((notice) => ({ ...notice, read: readKeys.has(notice.id) })),
    }, { headers });
  } catch (error) {
    console.error('Notification feed failed:', error);
    return NextResponse.json({ error: 'دریافت اعلان‌ها ممکن نشد.' }, { status: 500, headers });
  }
}

export async function PATCH(request: Request) {
  const userId = await signedUserId(request);
  if (!userId) return NextResponse.json({ error: 'ورود لازم است.' }, { status: 401, headers });

  const body = await request.json().catch(() => null);
  const ids = body?.ids;
  if (!Array.isArray(ids) || ids.length > FEED_LIMIT || ids.some((id) => typeof id !== 'string' || id.length > 128)) {
    return NextResponse.json({ error: 'فهرست اعلان‌ها معتبر نیست.' }, { status: 400, headers });
  }

  try {
    const feed = await getFeed(userId);
    const keys = feed.filter((notice) => ids.includes(notice.id)).map((notice) => notice.id);
    await prisma.$transaction(keys.map((key) => prisma.notificationRead.upsert({
      where: { userId_key: { userId, key } },
      create: { userId, key },
      update: {},
    })));
    return NextResponse.json({ read: keys }, { headers });
  } catch (error) {
    console.error('Notification read update failed:', error);
    return NextResponse.json({ error: 'ثبت وضعیت اعلان ممکن نشد.' }, { status: 500, headers });
  }
}

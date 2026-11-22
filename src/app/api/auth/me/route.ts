import { connection, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getEffectivePlan, getSubscriptionPeriod } from '@/lib/subscription';
import { getSession, verifySession, signSession } from '@/lib/session';

export async function GET(request: Request) {
  await connection();
  try {
    let session = await getSession();

    // 1. Fallback to Authorization: Bearer <token>
    if (!session) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        if (token) {
          session = verifySession(token);
        }
      }
    }

    let user = null;

    if (session) {
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
          workspaces: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      );
    }

    const token = signSession({
      userId: user.id,
      phone: user.phone,
      role: user.role,
      fullName: user.fullName || user.username || 'کاربر',
    });

    let connectedAccounts = null;
    if (user.connectedAccountsData) {
      try {
        connectedAccounts = JSON.parse(user.connectedAccountsData);
      } catch (_) {}
    }

    return NextResponse.json(
      {
        authenticated: true,
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          username: user.username,
          role: user.role,
          plan: getEffectivePlan(user),
          subscription: getSubscriptionPeriod(user),
          avatarUrl: user.avatarUrl,
        },
        workspaces: user.workspaces,
        connectedAccounts,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { authenticated: false, error: 'خطایی در بررسی سشن رخ داد' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  }
}

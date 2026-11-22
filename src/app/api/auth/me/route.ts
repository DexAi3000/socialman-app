import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, verifySession, setSessionCookie, signSession } from '@/lib/session';

export async function GET(request: Request) {
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

    // 2. Fallback to cached headers if cookie was lost or dropped by browser over HTTP
    if (!user) {
      const fallbackId = request.headers.get('x-user-id');
      const fallbackPhone = request.headers.get('x-user-phone');

      if (fallbackId || fallbackPhone) {
        user = await prisma.user.findFirst({
          where: {
            OR: [
              fallbackId ? { id: fallbackId } : undefined,
              fallbackPhone ? { phone: fallbackPhone } : undefined,
            ].filter(Boolean) as any,
          },
          include: {
            workspaces: true,
          },
        });

        // Re-issue cookie so future requests have it automatically
        if (user) {
          try {
            await setSessionCookie({
              userId: user.id,
              phone: user.phone,
              role: user.role,
              fullName: user.fullName || user.username || 'کاربر',
            });
          } catch (_) {}
        }
      }
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
          plan: user.plan || 'free',
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

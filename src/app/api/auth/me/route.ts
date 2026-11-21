import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      // Fallback: If no session, return default admin user for initial dev/preview experience
      const defaultUser = await prisma.user.findFirst({
        include: {
          workspaces: true,
        },
      });

      if (!defaultUser) {
        return NextResponse.json({ authenticated: false, user: null });
      }

      return NextResponse.json({
        authenticated: true,
        isGuestDemo: true,
        user: {
          id: defaultUser.id,
          fullName: defaultUser.fullName,
          phone: defaultUser.phone,
          role: defaultUser.role,
          plan: defaultUser.plan,
          avatarUrl: defaultUser.avatarUrl,
        },
        workspaces: defaultUser.workspaces,
      });
    }

    // Authenticated via valid session cookie
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        workspaces: true,
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      isGuestDemo: false,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        plan: user.plan,
        avatarUrl: user.avatarUrl,
      },
      workspaces: user.workspaces,
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ authenticated: false, error: 'خطایی در بررسی سشن رخ داد' }, { status: 500 });
  }
}

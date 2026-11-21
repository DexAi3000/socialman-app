import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
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
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ authenticated: false, error: 'خطایی در بررسی سشن رخ داد' }, { status: 500 });
  }
}

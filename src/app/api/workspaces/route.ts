import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/session';

// GET all workspaces for current user
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ success: true, workspaces: [] });
    }

    let workspaces = await prisma.workspace.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    });

    // Auto-create default personal workspace if user has none
    if (workspaces.length === 0) {
      const defaultWs = await prisma.workspace.create({
        data: {
          name: `فضای کاری ${user.fullName || 'اصلی'}`,
          category: 'کسب‌وکار',
          userId: user.id,
          connectedPlatforms: JSON.stringify(['telegram', 'instagram', 'whatsapp', 'bale', 'rubika']),
        },
      });
      workspaces = [defaultWs];
    }

    const formatted = workspaces.map((ws) => ({
      ...ws,
      connectedPlatforms:
        typeof ws.connectedPlatforms === 'string'
          ? JSON.parse(ws.connectedPlatforms || '[]')
          : ws.connectedPlatforms,
    }));

    return NextResponse.json({ success: true, workspaces: formatted });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ error: 'خطایی در دریافت فضاهای کاری رخ داد' }, { status: 500 });
  }
}

// POST create workspace
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    const body = await request.json();
    const { name, category, connectedPlatforms } = body;

    if (!name) {
      return NextResponse.json({ error: 'نام پیج کاری الزامی است' }, { status: 400 });
    }

    const ws = await prisma.workspace.create({
      data: {
        name,
        category: category || 'عمومی',
        userId: user ? user.id : undefined,
        connectedPlatforms: Array.isArray(connectedPlatforms)
          ? JSON.stringify(connectedPlatforms)
          : '[]',
      },
    });

    return NextResponse.json({
      success: true,
      workspace: {
        ...ws,
        connectedPlatforms:
          typeof ws.connectedPlatforms === 'string'
            ? JSON.parse(ws.connectedPlatforms || '[]')
            : ws.connectedPlatforms,
      },
    });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: 'خطایی در ثبت پیج کاری رخ داد' }, { status: 500 });
  }
}

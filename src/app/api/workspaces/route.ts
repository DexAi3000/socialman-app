import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all workspaces
export async function GET() {
  try {
    const workspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: 'asc' },
    });

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
    const body = await request.json();
    const { name, category, connectedPlatforms } = body;

    if (!name) {
      return NextResponse.json({ error: 'نام پیج کاری الزامی است' }, { status: 400 });
    }

    const ws = await prisma.workspace.create({
      data: {
        name,
        category: category || 'عمومی',
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

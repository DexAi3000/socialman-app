import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const query = searchParams.get('q');

    const userId = session?.userId;

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (platform && platform !== 'all') {
      where.platform = platform;
    }
    if (query && query.trim()) {
      where.OR = [
        { customerName: { contains: query.trim() } },
        { customerHandle: { contains: query.trim() } },
        { lastMessage: { contains: query.trim() } },
      ];
    }

    const directs = await prisma.customerDirect.findMany({
      where,
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      directs,
    });
  } catch (error: any) {
    console.error('Error fetching directs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

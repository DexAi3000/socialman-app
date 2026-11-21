import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET post by approval token
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'توکن نامعتبر است.' }, { status: 400 });
    }

    // Try finding by clientToken or by ID
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ clientToken: token }, { id: token }],
      },
      include: {
        workspace: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'پستی با این مشخصات یافت نشد یا منقضی شده است.' },
        { status: 404 }
      );
    }

    let hashtags: string[] = [];
    try {
      hashtags = JSON.parse(post.hashtags || '[]');
    } catch {
      hashtags = [];
    }

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        hashtags,
        platform: post.platform,
        status: post.status,
        mediaUrl: post.mediaUrl,
        scheduledDateShamsi: post.scheduledDateShamsi,
        scheduledTime: post.scheduledTime,
        clientFeedback: post.clientFeedback,
        workspaceName: post.workspace.name,
      },
    });
  } catch (error: any) {
    console.error('Approval fetch error:', error);
    return NextResponse.json({ error: 'خطایی رخ داد.' }, { status: 500 });
  }
}

// POST submit client approval or feedback
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, action, feedback } = body;

    if (!token || !action) {
      return NextResponse.json({ error: 'پارامترهای درخواست ناقص است.' }, { status: 400 });
    }

    const post = await prisma.post.findFirst({
      where: {
        OR: [{ clientToken: token }, { id: token }],
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'پست یافت نشد.' }, { status: 404 });
    }

    if (action === 'approve') {
      const updated = await prisma.post.update({
        where: { id: post.id },
        data: {
          status: 'approved',
          clientFeedback: null,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'با تشکر! محتوا با موفقیت تایید شد و راس زمان مقرر منتشر خواهد شد.',
        status: updated.status,
      });
    }

    if (action === 'reject') {
      const updated = await prisma.post.update({
        where: { id: post.id },
        data: {
          status: 'draft',
          clientFeedback: feedback || 'درخواست بازبینی توسط کارفرما',
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'اصلاحیه شما ثبت شد و به اطلاع ادمین محتوا خواهد رسید.',
        status: updated.status,
      });
    }

    return NextResponse.json({ error: 'عملیات نامعتبر است.' }, { status: 400 });
  } catch (error: any) {
    console.error('Approval action error:', error);
    return NextResponse.json({ error: 'خطایی رخ داد.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET approval info by token (handles both single Post token/id and Workspace portal token/id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'توکن نامعتبر است.' }, { status: 400 });
    }

    // 1. Try finding by Post clientToken or Post ID
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ clientToken: token }, { id: token }],
      },
      include: {
        workspace: true,
      },
    });

    if (post) {
      let hashtags: string[] = [];
      try {
        hashtags = JSON.parse(post.hashtags || '[]');
      } catch {
        hashtags = [];
      }

      return NextResponse.json({
        success: true,
        mode: 'post',
        post: {
          id: post.id,
          title: post.title,
          hook: post.hook,
          content: post.content,
          cta: post.cta,
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
    }

    // 2. Try finding as a Workspace Client Portal
    const workspace = await prisma.workspace.findUnique({
      where: { id: token },
      include: {
        posts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (workspace) {
      const formattedPosts = workspace.posts.map((p) => {
        let hashtags: string[] = [];
        try {
          hashtags = JSON.parse(p.hashtags || '[]');
        } catch {
          hashtags = [];
        }
        return {
          id: p.id,
          title: p.title,
          hook: p.hook,
          content: p.content,
          cta: p.cta,
          hashtags,
          platform: p.platform,
          status: p.status,
          mediaUrl: p.mediaUrl,
          scheduledDateShamsi: p.scheduledDateShamsi,
          scheduledTime: p.scheduledTime,
          clientFeedback: p.clientFeedback,
          workspaceName: workspace.name,
        };
      });

      return NextResponse.json({
        success: true,
        mode: 'workspace',
        workspace: {
          id: workspace.id,
          name: workspace.name,
          category: workspace.category,
        },
        posts: formattedPosts,
      });
    }

    return NextResponse.json(
      { error: 'پست یا پورتال کاری با این مشخصات یافت نشد یا منقضی شده است.' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Approval fetch error:', error);
    return NextResponse.json({ error: 'خطایی رخ داد.' }, { status: 500 });
  }
}

// POST submit client approval or feedback
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, postId, action, feedback } = body;

    const targetIdentifier = postId || token;
    if (!targetIdentifier || !action) {
      return NextResponse.json({ error: 'پارامترهای درخواست ناقص است.' }, { status: 400 });
    }

    const post = await prisma.post.findFirst({
      where: {
        OR: [{ clientToken: targetIdentifier }, { id: targetIdentifier }],
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

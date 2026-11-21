import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    const posts = await prisma.post.findMany({
      where: workspaceId ? { workspaceId } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON hashtags for frontend compatibility
    const formatted = posts.map((p) => ({
      ...p,
      hashtags: typeof p.hashtags === 'string' ? JSON.parse(p.hashtags || '[]') : p.hashtags,
    }));

    return NextResponse.json({ success: true, posts: formatted });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'خطایی در دریافت پست‌ها رخ داد' }, { status: 500 });
  }
}

// POST create new post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      workspaceId,
      title,
      hook,
      content,
      cta,
      hashtags,
      platform,
      status,
      scheduledDateShamsi,
      scheduledTime,
      mediaUrl,
    } = body;

    if (!workspaceId || !title || !content) {
      return NextResponse.json({ error: 'عنوان، متن و پیج کاری الزامی هستند' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        workspaceId,
        title,
        hook,
        content,
        cta,
        hashtags: Array.isArray(hashtags) ? JSON.stringify(hashtags) : '[]',
        platform: platform || 'instagram',
        status: status || 'draft',
        scheduledDateShamsi,
        scheduledTime,
        mediaUrl,
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        hashtags: typeof post.hashtags === 'string' ? JSON.parse(post.hashtags || '[]') : post.hashtags,
      },
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'خطایی در ثبت پست رخ داد' }, { status: 500 });
  }
}

// PUT update post
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'شناسه پست الزامی است' }, { status: 400 });
    }

    if (updates.hashtags && Array.isArray(updates.hashtags)) {
      updates.hashtags = JSON.stringify(updates.hashtags);
    }

    const post = await prisma.post.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        hashtags: typeof post.hashtags === 'string' ? JSON.parse(post.hashtags || '[]') : post.hashtags,
      },
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'خطایی در بروزرسانی پست رخ داد' }, { status: 500 });
  }
}

// DELETE post
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'شناسه پست الزامی است' }, { status: 400 });
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'پست با موفقیت حذف شد' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'خطایی در حذف پست رخ داد' }, { status: 500 });
  }
}

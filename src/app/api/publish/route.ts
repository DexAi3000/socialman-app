import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { dispatchMultiPlatformPublish } from '@/lib/publishers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      workspaceId,
      title,
      content,
      hook,
      cta,
      hashtags = [],
      platforms = ['instagram', 'telegram'],
      mediaUrl,
      isImmediate = true,
      scheduledDateShamsi,
      scheduledTime,
      accountsConfig,
    } = body;

    if (!content && !title) {
      return NextResponse.json(
        { error: 'عنوان یا متن پست الزامی است.' },
        { status: 400 }
      );
    }

    // 1. If immediate, run publisher engine for all chosen platforms
    let publishResults: any = null;
    if (isImmediate) {
      publishResults = await dispatchMultiPlatformPublish({
        platforms,
        title,
        content,
        hashtags,
        mediaUrl,
        accountsConfig,
      });
    }

    // 2. Persist post records in SQLite for each platform or grouped
    const createdPosts = await Promise.all(
      platforms.map(async (platform: string) => {
        return prisma.post.create({
          data: {
            workspaceId: workspaceId || 'ws-1',
            title: title || content.slice(0, 40) || 'پست جدید',
            hook: hook || null,
            content,
            cta: cta || null,
            hashtags: JSON.stringify(hashtags),
            platform,
            status: isImmediate ? 'published' : 'approved',
            scheduledDateShamsi: scheduledDateShamsi || 'امروز',
            scheduledTime: scheduledTime || 'هم‌اکنون',
            mediaUrl: mediaUrl || null,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: isImmediate
        ? 'پست با موفقیت در شبکه‌های اجتماعی منتشر شد 🚀'
        : 'پست با موفقیت در تقویم محتوایی زمان‌بندی شد 📅',
      posts: createdPosts,
      publishResults,
    });
  } catch (error: any) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { error: error.message || 'خطایی در انتشار پست رخ داد.' },
      { status: 500 }
    );
  }
}

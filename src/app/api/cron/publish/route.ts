import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { dispatchMultiPlatformPublish } from '@/lib/publishers';
import { getTodayShamsi } from '@/lib/utils';

export async function GET(request: Request) {
  return handleCronPublish(request);
}

export async function POST(request: Request) {
  return handleCronPublish(request);
}

async function handleCronPublish(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    // 1. Find all approved posts waiting to be published
    const pendingPosts = await prisma.post.findMany({
      where: {
        status: {
          in: ['approved', 'scheduled'],
        },
      },
      include: {
        workspace: true,
      },
    });

    if (pendingPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'هیچ پست تاییدشده‌ای در صف انتظار انتشار وجود ندارد.',
        processedCount: 0,
      });
    }

    const todayShamsi = getTodayShamsi();
    const publishedList = [];

    for (const post of pendingPosts) {
      // Check if scheduled date matches today or if force flag is present
      const isDue =
        force ||
        !post.scheduledDateShamsi ||
        post.scheduledDateShamsi === 'امروز' ||
        post.scheduledDateShamsi.includes(todayShamsi);

      if (isDue) {
        let hashtagsArray: string[] = [];
        try {
          hashtagsArray = JSON.parse(post.hashtags || '[]');
        } catch {
          hashtagsArray = [];
        }

        // Publish to the post's platform
        const publishResult = await dispatchMultiPlatformPublish({
          platforms: [post.platform],
          title: post.title,
          content: post.content,
          hashtags: hashtagsArray,
          mediaUrl: post.mediaUrl,
        });

        // Update post in DB to 'published'
        const updated = await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'published',
            updatedAt: new Date(),
          },
        });

        publishedList.push({
          id: updated.id,
          title: updated.title,
          platform: updated.platform,
          publishResult,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${publishedList.length} پست با موفقیت توسط ربات زمان‌بندی منتشر شدند 🚀`,
      processedCount: publishedList.length,
      published: publishedList,
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Cron publish error:', error);
    return NextResponse.json(
      { error: error.message || 'خطا در اجرای کران‌جاب انتشار خودکار' },
      { status: 500 }
    );
  }
}

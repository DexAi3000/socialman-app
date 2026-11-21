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

    // 2. Persist post records in SQLite for each platform
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

    // 3. Inspect publish results for errors
    const failedPlatforms: string[] = [];
    if (isImmediate && publishResults) {
      for (const p of platforms) {
        const res = publishResults[p];
        if (res && res.success === false) {
          failedPlatforms.push(`${p}: ${res.error || 'خطای ناشناخته'}`);
        }
      }
    }

    const allFailed = platforms.length > 0 && failedPlatforms.length === platforms.length;
    const someFailed = failedPlatforms.length > 0;

    if (allFailed) {
      return NextResponse.json(
        {
          success: false,
          error: `خطا در انتشار: ${failedPlatforms.join(' | ')}`,
          publishResults,
          posts: createdPosts,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: someFailed
        ? `پست منتشر شد، اما در برخی پلتفرم‌ها با خطا مواجه شد: ${failedPlatforms.join(' | ')}`
        : isImmediate
        ? 'پست با موفقیت در شبکه‌های اجتماعی منتشر شد 🚀'
        : 'پست با موفقیت در تقویم محتوایی زمان‌بندی شد 📅',
      posts: createdPosts,
      publishResults,
      hasFailures: someFailed,
      failedPlatforms,
    });
  } catch (error: any) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { error: error.message || 'خطایی در انتشار پست رخ داد.' },
      { status: 500 }
    );
  }
}

import prisma from '../src/lib/prisma';
import { dispatchMultiPlatformPublish } from '../src/lib/publishers';

console.log('⏰ Social Man Scheduler Worker started. Checking queue every 60 seconds...');

async function runScheduler() {
  try {
    const pendingPosts = await prisma.post.findMany({
      where: {
        status: { in: ['approved', 'scheduled'] },
      },
    });

    if (pendingPosts.length > 0) {
      console.log(`[${new Date().toLocaleTimeString('fa-IR')}] Found ${pendingPosts.length} posts due for publishing.`);
      for (const post of pendingPosts) {
        let hashtags: string[] = [];
        try {
          hashtags = JSON.parse(post.hashtags || '[]');
        } catch {}

        await dispatchMultiPlatformPublish({
          platforms: [post.platform],
          title: post.title,
          content: post.content,
          hashtags,
          mediaUrl: post.mediaUrl,
        });

        await prisma.post.update({
          where: { id: post.id },
          data: { status: 'published', updatedAt: new Date() },
        });

        console.log(`✅ Auto-published post: "${post.title}" on ${post.platform}`);
      }
    }
  } catch (err) {
    console.error('Scheduler tick error:', err);
  }
}

// Initial run
runScheduler();

// Run every 60 seconds
setInterval(runScheduler, 60 * 1000);

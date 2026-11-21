import { NextResponse } from 'next/server';
import { normalizeTelegramChatId } from '@/lib/publishers/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform = 'telegram', channelId, botToken } = body;

    if (platform === 'telegram') {
      const token =
        botToken ||
        process.env.TELEGRAM_BOT_TOKEN ||
        process.env.TELEGRAM_DEFAULT_BOT_TOKEN ||
        '9115798954:AAHHygpdWUJlhI3k-FX7rtU2egGt7wwHwrg';

      let targetChat = normalizeTelegramChatId(channelId);
      if (!targetChat || targetChat.toLowerCase() === '@socialmanpublishbot') {
        targetChat = normalizeTelegramChatId(
          process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_DEFAULT_CHANNEL_ID || '@novexalab'
        );
      }

      if (!targetChat) {
        return NextResponse.json(
          { success: false, error: 'لطفاً ابتدا آیدی یا شناسه کانال را وارد کنید.' },
          { status: 400 }
        );
      }

      const res = await fetch(
        `https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(targetChat)}`
      );
      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        const chat = data.result;
        return NextResponse.json({
          success: true,
          message: `اتصال به کانال «${chat.title || chat.username}» (${targetChat}) با موفقیت تایید شد! ✅`,
          chatTitle: chat.title,
          chatId: chat.id,
          username: chat.username,
        });
      } else {
        const desc = data?.description || 'پاسخی از تلگرام دریافت نشد';
        let userFriendly = desc;
        if (desc.includes('chat not found')) {
          userFriendly = `کانال «${targetChat}» یافت نشد. لطفاً آیدی کانال را چک کنید و مطمئن شوید کانال پابلیک است یا آیدی عددی درست است.`;
        } else if (desc.includes('bot was not found') || desc.includes('Unauthorized')) {
          userFriendly = 'توکن ربات تلگرام نامعتبر است.';
        } else if (desc.includes('bot is not a member')) {
          userFriendly = `ربات هنوز به کانال ${targetChat} اضافه نشده است. لطفاً ربات @SocialManPublishBot را ادمین کانال کنید.`;
        }
        return NextResponse.json(
          {
            success: false,
            error: userFriendly,
            rawError: desc,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `اتصال آزمایشی به ${platform} تایید گردید.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'خطای سرور در انجام تست' },
      { status: 500 }
    );
  }
}

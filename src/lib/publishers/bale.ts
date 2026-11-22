import { PublishResult } from './telegram';

export interface BalePublishOptions {
  botToken?: string;
  channelId?: string;
  text: string;
  mediaUrl?: string | null;
}

export function normalizeBaleChatId(input?: string): string {
  if (!input) return '';
  let cleaned = input.trim();
  cleaned = cleaned.replace(/^https?:\/\/ble\.ir\//i, '');
  cleaned = cleaned.replace(/^ble\.ir\//i, '');
  cleaned = cleaned.replace(/\/+$/, '');
  cleaned = cleaned.split('?')[0].split('#')[0].trim();
  if (!cleaned) return '';
  if (/^-?\d+$/.test(cleaned) || cleaned.startsWith('@')) {
    return cleaned;
  }
  return `@${cleaned}`;
}

export async function publishToBale(options: BalePublishOptions): Promise<PublishResult> {
  const { botToken: customToken, channelId: rawChannelId, text, mediaUrl } = options;
  const now = new Date().toISOString();

  const botToken =
    customToken ||
    process.env.BALE_BOT_TOKEN ||
    process.env.BALE_DEFAULT_BOT_TOKEN;

  const channelId = normalizeBaleChatId(rawChannelId);

  if (!botToken || !channelId) {
    return {
      platform: 'bale',
      success: false,
      error: 'توکن یا شناسه کانال بله تنظیم نشده است. لطفاً در بخش تنظیم و اتصال اکانت‌ها، توکن بازوی بله و شناسه کانال را ثبت کنید.',
      timestamp: now,
      mode: 'live',
    };
  }

  try {
    // 1. If mediaUrl is provided (supports direct HTTPS URL)
    if (mediaUrl && mediaUrl.trim()) {
      const trimmedMedia = mediaUrl.trim();
      if (trimmedMedia.startsWith('http://') || trimmedMedia.startsWith('https://')) {
        const res = await fetch(`https://tapi.bale.ai/bot${botToken}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: channelId,
            photo: trimmedMedia,
            caption: text || '',
          }),
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data?.ok) {
          return {
            platform: 'bale',
            success: true,
            messageId: data.result?.message_id,
            timestamp: now,
            mode: 'live',
          };
        } else if (res.status === 401 || data?.description === 'Unauthorized') {
          return {
            platform: 'bale',
            success: false,
            error: 'توکن بازوی بله نامعتبر یا منقضی است (Unauthorized). لطفاً توکن دریافتی از @BotFather در بله را در بخش تنظیم اکانت‌ها وارد کنید.',
            timestamp: now,
            mode: 'live',
            details: data,
          };
        }
      }
    }

    // 2. Text message
    const res = await fetch(`https://tapi.bale.ai/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text,
      }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.ok) {
      return {
        platform: 'bale',
        success: true,
        messageId: data.result?.message_id,
        timestamp: now,
        mode: 'live',
      };
    } else {
      let errMsg = data?.description || 'خطا در وب‌سرویس پیام‌رسان بله';
      if (res.status === 401 || errMsg === 'Unauthorized') {
        errMsg = 'توکن بازوی بله نامعتبر یا منقضی است (Unauthorized). لطفاً در بخش تنظیم و اتصال اکانت‌ها، توکن جدید دریافت شده از @BotFather در بله را وارد فرمایید.';
      } else if (errMsg.includes('chat not found')) {
        errMsg = `کانال «${channelId}» یافت نشد. لطفاً مطمئن شوید بازو در کانال بله عضو و مدیر است.`;
      }
      return {
        platform: 'bale',
        success: false,
        error: errMsg,
        timestamp: now,
        mode: 'live',
        details: data,
      };
    }
  } catch (err: any) {
    return {
      platform: 'bale',
      success: false,
      error: err.message || 'خطای شبکه در اتصال به بله',
      timestamp: now,
      mode: 'live',
    };
  }
}

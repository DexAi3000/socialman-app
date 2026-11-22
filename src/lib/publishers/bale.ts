import { PublishResult } from './telegram';
import fs from 'fs';
import path from 'path';

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

  let botToken =
    customToken ||
    process.env.BALE_BOT_TOKEN ||
    process.env.BALE_DEFAULT_BOT_TOKEN ||
    '369114062:1NMlMxXeD9k-I4oEI7YcXvyVmYqIJ3h9LnI';

  // Auto-heal old revoked token
  if (botToken.includes('R7BeEnjLaDSiFv26')) {
    botToken = '369114062:1NMlMxXeD9k-I4oEI7YcXvyVmYqIJ3h9LnI';
  }

  let channelId = normalizeBaleChatId(rawChannelId) || process.env.BALE_CHANNEL_ID || '5640247674';

  if (!botToken) {
    return {
      platform: 'bale',
      success: false,
      error: 'توکن بازوی بله تنظیم نشده است. لطفاً در بخش تنظیم و اتصال اکانت‌ها، توکن بازوی بله را ثبت کنید.',
      timestamp: now,
      mode: 'live',
    };
  }

  try {
    // 1. If mediaUrl is provided, upload image via multipart/form-data
    if (mediaUrl && mediaUrl.trim()) {
      let imageBuffer: Buffer | null = null;
      let mimeType = 'image/jpeg';
      let filename = 'photo.jpg';

      try {
        if (mediaUrl.startsWith('data:image/')) {
          const match = mediaUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            mimeType = match[1] || 'image/jpeg';
            imageBuffer = Buffer.from(match[2], 'base64');
            const ext = mimeType.split('/')[1] || 'jpg';
            filename = `photo.${ext === 'jpeg' ? 'jpg' : ext}`;
          }
        } else if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
          // Check if it's stored locally in /public/uploads/
          const urlObj = new URL(mediaUrl);
          const pathname = urlObj.pathname;
          if (pathname.startsWith('/uploads/')) {
            const localFile = path.join(process.cwd(), 'public', pathname);
            if (fs.existsSync(localFile)) {
              imageBuffer = fs.readFileSync(localFile);
              filename = path.basename(localFile);
              const ext = path.extname(filename).toLowerCase().replace('.', '');
              mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
            }
          }

          // If not read locally, fetch directly
          if (!imageBuffer) {
            const imgRes = await fetch(mediaUrl, { signal: AbortSignal.timeout(10000) });
            if (imgRes.ok) {
              const arrayBuf = await imgRes.arrayBuffer();
              imageBuffer = Buffer.from(arrayBuf);
              mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
              filename = 'photo.jpg';
            }
          }
        }
      } catch (mediaErr) {
        console.warn('Failed to prepare media buffer for Bale, falling back to text:', mediaErr);
      }

      // If buffer successfully retrieved, send via FormData
      if (imageBuffer && imageBuffer.length > 0) {
        try {
          const formData = new FormData();
          formData.append('chat_id', channelId);
          if (text) {
            formData.append('caption', text);
          }
          const blob = new Blob([new Uint8Array(imageBuffer)], { type: mimeType });
          formData.append('photo', blob, filename);

          const res = await fetch(`https://tapi.bale.ai/bot${botToken}/sendPhoto`, {
            method: 'POST',
            body: formData,
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
              error: 'توکن بازوی بله نامعتبر یا منقضی است (Unauthorized).',
              timestamp: now,
              mode: 'live',
              details: data,
            };
          } else {
            console.warn('Bale sendPhoto returned error, falling back to sendMessage:', data);
          }
        } catch (photoErr) {
          console.warn('Error during Bale sendPhoto multipart, falling back to sendMessage:', photoErr);
        }
      }
    }

    // 2. Text message fallback or standard publish
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
        errMsg = 'توکن بازوی بله نامعتبر یا منقضی است (Unauthorized). لطفاً توکن جدید را بررسی فرمایید.';
      } else if (errMsg.includes('chat not found')) {
        errMsg = `کانال یا چت «${channelId}» در بله یافت نشد. لطفاً مطمئن شوید بازو در کانال بله عضو و مدیر است.`;
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

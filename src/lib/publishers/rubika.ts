import { PublishResult } from './telegram';
import fs from 'fs';
import path from 'path';

export interface RubikaPublishOptions {
  botToken?: string;
  channelId?: string;
  text: string;
  mediaUrl?: string | null;
}

export function cleanRubikaText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '$1')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '$1')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '$1')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '$1')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '') // remove any other remaining HTML tags
    .trim();
}

export async function publishToRubika(options: RubikaPublishOptions): Promise<PublishResult> {
  const { botToken: customToken, channelId: rawChannelId, text, mediaUrl } = options;
  const now = new Date().toISOString();

  const botToken =
    customToken ||
    process.env.RUBIKA_BOT_TOKEN ||
    process.env.RUBIKA_DEFAULT_AUTH ||
    'CJIJEG0ICJPDQSHEUWTHRWIDFFITRQUHWBZFEAQAYUJHCUZUGSYBGUQXCUZHERIR';

  let targetChat = rawChannelId?.trim();

  // If targetChat is empty, default handle or starts with @, auto-detect latest chat_id from getUpdates
  if (
    !targetChat ||
    targetChat === '@SocialManPublishBot' ||
    targetChat === '@novexalab' ||
    targetChat.startsWith('@') ||
    targetChat.includes('rubika.ir')
  ) {
    try {
      const updatesRes = await fetch(`https://botapi.rubika.ir/v3/${botToken}/getUpdates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const updatesData = await updatesRes.json().catch(() => null);
      if (updatesData?.status === 'OK' && Array.isArray(updatesData.data?.updates)) {
        const events = updatesData.data.updates;
        // Search newest update that has chat_id, prioritizing Admin channels
        for (let i = events.length - 1; i >= 0; i--) {
          const u = events[i];
          if (u.chat_id) {
            targetChat = u.chat_id;
            if (u.event_data?.join_type === 'Admin' || u.chat_id.startsWith('c0')) {
              break;
            }
          }
        }
      }
    } catch (e) {
      console.warn('[Rubika] Auto-discovery error:', e);
    }
  }

  if (!targetChat) {
    targetChat = 'c0EKYNi0643febe9636561e59f26cbad'; // fallback to user verified channel
  }

  const cleanText = cleanRubikaText(text);

  if (botToken && targetChat) {
    try {
      // 1. If mediaUrl is provided, upload image to Rubika and send via sendFile
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
            // Check if stored locally in /public/uploads/
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
          console.warn('[Rubika] Failed to prepare media buffer:', mediaErr);
        }

        // If buffer obtained, upload to Rubika
        if (imageBuffer && imageBuffer.length > 0) {
          try {
            // Step A: requestSendFile
            const reqRes = await fetch(`https://botapi.rubika.ir/v3/${botToken}/requestSendFile`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type: 'Image' }),
            });
            const reqData = await reqRes.json().catch(() => null);

            if (reqData?.status === 'OK' && reqData.data?.upload_url) {
              const uploadUrl = reqData.data.upload_url;

              // Step B: Upload file via FormData
              const formData = new FormData();
              const blob = new Blob([new Uint8Array(imageBuffer)], { type: mimeType });
              formData.append('file', blob, filename);

              const upRes = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
              });
              const upData = await upRes.json().catch(() => null);

              if (upData?.status === 'OK' && upData.data?.file_id) {
                const fileId = upData.data.file_id;

                // Step C: sendFile
                const sendRes = await fetch(`https://botapi.rubika.ir/v3/${botToken}/sendFile`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: targetChat,
                    file_id: fileId,
                    text: cleanText,
                  }),
                });
                const sendData = await sendRes.json().catch(() => null);

                if (sendRes.ok && sendData?.status === 'OK') {
                  return {
                    platform: 'rubika',
                    success: true,
                    messageId: sendData.data?.message_id || `rubika-${Date.now()}`,
                    timestamp: now,
                    mode: 'live',
                  };
                } else {
                  console.warn('[Rubika] sendFile error, falling back to sendMessage:', sendData);
                }
              }
            }
          } catch (uploadErr) {
            console.warn('[Rubika] Upload error, falling back to text:', uploadErr);
          }
        }
      }

      // 2. Pure text message fallback
      const res = await fetch(`https://botapi.rubika.ir/v3/${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChat,
          text: cleanText,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.status === 'OK') {
        return {
          platform: 'rubika',
          success: true,
          messageId: data.data?.message_id || `rubika-${Date.now()}`,
          timestamp: now,
          mode: 'live',
        };
      } else {
        let errDesc = data?.dev_message || data?.status || 'خطا در وب‌سرویس روبیکا';
        if (data?.status === 'INVALID_ACCESS') {
          errDesc = 'ربات در روبیکا به عنوان مدیر (Admin) در کانال عضو نشده است. لطفاً ربات @SocialManPublishBot را در کانال ادمین با دسترسی ارسال پیام کنید.';
        }
        return {
          platform: 'rubika',
          success: false,
          error: errDesc,
          timestamp: now,
          mode: 'live',
          details: data,
        };
      }
    } catch (err: any) {
      return {
        platform: 'rubika',
        success: false,
        error: err.message || 'خطای شبکه در اتصال به روبیکا',
        timestamp: now,
        mode: 'live',
      };
    }
  }

  return {
    platform: 'rubika',
    success: false,
    error: 'شناسه چت یا توکن روبیکا مشخص نشده است.',
    timestamp: now,
    mode: 'live',
  };
}

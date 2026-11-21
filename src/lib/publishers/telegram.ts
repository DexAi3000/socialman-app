export interface TelegramPublishOptions {
  botToken?: string;
  channelId?: string;
  text: string;
  mediaUrl?: string | null;
}

export interface PublishResult {
  platform: string;
  success: boolean;
  messageId?: string | number;
  error?: string;
  timestamp: string;
  mode: 'live' | 'simulation';
  details?: any;
}

import { normalizeTelegramChatId, getTelegramApiBase } from '../telegram-utils';
export { normalizeTelegramChatId, getTelegramApiBase };

async function resolvePhotoUrl(mediaInput: string): Promise<string | null> {
  const trimmed = mediaInput.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('data:')) {
    const match = trimmed.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    let ext = mimeType.split('/')[1] || 'jpg';
    if (ext.includes('+')) ext = ext.split('+')[0];
    if (ext === 'jpeg') ext = 'jpg';

    try {
      const fs = await import('fs');
      const path = await import('path');
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      const uploadsBase =
        process.env.PUBLIC_UPLOADS_URL ||
        'https://nimaariyanfar.com/uploads';
      return `${uploadsBase.replace(/\/+$/, '')}/${filename}`;
    } catch (e) {
      console.warn('[Telegram] Could not save photo to disk, will use fallback:', e);
      return null;
    }
  }
  return null;
}

export async function publishToTelegram(options: TelegramPublishOptions): Promise<PublishResult> {
  const { botToken, channelId: rawChannelId, text, mediaUrl } = options;
  const now = new Date().toISOString();

  let targetChat = normalizeTelegramChatId(rawChannelId);
  // Fail-safe: if targetChat is empty or is the bot itself, fallback to environment default
  if (!targetChat || targetChat.toLowerCase() === '@socialmanpublishbot') {
    targetChat = normalizeTelegramChatId(
      process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_DEFAULT_CHANNEL_ID || '@novexalab'
    );
  }

  // If user provided a real bot token and channel ID, execute real live API call
  if (botToken && targetChat) {
    const apiBase = getTelegramApiBase();

    try {
      // 1. If mediaUrl is provided
      if (mediaUrl && mediaUrl.trim()) {
        const photoUrl = await resolvePhotoUrl(mediaUrl);

        if (photoUrl) {
          // Send photo via JSON payload (100% reliable through Cloudflare worker relay & DPI bypass)
          let caption = text || '';
          let overflowText = '';
          if (caption.length > 1024) {
            overflowText = caption;
            caption = caption.substring(0, 1020) + '...';
          }

          let res = await fetch(`${apiBase}/bot${botToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: targetChat,
              photo: photoUrl,
              caption: caption,
              parse_mode: 'HTML',
            }),
          });

          let data = await res.json().catch(() => null);

          // If entity parse error, retry with clean stripped caption
          if (!res.ok && data?.description?.includes("can't parse entities")) {
            res = await fetch(`${apiBase}/bot${botToken}/sendPhoto`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: targetChat,
                photo: photoUrl,
                caption: caption.replace(/<[^>]*>/g, ''),
              }),
            });
            data = await res.json().catch(() => null);
          }

          if (res.ok && data?.ok) {
            if (overflowText) {
              await fetch(`${apiBase}/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: targetChat,
                  text: overflowText,
                  parse_mode: 'HTML',
                }),
              }).catch(() => null);
            }

            return {
              platform: 'telegram',
              success: true,
              messageId: data.result?.message_id,
              timestamp: now,
              mode: 'live',
            };
          } else {
            return {
              platform: 'telegram',
              success: false,
              error: data?.description || 'خطا در ارسال تصویر به تلگرام',
              timestamp: now,
              mode: 'live',
              details: data,
            };
          }
        }

        // Fallback for non-saved base64
        const trimmedMedia = mediaUrl.trim();
        if (trimmedMedia.startsWith('data:')) {
          const match = trimmedMedia.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            const mimeType = match[1];
            const base64Data = match[2];
            const buffer = Buffer.from(base64Data, 'base64');
            const ext = mimeType.split('/')[1] || 'jpg';
            const blob = new Blob([buffer], { type: mimeType });

            const formData = new FormData();
            formData.append('chat_id', targetChat);
            formData.append('photo', blob, `upload.${ext}`);
            if (text) {
              formData.append('caption', text);
              formData.append('parse_mode', 'HTML');
            }

            let res = await fetch(`${apiBase}/bot${botToken}/sendPhoto`, {
              method: 'POST',
              body: formData,
            });

            let data = await res.json().catch(() => null);

            if (!res.ok && data?.description?.includes("can't parse entities")) {
              const retryForm = new FormData();
              retryForm.append('chat_id', targetChat);
              retryForm.append('photo', blob, `upload.${ext}`);
              if (text) {
                retryForm.append('caption', text.replace(/<[^>]*>/g, ''));
              }
              res = await fetch(`${apiBase}/bot${botToken}/sendPhoto`, {
                method: 'POST',
                body: retryForm,
              });
              data = await res.json().catch(() => null);
            }

            if (res.ok && data?.ok) {
              return {
                platform: 'telegram',
                success: true,
                messageId: data.result?.message_id,
                timestamp: now,
                mode: 'live',
              };
            } else {
              return {
                platform: 'telegram',
                success: false,
                error: data?.description || 'خطا در ارسال تصویر به تلگرام',
                timestamp: now,
                mode: 'live',
                details: data,
              };
            }
          }
        }
      }

      // 2. Pure text message (when no mediaUrl or as text-first dispatch)
      let res = await fetch(`${apiBase}/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChat,
          text,
          parse_mode: 'HTML',
        }),
      });

      let data = await res.json().catch(() => null);

      if (!res.ok && data?.description?.includes("can't parse entities")) {
        res = await fetch(`${apiBase}/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChat,
            text: text.replace(/<[^>]*>/g, ''),
          }),
        });
        data = await res.json().catch(() => null);
      }

      if (res.ok && data?.ok) {
        return {
          platform: 'telegram',
          success: true,
          messageId: data.result?.message_id,
          timestamp: now,
          mode: 'live',
        };
      } else {
        return {
          platform: 'telegram',
          success: false,
          error: data?.description || 'خطا در ارتباط با سرور تلگرام',
          timestamp: now,
          mode: 'live',
          details: data,
        };
      }
    } catch (err: any) {
      return {
        platform: 'telegram',
        success: false,
        error: err.message || 'خطای شبکه در اتصال به تلگرام',
        timestamp: now,
        mode: 'live',
      };
    }
  }

  // Simulation mode when token is not yet configured (sandbox preview)
  return {
    platform: 'telegram',
    success: true,
    messageId: `tg-sim-${Date.now()}`,
    timestamp: now,
    mode: 'simulation',
  };
}

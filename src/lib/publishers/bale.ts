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
  const { botToken, channelId: rawChannelId, text, mediaUrl } = options;
  const now = new Date().toISOString();

  const channelId = normalizeBaleChatId(rawChannelId);

  if (botToken && channelId) {
    try {
      // 1. If mediaUrl is base64
      if (mediaUrl && mediaUrl.trim()) {
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
            formData.append('chat_id', channelId);
            formData.append('photo', blob, `upload.${ext}`);
            if (text) formData.append('caption', text);

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
            }
          }
        } else if (trimmedMedia.startsWith('http://') || trimmedMedia.startsWith('https://')) {
          const res = await fetch(`https://tapi.bale.ai/bot${botToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: channelId,
              photo: trimmedMedia,
              caption: text,
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
          }
        }
      }

      // Text message
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
        return {
          platform: 'bale',
          success: false,
          error: data?.description || 'خطا در وب‌سرویس پیام‌رسان بله',
          timestamp: now,
          mode: 'live',
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

  // Simulation mode
  return {
    platform: 'bale',
    success: true,
    messageId: `bale-sim-${Date.now()}`,
    timestamp: now,
    mode: 'simulation',
  };
}

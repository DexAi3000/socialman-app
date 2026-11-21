import { PublishResult } from './telegram';

export interface BalePublishOptions {
  botToken?: string;
  channelId?: string;
  text: string;
  mediaUrl?: string | null;
}

export async function publishToBale(options: BalePublishOptions): Promise<PublishResult> {
  const { botToken, channelId, text, mediaUrl } = options;
  const now = new Date().toISOString();

  if (botToken && channelId) {
    try {
      const endpoint = mediaUrl
        ? `https://tapi.bale.ai/bot${botToken}/sendPhoto`
        : `https://tapi.bale.ai/bot${botToken}/sendMessage`;

      const body = mediaUrl
        ? {
            chat_id: channelId,
            photo: mediaUrl,
            caption: text,
          }
        : {
            chat_id: channelId,
            text,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

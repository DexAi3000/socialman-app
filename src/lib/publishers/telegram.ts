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
}

export async function publishToTelegram(options: TelegramPublishOptions): Promise<PublishResult> {
  const { botToken, channelId, text, mediaUrl } = options;
  const now = new Date().toISOString();

  // If user provided a real bot token and channel ID, execute real live API call
  if (botToken && channelId) {
    try {
      const endpoint = mediaUrl
        ? `https://api.telegram.org/bot${botToken}/sendPhoto`
        : `https://api.telegram.org/bot${botToken}/sendMessage`;

      const body = mediaUrl
        ? {
            chat_id: channelId,
            photo: mediaUrl,
            caption: text,
            parse_mode: 'HTML',
          }
        : {
            chat_id: channelId,
            text,
            parse_mode: 'HTML',
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

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

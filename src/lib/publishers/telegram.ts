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

export function normalizeTelegramChatId(input?: string): string {
  if (!input) return '';
  let cleaned = input.trim();
  // Strip url schemes and domains: https://t.me/, http://t.me/, tg://resolve?domain=, t.me/
  cleaned = cleaned.replace(/^https?:\/\/t\.me\//i, '');
  cleaned = cleaned.replace(/^t\.me\//i, '');
  cleaned = cleaned.replace(/^tg:\/\/resolve\?domain=/i, '');
  cleaned = cleaned.replace(/\/+$/, ''); // trailing slashes
  // Strip query parameters or hashes
  cleaned = cleaned.split('?')[0].split('#')[0].trim();

  if (!cleaned) return '';
  // If it's a numeric ID (e.g. -1004202498347 or 12345678), return as-is
  if (/^-?\d+$/.test(cleaned)) {
    return cleaned;
  }
  // If it already starts with @, return as-is
  if (cleaned.startsWith('@')) {
    return cleaned;
  }
  // Otherwise prepend @
  return `@${cleaned}`;
}

export function getTelegramApiBase(): string {
  const base =
    process.env.TELEGRAM_API_BASE_URL ||
    'https://novexa-bot.dnanima895.workers.dev/tg-relay';
  return base.replace(/\/+$/, '');
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
        const trimmedMedia = mediaUrl.trim();

        // Check if it's a base64 Data URL (e.g. data:image/jpeg;base64,...)
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

            // If HTML entity parsing fails, retry with clean plain text caption
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

        // Standard HTTP/HTTPS URL
        if (trimmedMedia.startsWith('http://') || trimmedMedia.startsWith('https://')) {
          let res = await fetch(`${apiBase}/bot${botToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: targetChat,
              photo: trimmedMedia,
              caption: text,
              parse_mode: 'HTML',
            }),
          });

          let data = await res.json().catch(() => null);

          if (!res.ok && data?.description?.includes("can't parse entities")) {
            res = await fetch(`${apiBase}/bot${botToken}/sendPhoto`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: targetChat,
                photo: trimmedMedia,
                caption: text.replace(/<[^>]*>/g, ''),
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
              error: data?.description || 'خطا در ارسال تصویر به تلگرام',
              timestamp: now,
              mode: 'live',
              details: data,
            };
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

import { PublishResult } from './telegram';

export interface RubikaPublishOptions {
  botToken?: string;
  channelId?: string;
  text: string;
  mediaUrl?: string | null;
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

  // If targetChat is empty, default or starts with @, auto-detect latest chat_id from getUpdates
  if (!targetChat || targetChat === '@SocialManPublishBot' || targetChat === '@novexalab' || targetChat.startsWith('@') || targetChat.includes('rubika.ir')) {
    try {
      const updatesRes = await fetch(`https://botapi.rubika.ir/v3/${botToken}/getUpdates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const updatesData = await updatesRes.json().catch(() => null);
      if (updatesData?.status === 'OK' && Array.isArray(updatesData.data?.updates)) {
        const events = updatesData.data.updates;
        // Search newest update that has chat_id
        for (let i = events.length - 1; i >= 0; i--) {
          const u = events[i];
          if (u.chat_id) {
            targetChat = u.chat_id;
            break;
          }
        }
      }
    } catch (e) {
      console.warn('[Rubika] Auto-discovery error:', e);
    }
  }

  if (botToken && targetChat) {
    try {
      let messageText = text || '';
      // If there is a public image URL, append it to caption
      if (mediaUrl && !mediaUrl.startsWith('data:')) {
        messageText = `${messageText}\n\n${mediaUrl}`;
      }

      const res = await fetch(`https://botapi.rubika.ir/v3/${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChat,
          text: messageText,
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

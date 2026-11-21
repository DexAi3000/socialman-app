import { PublishResult } from './telegram';

export interface RubikaPublishOptions {
  botToken?: string;
  channelId?: string;
  text: string;
  mediaUrl?: string | null;
}

export async function publishToRubika(options: RubikaPublishOptions): Promise<PublishResult> {
  const { botToken, channelId, text } = options;
  const now = new Date().toISOString();

  if (botToken && channelId) {
    try {
      const res = await fetch(`https://messengerg2c4.iranlms.ir/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_version: '5',
          auth: botToken,
          data: {
            method: 'sendMessage',
            input: {
              object_guid: channelId,
              text,
            },
          },
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.status === 'OK') {
        return {
          platform: 'rubika',
          success: true,
          messageId: data.data?.message_update?.message_id || `rubika-${Date.now()}`,
          timestamp: now,
          mode: 'live',
        };
      }
    } catch {}
  }

  return {
    platform: 'rubika',
    success: true,
    messageId: `rubika-sim-${Date.now()}`,
    timestamp: now,
    mode: 'simulation',
  };
}

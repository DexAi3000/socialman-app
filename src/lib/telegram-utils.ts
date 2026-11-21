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

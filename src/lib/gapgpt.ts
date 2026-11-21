export const GAPGPT_API_KEY =
  process.env.GAPGPT_API_KEY || 'sk-akooz8nPVHXug7DVvskSoLBAYNVLiYqpg3dUFlOWSrxtJOmF';

export const GAPGPT_BASE_URL =
  process.env.GAPGPT_BASE_URL || 'https://api.gapgpt.app/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Returns model based on plan:
 * - free: gpt-4o-mini (fast, cost-effective)
 * - pro: gpt-4o-mini (high token limit)
 * - agency: gpt-4o (highest quality & depth)
 */
export function getModelForPlan(plan: string = 'free'): string {
  if (plan === 'agency') {
    return 'gpt-4o';
  }
  if (plan === 'pro') {
    return 'gpt-4o-mini';
  }
  return 'gpt-4o-mini';
}

/**
 * Calls GapGPT Chat Completions API
 */
export async function callGapGpt(params: {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  response_format?: { type: 'json_object' | 'text' };
  max_tokens?: number;
}) {
  const url = `${GAPGPT_BASE_URL.replace(/\/+$/, '')}/chat/completions`;

  const payload: any = {
    model: params.model || 'gpt-4o-mini',
    messages: params.messages,
    temperature: params.temperature ?? 0.7,
  };

  if (params.response_format) {
    payload.response_format = params.response_format;
  }
  if (params.max_tokens) {
    payload.max_tokens = params.max_tokens;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GAPGPT_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GapGPT error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

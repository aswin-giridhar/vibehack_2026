import { env } from './env';

export async function callGLM4(prompt: string, systemPrompt?: string): Promise<string> {
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.glmApiKey}`,
    },
    body: JSON.stringify({
      model: 'glm-4',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`GLM-4 error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

export async function callGLMImage(prompt: string): Promise<string> {
  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.glmImageApiKey}`,
    },
    body: JSON.stringify({
      model: 'cogview-3-plus',
      prompt,
      size: '1024x1024',
    }),
  });

  if (!response.ok) throw new Error(`GLM-Image error: ${response.status}`);
  const data = await response.json();
  return data.data[0].url;
}

export async function callClaude(prompt: string, systemPrompt?: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.anthropicApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      ...(systemPrompt ? { system: systemPrompt } : {}),
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Claude error: ${response.status}`);
  const data = await response.json();
  return data.content[0].text;
}

export function parseAIJson<T>(raw: string): T {
  try { return JSON.parse(raw); } catch {}
  const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) try { return JSON.parse(match[1]); } catch {}
  const start = raw.indexOf(raw.includes('[') ? '[' : '{');
  const end = raw.lastIndexOf(raw.includes('[') ? ']' : '}');
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(raw.slice(start, end + 1)); } catch {}
  }
  throw new Error(`Failed to parse AI JSON: ${raw.slice(0, 100)}`);
}

export async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    return await callGLM4(prompt, systemPrompt);
  } catch (e) {
    console.warn('GLM-4 failed, falling back to Claude:', e);
    return await callClaude(prompt, systemPrompt);
  }
}

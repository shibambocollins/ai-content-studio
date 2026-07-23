import { config } from '../config/index.js';

export async function generateCloudflareImage({ prompt, timeoutMs = 45000 }) {
  const { accountId, apiToken, imageModel } = config.cloudflare;
  if (!accountId || !apiToken) {
    throw new Error('Cloudflare Workers AI not configured (missing CF_ACCOUNT_ID/CF_API_TOKEN)');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${imageModel}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${body.slice(0, 300)}`);
    }

    const contentType = response.headers.get('content-type') || '';

    // Some Workers AI image models (e.g. SDXL) return raw image bytes.
    if (contentType.startsWith('image/')) {
      const buffer = Buffer.from(await response.arrayBuffer());
      return `data:${contentType};base64,${buffer.toString('base64')}`;
    }

    // Others (e.g. flux-1-schnell) return JSON with a base64 field.
    const data = await response.json();
    const base64 = data?.result?.image;
    if (!base64) throw new Error('No image returned by Cloudflare Workers AI');
    return `data:image/png;base64,${base64}`;
  } finally {
    clearTimeout(timeout);
  }
}
import { config } from '../config/index.js';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function generateGeminiText({ prompt, systemInstruction, timeoutMs = 30000 }) {
  const { apiKey, textModel } = config.gemini;
  if (!apiKey) throw new Error('Gemini not configured (missing GEMINI_API_KEY)');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      ...(systemInstruction
        ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
        : {}),
    };

    const response = await fetch(`${BASE_URL}/${textModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${body.slice(0, 300)}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateGeminiImage({ prompt, timeoutMs = 45000 }) {
  const { apiKey, imageModel } = config.gemini;
  if (!apiKey) throw new Error('Gemini not configured (missing GEMINI_API_KEY)');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
      },
    };

    const response = await fetch(`${BASE_URL}/${imageModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${body.slice(0, 300)}`);
    }

    const data = await response.json();
    const part = data?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part) throw new Error('No image returned by Gemini');
    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  } finally {
    clearTimeout(timeout);
  }
}

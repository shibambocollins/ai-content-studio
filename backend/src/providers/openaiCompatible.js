/**
 * Most "free LLM API" providers (Groq, OpenRouter, Together, Cloudflare
 * Workers AI's OpenAI-compatible route, and NVIDIA's build.nvidia.com NIM
 * endpoints) all speak the same OpenAI /chat/completions wire format.
 * One client here covers all of them — only baseUrl/apiKey/model differ.
 */
export async function chatCompletion({ baseUrl, apiKey, model, prompt, systemInstruction, timeoutMs = 30000 }) {
  if (!baseUrl || !apiKey || !model) {
    throw new Error('Provider not configured (missing baseUrl, apiKey, or model)');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const messages = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${body.slice(0, 300)}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Empty response from provider');
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

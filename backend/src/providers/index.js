import { config } from '../config/index.js';
import { generateGeminiText, generateGeminiImage } from './geminiProvider.js';
import { chatCompletion } from './openaiCompatible.js';

/**
 * Each entry knows how to call itself, and whether it's actually usable
 * right now (i.e. has an API key configured). The chain in PROVIDER_CHAIN
 * decides the order; unconfigured or failing providers are skipped.
 */
const textProviders = {
  gemini: {
    isConfigured: () => Boolean(config.gemini.apiKey),
    run: (args) => generateGeminiText(args),
  },
  groq: {
    isConfigured: () => Boolean(config.groq.apiKey),
    run: ({ prompt, systemInstruction }) =>
      chatCompletion({
        baseUrl: config.groq.baseUrl,
        apiKey: config.groq.apiKey,
        model: config.groq.model,
        prompt,
        systemInstruction,
      }),
  },
  openrouter: {
    isConfigured: () => Boolean(config.openrouter.apiKey),
    run: ({ prompt, systemInstruction }) =>
      chatCompletion({
        baseUrl: config.openrouter.baseUrl,
        apiKey: config.openrouter.apiKey,
        model: config.openrouter.model,
        prompt,
        systemInstruction,
      }),
  },
};

/**
 * Generates text by walking the configured provider chain in order.
 * Returns as soon as one provider succeeds. Throws only if all fail
 * (or none are configured at all).
 */
export async function generateText({ prompt, systemInstruction }) {
  const chain = config.providerChain.filter((name) => textProviders[name]);
  const attempted = [];
  let lastError;

  for (const name of chain) {
    const provider = textProviders[name];
    if (!provider.isConfigured()) {
      attempted.push(`${name} (not configured)`);
      continue;
    }
    try {
      const text = await provider.run({ prompt, systemInstruction });
      return { text, provider: name };
    } catch (err) {
      attempted.push(`${name} (error: ${err.message})`);
      lastError = err;
    }
  }

  throw new Error(
    `All text providers failed or were unconfigured. Tried: ${attempted.join(', ') || 'none'}.` +
      (lastError ? ` Last error: ${lastError.message}` : '')
  );
}

/**
 * Image generation currently only supports Gemini, since NVIDIA's and most
 * free tiers don't offer a comparable free image-generation endpoint.
 * Structured the same way so a second image provider can be added later
 * without touching the routes/callers.
 */
export async function generateImage({ prompt }) {
  if (!config.gemini.apiKey) {
    throw new Error('Image generation requires GEMINI_API_KEY to be configured.');
  }
  const image = await generateGeminiImage({ prompt });
  return { image, provider: 'gemini' };
}

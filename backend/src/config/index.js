import dotenv from 'dotenv';

dotenv.config();

function parseList(value) {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: parseList(process.env.CORS_ORIGIN || 'http://localhost:5173'),
  jwtSecret: process.env.JWT_SECRET || '',

  providerChain: parseList(process.env.PROVIDER_CHAIN || 'gemini,groq,openrouter'),

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    textModel: process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash',
    imageModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  },

  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
  },

  cloudflare: {
    accountId: process.env.CF_ACCOUNT_ID || '',
    apiToken: process.env.CF_API_TOKEN || '',
    imageModel: process.env.CF_IMAGE_MODEL || '@cf/black-forest-labs/flux-1-schnell',
  },
};

// Fail fast on genuinely dangerous misconfiguration, but don't crash on
// missing provider keys — the provider chain is designed to skip providers
// that aren't configured, and that's normal while you're still collecting keys.
export function assertCriticalConfig() {
  const problems = [];

  if (config.nodeEnv === 'production' && (!config.jwtSecret || config.jwtSecret.startsWith('replace-with'))) {
    problems.push('JWT_SECRET must be set to a strong random value in production.');
  }

  const known = new Set(['gemini', 'groq', 'openrouter']);
  const unknown = config.providerChain.filter((p) => !known.has(p));
  if (unknown.length) {
    problems.push(`PROVIDER_CHAIN contains unknown provider(s): ${unknown.join(', ')}`);
  }

  const anyConfigured = config.gemini.apiKey || config.groq.apiKey || config.openrouter.apiKey;
  if (!anyConfigured) {
    console.warn(
      '[config] No provider API keys are configured yet. Text/image generation will fail until you add at least one of GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY to backend/.env.'
    );
  }

  if (problems.length) {
    throw new Error(`Invalid configuration:\n- ${problems.join('\n- ')}`);
  }
}

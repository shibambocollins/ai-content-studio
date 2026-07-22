import rateLimit from 'express-rate-limit';

// Generation endpoints call paid/free-tier third-party APIs, so they get a
// tighter limit than the rest of the app. Tune these once you know your
// actual free-tier quotas (e.g. Gemini free tier, Groq free tier, etc.)
export const generationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many generation requests. Please wait a moment and try again.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Please try again later.' },
});

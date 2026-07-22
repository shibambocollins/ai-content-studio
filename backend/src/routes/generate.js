import { Router } from 'express';
import { generateText, generateImage } from '../providers/index.js';
import { requireAuth } from '../middleware/auth.js';
import { generationLimiter } from '../middleware/rateLimiter.js';
import { addHistoryItem, getHistoryForUser } from '../db/index.js';
import { v4 as uuid } from 'uuid';

export const generateRouter = Router();
generateRouter.use(requireAuth, generationLimiter);

const wordCount = (text) => text.split(/\s+/).filter(Boolean).length;

/**
 * Cheap, free, local heuristic that catches the obviously-bad inputs
 * (empty, single word, pure numbers/symbols) WITHOUT spending an API call.
 * Only prompts that pass this get sent to the (paid-quota) relevance check.
 * This roughly halves API usage compared to validating every request.
 */
function looksTriviallyInvalid(prompt) {
  const trimmed = prompt.trim();
  if (trimmed.length < 3) return true;
  if (/^[\d\s+\-*/.=()]+$/.test(trimmed)) return true; // pure arithmetic, e.g. "1+1"
  return false;
}

async function isRelevant(prompt, domainContext) {
  if (looksTriviallyInvalid(prompt)) return false;

  const validationPrompt = `Evaluate this prompt for relevance to: ${domainContext}.
Is it a valid and relevant request for this specific tool?
If the prompt is a generic question, a math equation, an off-topic fact lookup
(unless it's a request to write/create content ABOUT that fact), or nonsensical
gibberish, reply EXACTLY with the word NO. Otherwise reply EXACTLY with YES.
User prompt: "${prompt}"`;

  try {
    const { text } = await generateText({
      prompt: validationPrompt,
      systemInstruction: 'You are a strict prompt validation filter. Reply ONLY with YES or NO.',
    });
    return !text.trim().toUpperCase().includes('NO');
  } catch {
    // If the validator itself fails (provider down), don't block the user —
    // fail open so a provider outage doesn't also break basic usage.
    return true;
  }
}

function recordHistory(userId, item) {
  return addHistoryItem({ id: uuid(), userId, date: new Date().toISOString(), ...item });
}

generateRouter.post('/text', async (req, res, next) => {
  try {
    const { prompt, category = 'Blog posts', tone = 'Professional', length = 'Medium' } = req.body || {};
    if (!prompt || !prompt.trim()) return res.status(400).json({ error: 'Prompt is required' });

    const relevant = await isRelevant(prompt, 'writing a document, blog, email, story, or structured text content');
    if (!relevant) {
      return res.status(422).json({ error: 'That prompt doesn\'t look like a text-generation request. Try something like "Write a blog about remote work".' });
    }

    const fullPrompt = `Topic/Instructions: ${prompt}\n\nTask: Write a ${length.toLowerCase()} ${category.toLowerCase()} with a ${tone.toLowerCase()} tone.`;
    const { text, provider } = await generateText({
      prompt: fullPrompt,
      systemInstruction:
        'You are an expert, highly focused content writer. Output ONLY the requested content — no conversational filler, no preamble, no closing remarks.',
    });

    await recordHistory(req.user.id, { type: 'text', title: `${category}: ${prompt.slice(0, 30)}...`, words: wordCount(text) });
    res.json({ result: text, provider });
  } catch (err) {
    next(err);
  }
});

generateRouter.post('/code', async (req, res, next) => {
  try {
    const { prompt, action = 'generate', language = 'javascript' } = req.body || {};
    if (!prompt || !prompt.trim()) return res.status(400).json({ error: 'Prompt is required' });

    const relevant = await isRelevant(prompt, 'programming, software development, coding, or scripting');
    if (!relevant) {
      return res.status(422).json({ error: 'That prompt doesn\'t look like a coding request. Try something like "A React hook for debounced search input".' });
    }

    const fullPrompt = `Action: ${action}\nLanguage: ${language}\nRequest: ${prompt}\n\nTask: Provide the requested code.`;
    const { text, provider } = await generateText({
      prompt: fullPrompt,
      systemInstruction:
        'You are an expert senior software engineer. Provide robust, production-ready code with error handling, edge cases, and comments. Output ONLY a single raw code block (markdown fenced) or the exact explanation requested — no conversational filler.',
    });

    let clean = text.trim();
    if (clean.startsWith('```')) {
      const firstNewline = clean.indexOf('\n');
      if (firstNewline !== -1) clean = clean.slice(firstNewline + 1);
      if (clean.endsWith('```')) clean = clean.slice(0, -3);
    }
    clean = clean.trim();

    await recordHistory(req.user.id, { type: 'code', title: `${language} code: ${prompt.slice(0, 30)}...` });
    res.json({ result: clean, provider });
  } catch (err) {
    next(err);
  }
});

generateRouter.post('/image', async (req, res, next) => {
  try {
    const { prompt, style = 'photorealistic' } = req.body || {};
    if (!prompt || !prompt.trim()) return res.status(400).json({ error: 'Prompt is required' });

    const relevant = await isRelevant(prompt, 'generating a visual image, scene, artwork, or photograph');
    if (!relevant) {
      return res.status(422).json({ error: 'That prompt doesn\'t look like an image request. Try something like "A minimalist desk setup with a plant".' });
    }

    const { image, provider } = await generateImage({ prompt: `${prompt}, ${style} style` });

    await recordHistory(req.user.id, { type: 'image', title: `Image: ${prompt.slice(0, 30)}...` });
    res.json({ result: image, provider });
  } catch (err) {
    next(err);
  }
});

generateRouter.post('/enhance', async (req, res, next) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || !prompt.trim()) return res.status(400).json({ error: 'Prompt is required' });

    const fullPrompt = `Act as an expert prompt engineer. Rewrite the following basic prompt to be highly effective, detailed, structured, and clear for a Large Language Model.\n\nOriginal Prompt: "${prompt}"\n\nProvide ONLY the enhanced prompt.`;
    const { text, provider } = await generateText({
      prompt: fullPrompt,
      systemInstruction: 'You are a master prompt engineer. Do not use conversational filler.',
    });

    await recordHistory(req.user.id, { type: 'enhance', title: `Enhanced: ${prompt.slice(0, 30)}...` });
    res.json({ result: text, provider });
  } catch (err) {
    next(err);
  }
});

generateRouter.get('/history', async (req, res, next) => {
  try {
    const history = await getHistoryForUser(req.user.id);
    res.json({ history });
  } catch (err) {
    next(err);
  }
});

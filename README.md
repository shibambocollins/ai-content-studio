# AI Content Studio

Restructured from a single-file Gemini Canvas export into a proper
frontend/backend project. Text, code, and image generation now go through
**your own backend**, which never ships API keys to the browser and can fall
back across multiple AI providers (Gemini → Groq → OpenRouter) if one is
unavailable or out of quota.

```
ai-content-studio/
├── backend/     Express API — holds all provider keys, does auth, rate limiting
└── frontend/    Vite + React app — talks only to your backend, never to Gemini/Groq/OpenRouter directly
```

## Why this is safer than the original Canvas file

The original single-file app called `generativelanguage.googleapis.com`
directly from the browser. That means the API key (once added) would be
visible to anyone who opens devtools — and someone could steal it and burn
your quota. Now:

- The React app only ever calls **your** backend (`/api/...`).
- The backend holds `GEMINI_API_KEY` / `GROQ_API_KEY` / `OPENROUTER_API_KEY` as
  server-side environment variables — never sent to the browser.
- Every generation route requires a valid login (JWT) and is rate-limited,
  so a stranger can't hammer your keys even if they find the URL.

## 1. Get your API keys

- **Gemini** (primary, also does image generation): https://aistudio.google.com/apikey
- **Groq** (fallback #1, free, OpenAI-compatible, fast): https://console.groq.com
- **OpenRouter** (fallback #2, has free `:free` model variants, also OpenAI-compatible): https://openrouter.ai/keys

Both Groq and OpenRouter speak the OpenAI `/chat/completions` format, so
they reuse the same client code (`providers/openaiCompatible.js`) — only the
base URL/key/model differ.

You don't need all three to run this — Gemini alone is enough to start.
Add the others whenever you get around to it; the fallback chain just skips
whatever isn't configured (see `backend/.env.example` for exact variable names).

> NVIDIA NIM (build.nvidia.com) was in an earlier version of this chain but
> is dropped here since account verification was blocking it. The provider
> abstraction still makes it trivial to add back later (or add any other
> OpenAI-compatible provider) — see "Extending the provider chain" below.

## 2. Run the backend

```bash 
cd backend
cp .env.example .env
# edit .env and paste in at least GEMINI_API_KEY
npm install
npm run dev
```

Backend runs on `http://localhost:8787`. Check `http://localhost:8787/api/health`
in a browser to confirm it's up and see which providers are in the chain.

## 3. Run the frontend

```bash
cd frontend
cp .env.example .env   # default already points at localhost:8787, no edit needed for local dev
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`. Register an account (this is a
real signup, stored in `backend/data/db.json` with a bcrypt-hashed password)
and start generating.

## 4. Deploying

**Frontend → Vercel** (or any static host)
- Push this repo to GitHub.
- In Vercel: New Project → import repo → set **Root Directory** to `frontend`.
- Framework preset: Vite. Build command `npm run build`, output dir `dist` (Vercel detects this automatically).
- Add an environment variable `VITE_API_URL` pointing at your deployed backend, e.g. `https://your-backend.onrender.com/api`.

**Backend → Render** (free tier, minimal config) — or Railway/Fly.io, same idea
- New Web Service → connect repo → **Root Directory** `backend`.
- Build command: `npm install`. Start command: `npm start`.
- Add all the environment variables from `backend/.env.example` in Render's dashboard (never commit `.env`).
- Set `CORS_ORIGIN` to your Vercel URL once you have it, e.g. `https://your-app.vercel.app`.

**Important caveat about the current data store:** `backend/db` uses a
JSON file (`lowdb`) for users/history. That's zero-config and perfect for
getting this running fast, but most free hosts (Render included) wipe the
filesystem on redeploy or restart — so accounts and history can disappear.
When that starts to matter, swap `backend/src/db/index.js` for a real
database (Postgres on Render/Supabase/Neon all have free tiers) — nothing
else in the app needs to change, since every route only calls the small set
of helper functions exported from that file.

## What's implemented vs. still a placeholder

| Area | Status |
|---|---|
| Auth (register/login, JWT, bcrypt) | ✅ Real |
| Text / Code / Image generation | ✅ Real, via provider fallback chain |
| Prompt relevance validation | ✅ Real (cheap local heuristic first, API call only if needed) |
| History + dashboard stats | ✅ Real, persisted per-user |
| Prompt Library | ✅ Static curated prompts (no backend needed) |
| Rate limiting | ✅ Basic per-IP limits on auth + generation routes |
| Settings → profile editing | ⚠️ Placeholder — UI is read-only; needs a `PATCH /api/auth/me` route |
| Voice / Music generators | ❌ Not built — the original Canvas file also only had placeholder buttons for these |
| Persistent database | ⚠️ File-based (fine locally, not durable on most free hosts — see above) |

## Extending the provider chain

`backend/src/providers/index.js` is the one file to touch to add a new
provider. If it speaks the OpenAI `/chat/completions` format (most free APIs
do), you just add a config block pointing at `chatCompletion()` — no new
client code needed. Gemini has its own client (`geminiProvider.js`) since its
request/response shape is different.

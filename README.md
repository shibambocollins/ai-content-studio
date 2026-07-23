# AI Content Studio

Restructured from a single-file Gemini Canvas export into a proper
frontend/backend project. Text, code, and image generation now go through
**your own backend**, which never ships API keys to the browser and falls
back across multiple providers if one is unavailable, rate-limited, or out
of quota.

```
ai-content-studio/
├── backend/     Express API — provider keys, auth, rate limiting, Postgres
└── frontend/    Vite + React app — talks only to your backend, never to any AI provider directly
```

## Why this is safer than the original Canvas file

The original single-file app called `generativelanguage.googleapis.com`
directly from the browser. That means the API key (once added) would be
visible to anyone who opens devtools — and someone could steal it and burn
your quota. Now:

- The React app only ever calls **your** backend (`/api/...`).
- The backend holds every provider key as a server-side environment
  variable — never sent to the browser.
- Every generation route requires a valid login (JWT) and is rate-limited,
  so a stranger can't hammer your keys even if they find the URL.

## 1. Set up your database (Supabase, free, no card required)

1. Go to https://supabase.com → New Project (pick any name/region, set a DB password and **save it**).
2. Once it's provisioned: Project Settings → Database → **Connection string** → copy the "URI" one — it looks like:
   `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
3. Paste the full string (with your real password swapped in) into `DATABASE_URL` in `backend/.env`.

No separate migration command needed. The backend applies its schema
(`backend/src/db/schema.sql`, plain `CREATE TABLE IF NOT EXISTS`)
automatically on startup — the first time it connects to a fresh Supabase
project, the `users` and `history_items` tables get created for you.

(Neon or Render Postgres work identically — just swap in their connection
string. Nothing else in the app needs to change.)

## 2. Get your AI provider API keys

**Text (tried in this order — first that succeeds wins):**
- **Gemini** (primary): https://aistudio.google.com/apikey
- **Groq** (fallback #1, free, fast, OpenAI-compatible): https://console.groq.com
- **OpenRouter** (fallback #2, has free `:free` model variants, also OpenAI-compatible): https://openrouter.ai/keys

**Image (separate, its own fallback chain):**
- **Gemini** (primary, best quality) — same key as above, but note: Gemini's
  image model (Nano Banana) needs **billing enabled** on the Google Cloud
  project to get any real quota, even though you're not charged under the
  free limits. If you don't want to link a card yet, skip straight to Cloudflare below.
- **Cloudflare Workers AI** (fallback, genuinely free, no billing gate — Stable Diffusion/Flux models):
  https://dash.cloudflare.com — account ID is on the Overview page sidebar or the Workers & Pages page;
  API token via My Profile → API Tokens → Create Token → "Workers AI" template.

You don't need every key to run this — Gemini text alone is enough to
start. Everything else just gets skipped by the fallback chain until it's
configured (see `backend/.env.example` for exact variable names).

> NVIDIA NIM (build.nvidia.com) was in an earlier version of this chain but
> is dropped here since account verification was blocking it. Adding it (or
> any other provider) back is a config change, not new code — see
> "Extending the provider chain" below.

## 3. Run the backend

```bash
cd backend
cp .env.example .env
# edit .env: paste in DATABASE_URL and at least GEMINI_API_KEY
npm install
npm run dev
```

Backend runs on `http://localhost:8787`. Check `http://localhost:8787/api/health`
in a browser to confirm it's up and see which providers are in each chain.

## 4. Run the frontend

```bash
cd frontend
cp .env.example .env   # default already points at localhost:8787, no edit needed for local dev
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`. Register an account (real signup,
bcrypt-hashed password, stored in Postgres) and start generating.

## 5. Deploying

**Frontend → Vercel** (or any static host)
- Push this repo to GitHub.
- In Vercel: New Project → import repo → set **Root Directory** to `frontend`.
- Framework preset: Vite. Build command `npm run build`, output dir `dist` (Vercel detects this automatically).
- Add an environment variable `VITE_API_URL` pointing at your deployed backend, e.g. `https://your-backend.onrender.com/api`.

**Backend → Render** (free tier, minimal config) — or Railway/Fly.io, same idea
- New Web Service → connect repo → **Root Directory** `backend`.
- Build command: `npm install`. Start command: `npm start`.
- Add every environment variable from `backend/.env.example` in Render's dashboard (never commit `.env`), including `DATABASE_URL` from your Supabase project.
- Set `CORS_ORIGIN` to your Vercel URL once you have it, e.g. `https://your-app.vercel.app`.

Since Supabase is a separate hosted service, your data survives Render
redeploys/restarts fine — unlike the old file-based store, there's nothing
ephemeral about it.

## What's implemented vs. still a placeholder

| Area | Status |
|---|---|
| Auth (register/login, JWT, bcrypt) | ✅ Real, tested against real Postgres |
| Database | ✅ Real Postgres (Supabase/Neon/Render), auto-applies schema on boot |
| Text / Code generation | ✅ Real, via provider fallback chain (Gemini → Groq → OpenRouter) |
| Image generation | ✅ Real, via its own fallback chain (Gemini → Cloudflare Workers AI) |
| Prompt relevance validation | ✅ Real (cheap local heuristic first, API call only if needed) |
| History + dashboard stats | ✅ Real, persisted per-user |
| Prompt Library | ✅ Static curated prompts (no backend needed) |
| Rate limiting | ✅ Basic per-IP limits on auth + generation routes |
| Settings → profile editing | ⚠️ Placeholder — UI is read-only; needs a `PATCH /api/auth/me` route |
| Voice / Music generators | ❌ Not built — the original Canvas file also only had placeholder buttons for these |

## Extending the provider chain

`backend/src/providers/index.js` has two separate registries —
`textProviders` and `imageProviders` — each with its own fallback order
read from `PROVIDER_CHAIN` / `IMAGE_PROVIDER_CHAIN`. To add a new **text**
provider that speaks the OpenAI `/chat/completions` format (most free APIs
do), just add a config block pointing at `chatCompletion()` — no new client
code needed. Gemini and Cloudflare each have their own client
(`geminiProvider.js`, `cloudflareProvider.js`) since their request/response
shapes differ from the OpenAI format.

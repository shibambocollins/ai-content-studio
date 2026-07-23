# AI Content Studio

A full-stack AI content generation platform — text, code, and image generation
through a unified, provider-agnostic backend. Originally scaffolded as a
single-file Gemini Canvas export, restructured into a production-shaped
frontend/backend project with real authentication, a persistent database,
and automatic multi-provider fallback so a single API quota limit never
takes the whole app down.

**Live app:** https://ai-content-studio-liard-xi.vercel.app
**Backend API:** https://ai-content-studio-u4hc.onrender.com/api/health
**Repository:** [shibambocollins/ai-content-studio](https://github.com/shibambocollins/ai-content-studio)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Provider Fallback Chains](#provider-fallback-chains)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Known Limitations / Roadmap](#known-limitations--roadmap)
- [Author](#author)

---

## Overview

AI Content Studio lets a logged-in user generate blog posts, emails, code
snippets, images, and engineered prompts from natural-language input. The
project's defining design decision is that **no AI provider is a single
point of failure**: every generation request walks a configurable chain of
providers (e.g. Gemini → Groq → OpenRouter for text) and automatically
moves to the next one if a provider is unconfigured, rate-limited, or down.

This matters in practice — free-tier AI APIs have unpredictable quotas, and
a student project shouldn't go offline because one vendor throttled a key.

## Features

- **Real authentication** — bcrypt-hashed passwords, JWT sessions, rate-limited login/register endpoints
- **Text generation** — blog posts, emails, CVs, tweets, essays, stories, study notes, with tone/length/category controls
- **Code generation** — generate, explain, refactor, or debug code across JS/React, Python, TypeScript, HTML/CSS, Java
- **Image generation** — text-to-image with style presets (photorealistic, digital art, minimalist, anime)
- **Prompt Enhancer** — rewrites a basic prompt into a detailed, structured one for better LLM output
- **Prompt Library** — curated, copy-ready prompts across writing, marketing, programming, and image categories
- **Dashboard** — per-user stats (words generated, images created, prompts enhanced, estimated time saved) computed from real history
- **Smart validation** — a free local heuristic filters obviously invalid input (e.g. `"1+1"`) before ever spending an API call on a relevance check
- **Multi-provider fallback** — separate, independently configurable chains for text and image generation
- **Persistent Postgres database** — schema auto-applied on boot, no manual migration step

## Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- lucide-react (icons)

**Backend**
- Node.js + Express
- `pg` (lightweight, pure-JS Postgres driver — no native binary downloads)
- `jsonwebtoken` + `bcryptjs` for auth
- `express-rate-limit` for abuse protection

**Infrastructure**
- **Database:** Supabase (hosted Postgres, free tier)
- **Backend hosting:** Render (free tier)
- **Frontend hosting:** Vercel (free tier)

**AI Providers**
| Purpose | Primary | Fallback chain |
|---|---|---|
| Text | Gemini (`gemini-2.5-flash`) | Groq → OpenRouter |
| Image | Gemini (`gemini-2.5-flash-image`, "Nano Banana") | Cloudflare Workers AI (Flux) |

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React Frontend  │  HTTPS  │  Express Backend  │  HTTPS  │   AI Providers   │
│    (Vercel)      │────────▶│     (Render)      │────────▶│ Gemini / Groq /  │
│                  │◀────────│                   │◀────────│ OpenRouter / CF  │
└─────────────────┘         └────────┬──────────┘         └─────────────────┘
                                      │
                                      │ SQL (pg)
                                      ▼
                             ┌──────────────────┐
                             │   Postgres DB     │
                             │    (Supabase)     │
                             └──────────────────┘
```

The frontend never talks to any AI provider directly — every request goes
through the backend, which is the only place that holds provider API keys.
This means keys are never exposed in browser devtools or the JS bundle.

## Project Structure

```
ai-content-studio/
├── backend/
│   ├── src/
│   │   ├── config/index.js        # env var loading + validation
│   │   ├── db/
│   │   │   ├── index.js           # pg-based data access (users, history)
│   │   │   └── schema.sql         # auto-applied on boot
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification
│   │   │   ├── rateLimiter.js      # per-IP limits on auth + generation
│   │   │   └── errorHandler.js
│   │   ├── providers/
│   │   │   ├── index.js           # fallback-chain registries (text + image)
│   │   │   ├── geminiProvider.js
│   │   │   ├── openaiCompatible.js # shared client for Groq/OpenRouter
│   │   │   └── cloudflareProvider.js
│   │   ├── routes/
│   │   │   ├── auth.js            # register/login
│   │   │   └── generate.js        # text/code/image/enhance/history
│   │   └── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/            # Layout, GeneratorLayout, shared UI
    │   ├── context/AppContext.jsx # auth + history state
    │   ├── lib/api.js             # fetch wrapper — talks only to backend
    │   ├── views/                 # Dashboard, Text/Code/Image/Enhancer/Library/Settings
    │   └── App.jsx
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- A free [Supabase](https://supabase.com) project (Postgres)
- At least one AI provider key (Gemini recommended to start)

### 1. Clone and set up the database

Create a Supabase project → Project Settings → Database → copy the
connection string. No manual migration needed — the backend applies
`backend/src/db/schema.sql` automatically on first boot.

### 2. Backend

```bash
cd backend
cp .env.example .env
# fill in DATABASE_URL and at least GEMINI_API_KEY
npm install
npm run dev
```

Runs on `http://localhost:8787`. Check `/api/health` to confirm it's up.

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # points at localhost:8787 by default
npm install
npm run dev
```

Runs on `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default `8787`) | Server port |
| `NODE_ENV` | Yes in production | `development` or `production` |
| `CORS_ORIGIN` | Yes | Comma-separated allowed origins (your frontend URL, no trailing slash) |
| `JWT_SECRET` | Yes | Long random string signing auth tokens |
| `DATABASE_URL` | Yes | Postgres connection string |
| `PROVIDER_CHAIN` | No (default `gemini,groq,openrouter`) | Text provider fallback order |
| `GEMINI_API_KEY` | For Gemini | https://aistudio.google.com/apikey |
| `GEMINI_TEXT_MODEL` | No | Default `gemini-2.5-flash` |
| `GEMINI_IMAGE_MODEL` | No | Default `gemini-2.5-flash-image` |
| `GROQ_API_KEY` | For Groq | https://console.groq.com |
| `GROQ_BASE_URL` / `GROQ_MODEL` | No | Defaults set for Llama 3.1 8B |
| `OPENROUTER_API_KEY` | For OpenRouter | https://openrouter.ai/keys |
| `OPENROUTER_BASE_URL` / `OPENROUTER_MODEL` | No | Defaults to a free Llama 3.1 model |
| `IMAGE_PROVIDER_CHAIN` | No (default `gemini,cloudflare`) | Image provider fallback order |
| `CF_ACCOUNT_ID` / `CF_API_TOKEN` | For Cloudflare | https://dash.cloudflare.com |
| `CF_IMAGE_MODEL` | No | Default `@cf/black-forest-labs/flux-1-schnell` |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend base URL **including `/api`**, e.g. `https://your-backend.onrender.com/api` |

## API Reference

All routes are prefixed with `/api`. Generation routes require
`Authorization: Bearer <token>`.

| Method | Route | Body | Description |
|---|---|---|---|
| GET | `/health` | — | Service status + active provider chains |
| POST | `/auth/register` | `{ name, email, password }` | Create account, returns `{ token, user }` |
| POST | `/auth/login` | `{ email, password }` | Returns `{ token, user }` |
| POST | `/generate/text` | `{ prompt, category?, tone?, length? }` | Returns `{ result, provider }` |
| POST | `/generate/code` | `{ prompt, action?, language? }` | Returns `{ result, provider }` |
| POST | `/generate/image` | `{ prompt, style? }` | Returns `{ result (base64 data URI), provider }` |
| POST | `/generate/enhance` | `{ prompt }` | Returns `{ result, provider }` |
| GET | `/generate/history` | — | Returns `{ history: [...] }` for the logged-in user |

## Provider Fallback Chains

`backend/src/providers/index.js` holds two independent registries —
`textProviders` and `imageProviders` — each read from its own env var
(`PROVIDER_CHAIN`, `IMAGE_PROVIDER_CHAIN`). For each request, the chain is
walked in order; the first configured provider that succeeds wins, and
unconfigured or failing providers are skipped with the reason logged.

Groq and OpenRouter both speak the OpenAI `/chat/completions` format, so
they share one client (`openaiCompatible.js`) — adding another free
OpenAI-compatible provider later is a config addition, not new code. Gemini
and Cloudflare each have their own client since their request/response
shapes differ.

## Database Schema

```sql
users
  id            TEXT PRIMARY KEY
  name          TEXT NOT NULL
  email         TEXT NOT NULL UNIQUE
  password_hash TEXT NOT NULL
  avatar        TEXT NOT NULL
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()

history_items
  id      TEXT PRIMARY KEY
  type    TEXT NOT NULL        -- 'text' | 'code' | 'image' | 'enhance'
  title   TEXT NOT NULL
  words   INTEGER               -- only set for type = 'text'
  date    TIMESTAMPTZ NOT NULL DEFAULT now()
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
```

Applied automatically via `CREATE TABLE IF NOT EXISTS` on every backend
boot — safe to run repeatedly, no separate migration tool required.

## Deployment

Live architecture: **Vercel** (frontend) + **Render** (backend) +
**Supabase** (database).

**Frontend (Vercel)**
- Root Directory: `frontend`
- Framework: Vite (auto-detected) — Build `npm run build`, Output `dist`
- Env: `VITE_API_URL=https://<your-render-url>/api`
- ⚠️ Vite bakes env vars in at **build time** — always trigger a redeploy after changing `VITE_API_URL`, saving alone does nothing to a previously built bundle.

**Backend (Render)**
- Root Directory: `backend`
- Build Command: `npm install` — Start Command: `npm start`
- Add every variable listed in [Environment Variables](#environment-variables) above
- `CORS_ORIGIN` must exactly match your Vercel **Domain** URL (not the per-deployment hash URL, and no trailing slash) or every browser request gets blocked by CORS

**Database (Supabase)**
- Free Postgres project, connection string → `DATABASE_URL`
- No manual migration step — schema applies on backend boot

## Security Notes

- Provider API keys live only in backend environment variables — never sent to or readable from the browser.
- Passwords are hashed with bcrypt (cost factor 10), never stored or logged in plaintext.
- JWTs expire after 7 days; auth and generation routes are both rate-limited per IP to prevent quota abuse.
- CORS is allow-listed to specific origins rather than left open.

## Known Limitations / Roadmap

| Area | Status |
|---|---|
| Settings → profile editing | Placeholder — read-only UI, needs a `PATCH /api/auth/me` route |
| Voice / Music generators | Not built — placeholder buttons only |
| Gemini image generation | Requires billing enabled on the Google Cloud project for real quota; Cloudflare fallback covers this when unavailable |
| Rate limit tuning | Current limits are conservative defaults — adjust once real usage patterns are known |

## Author

**Ntsobokwane Collins Shibambo** — Final-year Diploma in ICT Application
Development, Cape Peninsula University of Technology (CPUT). Built as part
of ongoing full-stack project work alongside MyCapePlanner and AI Job
Assistant.
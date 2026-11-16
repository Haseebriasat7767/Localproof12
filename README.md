# LocalProof — AI Review Manager for Local Businesses

> **A complete, production-ready SaaS, offered for sale as a working product.**
> Everything needed to run it — code, database schema, billing, AI, deployment
> config, tests, and docs — is in this repository. See [`docs/LISTING.md`](docs/LISTING.md)
> for the acquisition summary and [`docs/HANDOVER.md`](docs/HANDOVER.md) for the
> full technical handover.

LocalProof helps local businesses collect honest customer feedback, monitor and
respond to reviews, flag suspicious reviews, and act on unhappy customers before
they churn. It ships with an embeddable feedback widget, an AI reply assistant
(DeepSeek), a reputation dashboard, Google Business Profile review import, and
Stripe subscription billing.

---

## Try it in one command (live demo)

No accounts, no external services, no cloud database required. This boots a
throwaway embedded PostgreSQL, seeds a realistic demo business, and serves the
API **and** the built web app from a single process.

```bash
# 1) Build the frontend once
cd frontend && npm install && npm run build

# 2) Start the whole product (API + UI + demo database)
cd ../backend && npm install && npm run demo
```

Then open **http://localhost:5000** and sign in with:

| Field    | Value                |
|----------|----------------------|
| Email    | `demo@localproof.app`|
| Password | `demo1234`           |

The demo is seeded with 12 reviews (positive, neutral, negative, and one that
trips the suspicious-review heuristics) and 5 widget feedback entries (including
unhappy customers that surface on the Alerts page). AI reply drafts, sentiment,
and fake-review flags all work in the demo (drafts use the built-in fallback
unless a `DEEPSEEK_API_KEY` is provided). Stripe, Resend, and Google are simply
inactive until their keys are added.

---

## What's included

- **Auth & accounts** — register/login with JWT + bcrypt, 14-day free trial on signup, hardened with rate limiting.
- **Review management** — manual entry, filtering (sentiment / replied / platform), pagination, saved replies.
- **AI reply drafts** — one-click drafts in the brand's chosen tone (professional / friendly / casual) via DeepSeek, with a graceful no-key fallback.
- **Suspicious-review signals** — pure-code heuristics (no API cost) flag likely-fake reviews for human review.
- **Sentiment analysis** — pure-code, no API cost.
- **Embeddable feedback widget** — a single `<script>` snippet; identical, unbiased flow for every rating (no review gating), with optional public-review link.
- **Unhappy-customer alerts** — low-rating widget feedback is surfaced in-app and emailed via Resend.
- **Google Business Profile import** — OAuth connect, location selection, and on-demand review sync (see the approval caveat in [`docs/HANDOVER.md`](docs/handover.md)).
- **Stripe billing** — subscription checkout, customer portal, and a signed webhook that upgrades/downgrades accounts.
- **Paywall** — paid routes require an active trial or subscription; lapsed users keep access to account/billing so they can resubscribe.
- **Dashboard** — reputation stats (total, average rating, pending replies, suspicious count) and recent reviews.
- **Marketing site** — landing page, pricing page, login/register.
- **Ops-ready backend** — `helmet`, CORS, `/health` and `/healthz` probes, central error handling that never leaks internals, boot-time config reporting, proxy-aware rate limiting.
- **Tests + CI** — a `node:test` suite (API, DB resolution, services, env, deploy config) and a GitHub Actions workflow that runs the backend against real Postgres and builds the frontend.

## Tech stack

| Layer     | Technology                                                     |
|-----------|----------------------------------------------------------------|
| Frontend  | React 18, React Router 6, Tailwind CSS, Recharts, lucide-react |
| Backend   | Node.js 22, Express 4, `pg` (PostgreSQL)                       |
| Database  | PostgreSQL (any managed provider — Neon, Supabase, Railway, Nile, Vercel) |
| AI        | DeepSeek Chat (OpenAI-compatible)                              |
| Payments  | Stripe (subscriptions + billing portal + webhook)              |
| Email     | Resend                                                         |
| Auth      | JWT + bcryptjs                                                 |
| Deploy    | Vercel (frontend + serverless API) or Railway (single service), Replit supported |

## Project layout

```
/                 — root package.json + vercel.json (Vercel serverless entry)
/api/index.js     — Vercel serverless handler (re-exports the Express app)
/backend          — Express API
  src/
    app.js        — app wiring (middleware, routes, health, opt-in static serving)
    index.js      — long-lived server entrypoint (Railway/local)
    db.js         — Postgres pool, schema + migrations, provider-agnostic DSN resolution
    config/env.js — boot-time configuration report
    models/       — User, Review, Feedback (pg-backed, Mongoose-style API)
    routes/       — auth, reviews, business, billing, widget, google
    middleware/   — JWT auth, active-subscription gate, central error handler
    services/     — claude.js (AI drafts + sentiment + fake detection), googleBusiness.js
  scripts/        — migrate.js, seed.js, demo.js (embedded-postgres live demo)
  test/           — node:test suite
/frontend         — React app (CRA + Tailwind)
  src/pages/      — Landing, Pricing, Login, Register, Dashboard, Reviews, Alerts, Settings
/docs             — HANDOVER.md (technical), LISTING.md (acquisition summary)
```

## Running it for real

See [`docs/HANDOVER.md`](docs/HANDOVER.md) for the complete guide. The short version:

```bash
# Backend
cd backend
cp .env.example .env      # then fill in your keys
npm install
npm run migrate           # create the schema once
npm start                 # API on :3001

# Frontend
cd frontend
npm install
npm start                 # dev server on :5000 (proxies /api to :3001)
```

### Environment variables (backend)

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres connection string (also accepts `POSTGRES_URL`, `NILEDB_POSTGRES_URL`, etc.) |
| `JWT_SECRET` | ✅ | Signs auth tokens |
| `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` | for billing | Enables checkout (without them, lapsed users can't subscribe) |
| `STRIPE_WEBHOOK_SECRET` | for billing | Verifies the webhook that flips accounts to `pro` |
| `DEEPSEEK_API_KEY` | optional | Real AI drafts (falls back to canned text if absent) |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | optional | Unhappy-customer alert emails |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | optional | Google Business Profile import |
| `FRONTEND_URL`, `BACKEND_URL` | recommended | Stripe redirects, widget embed base, OAuth callback |
| `SERVE_FRONTEND` | optional | `1` = serve the built frontend from the API (single-container deploy / demo) |

Full list with explanations: [`backend/.env.example`](backend/.env.example).

## Tests

```bash
cd backend
npm run test:all                                          # FULL suite, zero setup (boots a throwaway embedded Postgres)
DATABASE_URL=postgres://... JWT_SECRET=test npm test      # full suite against your own Postgres
npm run test:unit                                         # services only (no DB)
```

`npm run test:all` is the easiest way to prove the build is green: it spins up an
ephemeral embedded PostgreSQL, runs every test file (including the HTTP/DB tests),
then tears the database down. No local Postgres or cloud database required.

GitHub Actions (`.github/workflows/test.yml`) spins up Postgres 16, runs the
backend suite, and builds the frontend on every push/PR.

## License

Proprietary — All Rights Reserved. See [`LICENSE`](LICENSE). Ownership transfers
only under a written purchase agreement.

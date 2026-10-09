# LocalProof — AI Review Manager for Local Businesses

LocalProof turns customer feedback into reputation growth for local businesses.
A one-line embeddable widget asks every customer how their experience was:
**happy customers (4-5★) are routed to the business's Google review page,
unhappy ones (1-3★) get a private feedback form** — so problems are fixed
before they ever become public reviews. A dashboard tracks every review,
drafts AI replies in the business's own tone, flags fake reviews, and emails
the owner the moment someone is unhappy.

**Monetization is built in:** 14-day free trial, then $49/month via Stripe
(checkout + webhook + customer portal). The paywall is enforced server-side.

```
Customer visits site → widget asks 1-5★
  ├─ 4-5★ → "Leave a Google review" → opens the business's Google review link
  └─ 1-3★ → private comment form → stored + owner emailed instantly
Owner dashboard → all reviews, sentiment, fake flags, AI reply drafts, stats
```

## Stack

- **Frontend:** React 18 + Tailwind CSS + React Router (Create React App)
- **Backend:** Node.js + Express + PostgreSQL (`pg`)
- **AI:** DeepSeek Chat (OpenAI-compatible) for reply drafts — with a canned
  fallback when no key is set, so the feature degrades gracefully
- **Payments:** Stripe (checkout, webhook, portal)
- **Email:** Resend (unhappy-customer alerts)
- **Reviews import:** Google Business Profile OAuth + sync (optional)
- **Tests:** `node:test` + supertest — 69 API/service tests run with no external services (`npm run test:memory`), plus DB/config unit tests
- **Deploy:** Vercel (frontend + serverless API) — see [DEPLOY.md](DEPLOY.md)

## What's built

- ✅ Auth: register / login / JWT, rate-limited, bcrypt password hashing
- ✅ **Smart review routing widget** — happy → Google, unhappy → private form
  (the core loop, fully wired end-to-end, embeddable in one script tag)
- ✅ Review management: add manually, filter by sentiment/platform/status
- ✅ **AI reply drafts** in a configurable tone (professional/friendly/casual)
- ✅ Fake review detection (heuristic — no API cost)
- ✅ Sentiment analysis (rule-based — no API cost)
- ✅ Unhappy-customer email alerts (Resend)
- ✅ **Stripe billing**: checkout, webhook (upgrades/downgrades accounts),
  customer portal; server-side paywall with 402 responses
- ✅ Trial system: 14-day trial, `requireActive` gate on all paid routes
- ✅ Google Business Profile import (OAuth connect, location picker, sync)
- ✅ Dashboard with stats, recent reviews, plan status
- ✅ Landing page, pricing page, FAQ, privacy policy, terms of service, 404
- ✅ **Seeded demo account** with realistic sample data — one click from the
  login page, so anyone can click through the whole product
- ✅ Live widget preview inside the dashboard (submits real feedback)
- ✅ Health endpoints (`/healthz` liveness, `/health` readiness w/ DB state)
- ✅ One-command **full-stack smoke test** (`npm run smoke`)

## Quick start (local)

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env        # set DATABASE_URL + JWT_SECRET (others optional)
npm run dev                 # API on :3001

# 2. Frontend (another terminal)
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
npm start                   # app on :3000

# 3. Demo data — makes the product clickable immediately
cd backend && npm run seed:demo
# → log in as demo@localproof.app / demo1234 (or use the "Explore the live
#   demo" button on the login page)
```

## Verify everything works (one command, no infrastructure)

```bash
cd backend
npm run smoke
```

Boots the real API against an in-memory Postgres, seeds the demo account, and
drives the entire product over HTTP — auth, paywall, reviews, AI drafts,
widget routing, demo login — then serves the production frontend build and
checks it. **35 checks, ~15 seconds, zero setup.** If this passes, the product
works. (The full test suite: `npm run test:memory` — 69 API tests against an
in-memory DB; `npm test` runs everything against a real Postgres.)

## Deploy in ~15 minutes

See **[DEPLOY.md](DEPLOY.md)** for the full walkthrough. Short version:

1. **Neon** (or any Postgres) — free tier, copy the connection string
2. **Vercel** — import this repo; it builds the frontend and serves the API
   as a serverless function from `/api` (config already in `vercel.json`)
3. Set env vars (DB, `JWT_SECRET`, Stripe keys, `FRONTEND_URL`)
4. `npm run seed:demo` against the production DB → demo login goes live
5. Stripe webhook → `https://your-app.vercel.app/api/billing/webhook`

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string (also accepts `POSTGRES_URL`, `NILEDB_POSTGRES_URL`, …) |
| `JWT_SECRET` | yes | token signing |
| `STRIPE_SECRET_KEY` | for billing | checkout + portal |
| `STRIPE_PRICE_ID` | for billing | $49/mo price id |
| `STRIPE_WEBHOOK_SECRET` | for billing | verifies webhook events |
| `FRONTEND_URL` | for billing | Stripe redirect target |
| `DEEPSEEK_API_KEY` | optional | AI drafts (canned fallback otherwise) |
| `RESEND_API_KEY` | optional | unhappy-customer emails |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional | Google review import |
| `DEMO_EMAIL` / `DEMO_PASSWORD` | optional | demo account credentials (defaults shown above) |

## Architecture

```
/frontend          React SPA (landing, auth, dashboard, reviews, alerts, settings)
  src/pages        Landing, Login, Register, Pricing, Privacy, Terms, 404, …
  src/components   Layout, WidgetPreview (live widget demo in dashboard)
/backend           Express API
  src/routes       auth, reviews, business, billing, widget, google
  src/models       User, Review, Feedback (pg)
  src/services     claude.js (AI drafts + sentiment + fake detection),
                   googleBusiness.js (GBP OAuth + sync)
  src/middleware   auth (JWT + trial state), requireActive (paywall), errors
  scripts          migrate.js, seed-demo.js, smoke.js
  test             api / db / env / services / deploy-config suites
/api/index.js      Vercel serverless entry (same Express app)
vercel.json        frontend build + /api rewrite
```

Key design decisions:

- **Paywall is server-side** — `requireActive` gates every paid route; a lapsed
  user can still reach auth/billing, so they can always pay to get back in.
- **The widget never breaks for a lapsed business** — it lives on the
  customer's site; submissions are still recorded.
- **AI is only called on demand** (user clicks "AI Draft") — no background
  polling, no cost when idle.
- **Graceful degradation** — missing keys disable features with clear boot-time
  config reports, never silent breakage.
- **Multi-provider DB config** — connection string auto-detected across
  Neon/Vercel Postgres/Nile/Supabase naming conventions.

## Operating costs (free tiers cover early traction)

| Service | Free tier | Paid at scale |
|---|---|---|
| Vercel (hosting) | 100 GB bandwidth | ~$20/mo pro |
| Neon (Postgres) | 0.5 GB, 1 project | ~$19/mo |
| Stripe | 2.9% + 30¢ per transaction | — |
| Resend (email) | 3,000 emails/mo | ~$20/mo |
| DeepSeek (AI) | pay-per-token, ~$0.0001/draft | trivial |

At 100 paying customers ($4,900 MRR) infra costs are under $50/month.

## Testing

```bash
cd backend
npm run test:memory   # full API suite against in-memory Postgres (no setup)
npm run test:unit     # db/config/services unit tests (real pg driver)
npm test              # everything, against a real Postgres (CI does this)
npm run smoke         # end-to-end product verification
```

CI (`.github/workflows/test.yml`) runs the backend suite against real
Postgres and builds the frontend on every push/PR.

## Roadmap (what a new owner could build next)

- Yelp / Facebook / TripAdvisor review import (same pattern as Google)
- Auto-post approved AI replies to Google (with owner approval queue)
- Review response templates + per-platform reply publishing
- Multi-location support and team seats
- Weekly reputation report emails
- Public profile pages / review widgets for social proof
- Annual plan, annual discount, coupon codes

## Selling points

- **Complete, not a starter** — auth, billing, paywall, widget, AI, alerts,
  legal pages, demo account, docs, tests, CI, deploy config. Everything a
  buyer needs to launch, not to build.
- **The hard parts are done** — Stripe webhooks, server-side paywall, OAuth,
  rate limiting, DB migrations, health checks, error handling that doesn't
  leak internals.
- **Verifiable in one command** — `npm run smoke` proves the whole product
  works; the automated API and service suites back it up.
- **Cheap to run** — free tiers cover the first ~100 customers.
- **Clear niche, clear price** — local businesses, $49/mo, 14-day trial,
  measurable ROI (more 5-star reviews, fewer public complaints).

See [LISTING.md](LISTING.md) for a ready-to-paste marketplace listing.

## License

MIT — see [LICENSE](LICENSE) if present; otherwise all rights reserved by
the author.

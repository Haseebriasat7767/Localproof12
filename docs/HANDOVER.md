# LocalProof — Technical Handover

Everything a buyer needs to own, run, deploy, and extend LocalProof. This
document assumes no prior knowledge of the codebase.

---

## 1. What the product does

LocalProof is a subscription SaaS for local businesses (cafés, salons,
clinics, trades, restaurants). The loop:

1. The business embeds a **feedback widget** on their site (one `<script>` tag).
2. Customers rate their experience and optionally leave a comment. Every rating
   gets the **same** flow and the same optional public-review link — there is no
   rating-based gating (this is deliberate; see §7 Legal/Compliance).
3. Low ratings (≤3) are flagged **unhappy** and emailed to the owner (Resend) so
   they can recover the customer privately.
4. Reviews (imported from Google Business Profile, or added manually) land in a
   **dashboard** where the owner filters them, reads AI-drafted **replies** in
   their chosen tone, edits, and saves.
5. **Suspicious-review heuristics** flag likely-fake reviews for human review.

Monetization: 14-day free trial → **$49/month** via Stripe. A paywall blocks the
product surface once a trial lapses, but leaves account + billing reachable so a
lapsed user can resubscribe.

---

## 2. Architecture

```
Browser ── React SPA (frontend/build) ──┐
                                         │  same origin (/api) in single-container mode
                                         ▼
                              Express app (backend/src/app.js)
                               ├─ /api/auth      register, login, me, trial, tone
                               ├─ /api/reviews   list, manual add, AI draft, reply, stats
                               ├─ /api/business  profile, alerts, feedback
                               ├─ /api/billing   Stripe checkout, portal, webhook
                               ├─ /api/widget    public embed + feedback submit
                               ├─ /api/google    OAuth connect, locations, link, sync
                               ├─ /health, /healthz
                               └─ (opt-in) static frontend + SPA fallback
                                         │
                                         ▼
                                   PostgreSQL
                               users · reviews · feedback
```

External services (all optional except the DB): DeepSeek (AI drafts), Stripe
(billing), Resend (email), Google Business Profile (review import).

**Two deployment shapes are supported by the same code:**

- **Split (default, production):** frontend static-hosted on Vercel; `/api`
  served by the Vercel serverless function at `api/index.js` (which just
  re-exports `backend/src/app.js`), or the Express server on Railway
  (`backend/src/index.js`). `SERVE_FRONTEND` is unset, so the API serves JSON only.
- **Single container (demo / simple hosting):** set `SERVE_FRONTEND=1` and the
  Express server also serves `frontend/build` with an SPA fallback. This is what
  `npm run demo` uses. It changes nothing when the flag is off.

---

## 3. Data model

Schema is created idempotently by `backend/src/db.js` (`CREATE TABLE IF NOT
EXISTS` + additive `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` migrations). Run it
once with `npm run migrate`, then optionally set `SKIP_DB_INIT=1` in production
to skip the round-trip on every cold start.

**users** — `id`, `name`, `email` (unique), `password` (bcrypt, cost 12),
`business_name`, `plan` (`trialing` | `pro` | `free`), `stripe_customer_id`,
`stripe_subscription_id`, `google_connected`, `google_tokens` (JSONB, never
serialized to clients), `google_account_id`, `google_location_id`,
`google_location_name`, `review_url`, `tone`, `trial_ends_at`
(default `NOW() + 14 days`), `created_at`.

**reviews** — `id`, `user_id` (FK → users, cascade), `platform`, `review_id`
(unique per user: `UNIQUE(user_id, review_id)`), `author_name`, `rating`
(1–5, CHECK), `text`, `date`, `replied`, `reply_text`, `reply_draft`,
`sentiment`, `is_fake_suspected`, `fake_reasons` (TEXT[]), `created_at`.

**feedback** (widget submissions) — `id`, `user_id` (FK → users, cascade),
`customer_name`, `customer_email`, `rating` (1–5, CHECK), `comment`,
`is_unhappy`, `alert_sent`, `source`, `created_at`.

Models (`backend/src/models/*`) are plain objects that wrap SQL but expose a
Mongoose-style API (`findOne`, `findByIdAndUpdate`, `countDocuments`,
`aggregate`, …) — the project was migrated off MongoDB, and this kept the routes
unchanged. All queries are parameterized (no string interpolation of user input).

---

## 4. API surface

All product routes are under `/api`. Authenticated routes require
`Authorization: Bearer <JWT>` (7-day expiry). Paid routes additionally pass
`requireActive` (active trial or paid subscription) and return **402** otherwise.

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | — | Creates account on a trial; rate-limited |
| POST | `/api/auth/login` | — | Rate-limited; uniform error on bad creds |
| GET | `/api/auth/me` | ✅ | Reachable even when lapsed |
| GET | `/api/auth/trial` | ✅ | Trial status / days left |
| PATCH | `/api/auth/tone` | ✅ | Reply-tone preference |
| GET | `/api/reviews` | ✅💳 | Filters: `sentiment`, `replied`, `platform`, `page`, `limit` |
| POST | `/api/reviews/manual` | ✅💳 | Derives sentiment + fake flags on write |
| POST | `/api/reviews/:id/draft` | ✅💳 | AI draft (DeepSeek or fallback) |
| PATCH | `/api/reviews/:id/reply` | ✅💳 | Save final reply, mark replied |
| GET | `/api/reviews/stats` | ✅💳 | Dashboard aggregates |
| PATCH | `/api/business/profile` | ✅💳 | business name, tone, `review_url` (HTTPS-validated) |
| GET | `/api/business/alerts` | ✅💳 | Unhappy feedback |
| GET | `/api/business/feedback` | ✅💳 | All widget feedback |
| POST | `/api/billing/checkout` | ✅ | Stripe Checkout (subscription) |
| POST | `/api/billing/portal` | ✅ | Stripe customer portal |
| POST | `/api/billing/webhook` | — | Signature-verified; flips plan to `pro`/`free` |
| GET | `/api/widget/:userId/embed` | — | Returns the `<script>` embed snippet |
| POST | `/api/widget/:userId/submit` | — | Public; validated, rate-limited, emails if unhappy |
| GET | `/api/google/connect` | ✅ | Returns OAuth URL (signed short-lived state) |
| GET | `/api/google/callback` | — | Google redirect target |
| GET | `/api/google/locations` | ✅ | List Business Profile locations |
| POST | `/api/google/link` | ✅ | Persist chosen location |
| POST | `/api/google/sync` | ✅💳 | Import new reviews (idempotent upsert) |
| GET | `/health`, `/healthz` | — | DB reachability / liveness |

**Security posture:** `helmet`, CORS with credentials, `trust proxy` (so rate
limits are per real client behind Vercel/Railway), 1 MB JSON body limit, raw body
only on the Stripe webhook route, central error handler that returns a generic
message for 5xx (never leaks DB/stack details), bcrypt cost 12, Google OAuth
tokens stored server-side and excluded from user serialization.

---

## 5. Third-party account setup

### Stripe (billing) — required to collect revenue
1. Create a **Product** with a **recurring** price of $49/month; copy the Price ID → `STRIPE_PRICE_ID`.
2. Copy the secret key → `STRIPE_SECRET_KEY`.
3. Add a webhook endpoint pointing at `https://<backend>/api/billing/webhook`
   listening to `customer.subscription.created`, `.updated`, `.deleted`; copy the
   signing secret → `STRIPE_WEBHOOK_SECRET`.
4. Set `FRONTEND_URL` so checkout success/cancel redirects land on your domain.

Without `STRIPE_SECRET_KEY`/`STRIPE_PRICE_ID`, checkout is disabled **and** the
paywall still blocks lapsed users — the app logs this critical state at boot
(`backend/src/config/env.js`). Configure Stripe before charging real customers.

### DeepSeek (AI drafts) — optional
Set `DEEPSEEK_API_KEY` (platform.deepseek.com). Without it, drafts fall back to
tone-appropriate canned text, so the feature never hard-fails.

### Resend (alert emails) — optional
Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` (a verified domain/from address).
Without them, unhappy feedback is still recorded and shown in-app; only the email
is skipped.

### Google Business Profile (review import) — optional, and gated by Google
This is the one integration with an external dependency you don't control:
1. Create a Google Cloud project; enable **My Business Account Management**,
   **My Business Business Information**, and **My Business** APIs.
2. Create an OAuth 2.0 Client (Web application); add
   `https://<backend>/api/google/callback` as an authorized redirect URI; set
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`.
3. **Request access** to the Business Profile APIs via Google's access-request
   form. Google reviews this manually and it can take days-to-weeks. Until it's
   approved, `/api/google/locations` and `/sync` return a clear **502** explaining
   that access is pending — this is Google rejecting the call, not a bug.

Until Google is configured, reviews are manual-entry only (fully functional).
The "Connect Google" button returns a clear error rather than failing silently.

---

## 6. Deployment

### Option A — Vercel (frontend + serverless API), recommended
- Import the repo. `vercel.json` already: builds the frontend
  (`frontend && npm run build`), outputs `frontend/build`, rewrites `/api/*` to
  the serverless function, and SPA-rewrites everything else to `index.html`.
- Add a Postgres integration (Neon/Nile/Vercel Postgres). The DSN is picked up
  automatically under `DATABASE_URL`, `POSTGRES_URL`, or `NILEDB_POSTGRES_URL`
  (with or without a store prefix) — see `backend/src/db.js`.
- Set the env vars from §5. Run `npm run migrate` once against the production DB
  (or leave `SKIP_DB_INIT` unset so the first request creates the schema).
- Do **not** set `SERVE_FRONTEND` here (Vercel serves the static build itself).

### Option B — Railway / Render / Fly (single service)
- Build the frontend, then run the backend with `SERVE_FRONTEND=1` so one service
  serves both UI and API on the same origin. Or run them as two services.
- Provide `DATABASE_URL` (managed Postgres add-on), set env vars, `npm run migrate`.
- Healthcheck path: `/healthz` (never depends on the DB, so a slow-waking DB
  won't get the instance killed).

### Option C — Replit
- `.replit` is configured (backend on 3001, frontend on 5000, autoscale deploy).
  Uses Replit PostgreSQL (`DATABASE_URL` auto-provisioned).

**Serverless connection pooling:** `db.js` detects Vercel/Lambda and caps the
pool at 1 connection per instance with a short idle timeout, so many warm
instances can't exhaust the DB's connection limit. Long-lived servers use a
normal pool of 10. Managed Postgres free tiers suspend when idle; the pool uses a
20 s connection timeout to survive the wake, and `/health` is designed to report
"degraded" rather than crash.

---

## 7. Legal / compliance notes for the buyer

- **No review gating.** The widget shows every customer the same flow and the
  same optional public-review link regardless of rating. This is intentional and
  aligns with Google's policies against incentivized/filtered reviews. Keep it
  this way — the landing page and FAQ make this a selling point.
- **Suspicious-review flags are signals, not verdicts.** The UI copy says reviews
  are "flagged for human review," not auto-removed. Nothing deletes or hides
  public reviews.
- **Customer data (PII).** Widget feedback can capture names/emails. If you serve
  EU/UK/California customers you'll want a Privacy Policy, Terms, and a
  data-deletion path. See §9.
- **You must provide your own** Stripe/DeepSeek/Resend/Google accounts; the repo
  contains no secrets (`.env` is git-ignored; only `.env.example` ships).

---

## 8. Cost to operate (indicative)

| Item | Free tier | Typical paid |
|---|---|---|
| Postgres (Neon/Supabase/Railway) | generous free tier | $0–25/mo |
| Hosting (Vercel/Railway) | free tier | $0–20/mo |
| DeepSeek | pay-as-you-go; drafts only fire on click | a few ¢ per draft |
| Resend | 3k emails/mo free | $20/mo at scale |
| Stripe | — | 2.9% + 30¢ per transaction |
| Google Business Profile API | free | free (after approval) |

Cost controls already built in: AI is only called on an explicit "AI Draft"
click (no background polling); sentiment + fake detection are pure code (no API);
review sync is on-demand.

---

## 9. Known limitations & recommended next steps

Honest list for the next owner — none of these block a sale, all are opportunities:

- **Legal pages are stubs.** Landing footer links (Privacy / Terms / Contact /
  Docs) point to `#`. Add real pages (and a support email) before taking EU/UK
  customers or submitting to app marketplaces / ad platforms.
- **Landing "demo" section is illustrative.** It shows feature copy, not live
  product screenshots. Drop in real screenshots or an embedded Loom/iframe of the
  running app (the `npm run demo` build is perfect for capturing these).
- **No onboarding tour.** New signups land on an empty dashboard. A first-run
  checklist (add business name → embed widget → import/add first review) would
  lift activation. `npm run seed` shows the data shape to mimic.
- **Email verification / password reset** are not implemented (login + register
  only). Add if you want self-serve account recovery.
- **Google import** depends on Google's manual API approval (§5). Until granted,
  reviews are manual-entry.
- **Single plan.** Only the $49/mo Pro plan exists; there's no cheaper tier or
  annual discount. The plan/price is easy to extend (Stripe Price + `plan` column).
- **Multi-location.** One Google location per account. Agencies managing many
  locations would need a locations table.
- **Analytics/events.** No product analytics (PostHog/Plausible) wired in.

---

## 10. Handy commands

```bash
# Live demo (embedded Postgres + seed + UI + API on :5000)
cd frontend && npm install && npm run build
cd ../backend && npm install && npm run demo

# Seed a demo business into any configured database
cd backend && DATABASE_URL=postgres://... npm run seed

# Apply schema to a fresh production database
cd backend && DATABASE_URL=postgres://... npm run migrate

# Tests
cd backend && npm run test:all      # FULL suite, zero setup (embedded Postgres)
cd backend && DATABASE_URL=postgres://... JWT_SECRET=test npm test
cd backend && npm run test:unit      # services only, no DB

# Frontend dev server (proxies /api → :3001)
cd frontend && npm install && npm start
```

---

## 11. Brand identity (design language)

- **Name:** LocalProof — "proof" of a business's local reputation.
- **Palette:** deep charcoal/navy background (`#0a0e1a`), warm amber brand
  (`brand-500`, ~#D97706→#F59E0B), emerald success accent (`#10B981`). Deliberately
  **not** the generic SaaS blue.
- **Type:** Plus Jakarta Sans (display) + Inter (body).
- **Voice:** bold, confident, empowering — a coach who knows you can win. Copy is
  honest (no fabricated testimonials or fake counters); social proof is stated as
  verifiable facts.
- **Logo:** `frontend/public/logo.svg`.
- Tailwind theme tokens live in `frontend/tailwind.config.js` (`brand`, `success`).

---

## 12. What transfers in the sale

- Full source (frontend, backend, serverless entry, deploy configs).
- Database schema + migrations + seed/demo scripts.
- Test suite + CI workflow.
- These docs (`README.md`, `docs/HANDOVER.md`, `docs/LISTING.md`) and the `LICENSE`.
- The brand (name, logo, palette, voice) and the marketing/pricing copy.

Not included (buyer supplies their own): Stripe/DeepSeek/Resend/Google accounts,
domains, hosting accounts, and any live customer data. No secrets are in the repo.

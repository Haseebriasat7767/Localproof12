# Deploying LocalProof in ~15 minutes

Everything below uses free tiers. When you're done, you'll have a live SaaS
with billing, a demo account, and health checks.

## 1. Database — Neon (free, ~3 min)

1. Go to [neon.tech](https://neon.tech), sign up, create a project.
2. On the dashboard, copy the **connection string** (it starts with
   `postgresql://...`). Keep the `?sslmode=require` part — the app handles SSL.

That's it. The schema is created automatically on first boot
(`CREATE TABLE IF NOT EXISTS` + idempotent migrations). To pre-create it and
skip per-boot init, run once locally:

```bash
cd backend
DATABASE_URL='postgresql://...' npm run migrate
# then set SKIP_DB_INIT=1 in the deployment env
```

## 2. Host — Vercel (free, ~5 min)

The repo is pre-configured for Vercel: `vercel.json` builds `frontend/` and
serves the Express app as a serverless function at `/api` (via
`api/index.js`). Same origin, so the frontend calls `/api/...` directly.

1. Push this repo to your own GitHub account (or import it directly).
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Vercel auto-detects the config. Set the **root directory** to the repo root
   (not `frontend/`).
4. Add environment variables (from `backend/.env.example`):

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | the Neon connection string |
   | `JWT_SECRET` | any long random string (`openssl rand -hex 32`) |
   | `FRONTEND_URL` | `https://your-project.vercel.app` |
   | `BACKEND_URL` | same as `FRONTEND_URL` (used for widget embed code) |
   | `STRIPE_SECRET_KEY` | from step 3 |
   | `STRIPE_PRICE_ID` | from step 3 |
   | `STRIPE_WEBHOOK_SECRET` | from step 4 |
   | `DEEPSEEK_API_KEY` | optional — [platform.deepseek.com](https://platform.deepseek.com) |
   | `RESEND_API_KEY` | optional — [resend.com](https://resend.com) (3k emails/mo free) |

5. Deploy. First deploy takes ~1-2 minutes.

Verify: `https://your-project.vercel.app/healthz` → `{"status":"ok"}` and
`/health` → `{"status":"ok","database":{"state":"connected"}}`.

## 3. Payments — Stripe (~5 min)

1. [Stripe dashboard](https://dashboard.stripe.com) → **Developers → API keys**.
   Copy the **secret key** (`sk_test_...` for testing, `sk_live_...` for real).
2. **Products** → create a product "LocalProof Pro", price **$49.00 USD,
   recurring monthly**. Copy the **Price ID** (`price_...`).
3. In Vercel, add the three Stripe variables above.
4. **Webhook**: Stripe → **Developers → Webhooks** → add endpoint
   `https://your-project.vercel.app/api/billing/webhook`, events:
   `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Copy the **signing secret** (`whsec_...`)
   into `STRIPE_WEBHOOK_SECRET`.
5. Redeploy (or just save env — Vercel picks it up on next request).

Test the loop end-to-end with Stripe test cards (e.g. `4242 4242 4242 4242`,
any future expiry, any CVC): register → trial works → force-expire the trial
in the DB (or wait) → paywall appears → subscribe → webhook upgrades the
account → dashboard unlocks.

## 4. Demo account (~1 min)

So visitors can click through the product from the login page:

```bash
cd backend
DATABASE_URL='postgresql://...' npm run seed:demo
```

Creates `demo@localproof.app` / `demo1234` (override with `DEMO_EMAIL` /
`DEMO_PASSWORD`) with sample reviews, a saved reply, a flagged fake review,
and unhappy-customer alerts. The login page then shows an
**"Explore the live demo"** button. The demo account is marked paid, so it
never hits the trial paywall.

## 5. Optional: Google Business Profile import

Importing real reviews requires a Google Cloud OAuth client, and Google gates
the Business Profile APIs behind **manual approval** (days to weeks):

1. [console.cloud.google.com](https://console.cloud.google.com) → new project →
   enable "My Business Account Management", "My Business Business Information",
   and "My Business" APIs.
2. OAuth 2.0 Client ID (web) → authorized redirect URI:
   `https://your-project.vercel.app/api/google/callback`
3. Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI`.
4. Request Business Profile API access via Google's access request form.

Until approved, Settings shows a clear 502 from Google — reviews stay
manual-entry only. Everything else works without it.

## 6. Optional: custom domain & email

- Vercel → **Settings → Domains** → add yours; update `FRONTEND_URL`.
- Resend → add your domain to send alerts from `you@yourdomain.com`
  (set `RESEND_FROM_EMAIL`).

## After deploy: prove it works

```bash
cd backend
npm run smoke          # full end-to-end check against a local in-memory DB
```

And click through the live site: landing → register → dashboard → add a
review → AI draft → reply → alerts (live widget preview) → settings →
pricing. Then log out and use **Explore the live demo**.

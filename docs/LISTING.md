# LocalProof — Acquisition Listing

_Copy for a marketplace listing (Acquire.com, Flippa, Microns, etc.). Rewrite the
bracketed fields to match your actual numbers before publishing._

---

## Headline

**LocalProof — Production-ready AI review & reputation manager for local
businesses ($49/mo SaaS, Stripe billing live, deploy in an afternoon)**

## One-liner

A complete, working SaaS that lets cafés, salons, clinics, and trades collect
honest feedback, respond to reviews with AI, flag fake reviews, and win back
unhappy customers — sold as a turnkey product with billing already wired.

---

## Why this is worth buying

- **It's finished, not a prototype.** Auth, trials, paywall, Stripe checkout +
  portal + webhook, AI reply drafts, sentiment analysis, fake-review detection,
  an embeddable feedback widget, Google Business Profile import, a dashboard, and
  a marketing/pricing site are all built and working.
- **Revenue plumbing is done.** The hard, boring parts of a subscription business
  — free trial → paywall → Stripe → webhook → plan upgrade/downgrade — are
  implemented and tested. You can start charging on day one.
- **Cheap to run.** AI fires only when a user clicks "AI Draft" (no background
  polling). Sentiment and fake detection are pure code (no API cost). Runs within
  free tiers of Postgres/hosting at low volume.
- **Deployable in an afternoon.** One-command Vercel deploy (frontend +
  serverless API) or a single Railway container. Managed Postgres is picked up
  automatically from any provider's env var.
- **Engineered for handover.** Provider-agnostic DB resolution, boot-time config
  reporting, `/health` + `/healthz` probes, serverless-aware connection pooling,
  a central error handler that never leaks internals, and a real test suite with
  CI.
- **Compliance-conscious design.** No review gating (same flow for every rating),
  which aligns with Google's review policies — a genuine differentiator and a
  marketing angle already written into the landing copy.

## Proof it works

Run the live demo (no accounts or cloud DB needed):

```bash
cd frontend && npm install && npm run build
cd ../backend && npm install && npm run demo
# open http://localhost:5000 → demo@localproof.app / demo1234
```

You'll land in a seeded dashboard with real reviews, AI drafts, suspicious-review
flags, and unhappy-customer alerts. `npm test` runs the backend suite against
Postgres; GitHub Actions runs it on every push.

---

## Feature list (buyer-facing)

- 14-day free trial, then $49/month (Stripe subscription + customer portal).
- Embeddable feedback widget — one `<script>` tag; unbiased flow for all ratings.
- Unhappy-customer alerts (in-app + email via Resend).
- Review inbox with filters (sentiment / replied / platform) + pagination.
- AI reply drafts in 3 brand tones (DeepSeek), human-approved before sending.
- Suspicious-review heuristics + plain-language sentiment analysis.
- Google Business Profile review import (OAuth + on-demand sync).
- Reputation dashboard (total, average rating, pending, suspicious, recents).
- Polished marketing site: landing, pricing, login, register.

## Tech

React 18 + Tailwind (CRA) · Node 22 + Express 4 · PostgreSQL (`pg`) · DeepSeek ·
Stripe · Resend · JWT/bcrypt · Vercel/Railway/Replit deploy configs · `node:test`
+ GitHub Actions CI.

## Monetization

Single plan at **$49/month** (Stripe). Trials convert to paid via a paywall that
still lets lapsed users reach billing to resubscribe. Easy to add an annual
discount, a cheaper tier, or per-location pricing.

## What's included in the sale

- 100% of the source code (frontend, backend, serverless entry, deploy configs).
- Database schema, migrations, and seed/demo scripts.
- Test suite + CI workflow.
- Full docs: `README.md`, `docs/HANDOVER.md` (technical), this listing.
- Brand: name, logo, color/type system, and marketing copy.
- Proprietary `LICENSE` — full ownership transfers on sale.

**Not included (you bring your own):** Stripe/DeepSeek/Resend/Google accounts,
domain, hosting accounts, and any live customer data. **No secrets ship in the
repo** — only `.env.example`.

## Growth ideas for the new owner

- Add a self-serve onboarding tour + first-run checklist to lift trial→paid.
- Ship a cheaper solo tier and an annual plan; add per-location pricing for chains.
- Add more review sources (Yelp, Facebook) alongside Google.
- Productize the "no review gating / Google-compliant" angle for agencies.
- Email verification + password reset for self-serve account recovery.
- Product analytics (PostHog/Plausible) and lifecycle email (trial-ending, win-back).

## Operational status (fill in your real numbers)

- **Revenue (MRR):** [$0 pre-launch / $X]
- **Customers:** [N]
- **Traffic:** [sessions/mo]
- **Churn:** [%]
- **Run cost:** [~$X/mo]
- **Time to run:** [~X hrs/week]
- **Reason for selling:** [focus / bandwidth / etc.]

## Known limitations (disclosed)

Legal pages are stubs (Privacy/Terms/Contact → to be written), no onboarding tour
yet, Google import depends on Google's manual API approval, single plan only, no
email verification/password reset. Full detail in `docs/HANDOVER.md` §9.

## Asking

**[$X,XXX]** — or best offer. Includes a handover call and [30] days of post-sale
support. Serious buyers can run the demo above before committing.

---

_Contact: [your email / listing inbox]._

# Marketplace listing — LocalProof (copy-paste ready)

> Adapt the bracketed bits before posting. Works for MicroAcquire,
> SideProjectors, Flippa, or a direct sale. Asking price: **$5,000**.

---

## Title

**LocalProof — AI review-management SaaS for local businesses (Stripe billing built in, $49/mo)**

## Tagline

Turn happy customers into 5-star Google reviews — and catch unhappy ones before they post.

## Description

LocalProof is a complete, production-ready SaaS for local businesses
(restaurants, cafés, salons, trades, clinics — anyone who lives and dies by
their Google reviews).

**The product:** a one-line embeddable widget asks every customer how their
experience was. Happy customers (4-5★) are routed straight to the business's
Google review page. Unhappy customers (1-3★) get a private feedback form —
and the owner gets an instant email alert, so the problem is fixed before it
ever becomes a public review. A dashboard tracks every review, flags fake
ones, analyzes sentiment, and drafts AI replies in the business's own tone.

**Monetization is built in and tested:** 14-day free trial → $49/month via
Stripe (checkout, webhook, customer portal). The paywall is enforced
server-side. No MRR yet — this is a fully built, pre-launch product.

**What's included:**
- React + Tailwind frontend (landing, pricing, auth, dashboard, reviews,
  alerts, settings, privacy, terms, 404)
- Node.js + Express + PostgreSQL API
- Stripe subscription billing end-to-end (checkout → webhook → account
  upgrade → portal)
- Server-side trial paywall (402 responses, lapsed users can still pay)
- Embeddable feedback widget with smart happy/unhappy routing (the core
  product loop, fully wired)
- AI reply drafts (DeepSeek, with graceful fallback), sentiment analysis,
  fake-review detection
- Unhappy-customer email alerts (Resend)
- Google Business Profile review import (OAuth + sync)
- Seeded demo account + "Explore the live demo" button on the login page
- Live widget preview inside the dashboard
- Health checks, rate limiting, security headers, error handling
- Automated API, service, and config tests + CI (GitHub Actions) + one-command full-stack smoke
  test (`npm run smoke` — 35 end-to-end checks, no infrastructure needed)
- Deploy config for Vercel + a 15-minute deploy guide (DEPLOY.md)
- README, DEPLOY.md, and this listing

**Tech stack:** React 18, Tailwind, React Router · Node.js, Express,
PostgreSQL · Stripe · Resend · DeepSeek (OpenAI-compatible) · Vercel

**Costs to run:** free tiers (Vercel, Neon, Resend) cover the first ~100
customers; under $50/month at 100 paying customers.

## Why it's a good buy

- **Complete, not a starter.** Auth, billing, paywall, widget, AI, alerts,
  legal pages, demo account, docs, tests, CI, deploy config — everything
  needed to launch, not to build.
- **Verifiable in one command.** `npm run smoke` boots the real API and
  drives the entire product over HTTP. The automated test suites back it up.
- **Cheap to run, clear niche, clear price.** Local businesses, $49/mo,
  measurable ROI (more 5-star reviews, fewer public complaints).
- **Growth paths are obvious:** Yelp/Facebook import, auto-published replies,
  multi-location, team seats, annual plans.

## Revenue / metrics

- MRR: $0 (pre-launch, fully built)
- Pricing: $49/month, 14-day free trial
- Tests: 69 API/service + 45 unit passing · Smoke: 35/35 end-to-end checks passing
- Code quality: migrated MongoDB→Postgres, server-side paywall, no leaked
  internals in errors, rate-limited public endpoints

## What's NOT included (honest list)

- Google Business Profile API access is gated by Google's manual approval
  (days-weeks); until then reviews are manual-entry or widget-captured
- No paying customers yet — marketing and launch are up to the buyer
- AI drafts use DeepSeek (cheap); swap to any OpenAI-compatible provider

## Asking price

**$5,000** — priced for a complete, tested, deployable SaaS with billing
built in (comparable starter kits sell for $1-2k unfinished; this one runs).
Open to reasonable offers. Serious buyers only — happy to walk through a
live demo (the demo account is one click from the login page).

## Included in the sale

- Full source code + git history
- Transfer of the repo (or fork + private copy)
- DEPLOY.md walkthrough (Neon + Vercel + Stripe, ~15 min)
- Help getting your first deployment live (env vars, Stripe webhook)
- 30 days of email support for setup questions

## Suggested first 90 days (for the buyer)

1. Week 1: deploy (DEPLOY.md), seed demo account, connect Stripe, test one
   real $49 payment end-to-end.
2. Week 2-4: post in 3-5 niche communities (e.g. r/restaurateur,
   r/smallbusiness, local chamber groups, Facebook groups for salon/trade
   owners). Offer the free trial; the widget's "before it goes public" pitch
   converts.
3. Month 2: collect 10-20 trial signups, interview them, fix what they
   touch. Ship the #1 requested feature (likely Yelp import or reply
   templates).
4. Month 3: first paid conversions. At $49/mo, 10 customers = $490 MRR;
   100 customers = $4,900 MRR at <$50/mo infra cost.

# Marketplace listing — LocalProof (copy-paste ready)

> Adapt the bracketed bits before posting. Works for MicroAcquire,
> SideProjectors, Flippa, or a direct sale. Asking price: **$5,000**.

---

## Title

**LocalProof — AI review-management SaaS for local businesses (Stripe billing built in, $49/mo)**

## Tagline

Make it easy for every customer to review you on Google — and give them a private channel for feedback.

## Description

LocalProof is a complete, production-ready SaaS for local businesses
(restaurants, cafés, salons, trades, clinics — anyone who lives and dies by
their Google reviews).

**The product:** a one-line embeddable widget asks every customer how their
experience was, then shows every customer the same two options: a link to
leave a Google review, and a separate private feedback form. The owner gets an
email alert when private feedback comes in. A dashboard tracks every review,
flags suspicious ones, analyzes sentiment, and drafts AI replies in the
business's own tone.

**Monetization is built in:** 14-day free trial → $49/month via Stripe
(checkout, webhook, customer portal). The paywall is enforced server-side.
Stripe has not yet been tested with live keys. No MRR yet: this is a
pre-launch product.

**What's included:**
- React + Tailwind frontend (landing, pricing, auth, dashboard, reviews,
  alerts, settings, privacy, terms, 404)
- Node.js + Express + PostgreSQL API
- Stripe subscription billing end-to-end (checkout → webhook → account
  upgrade → portal)
- Server-side trial paywall (402 responses, lapsed users can still pay)
- Embeddable feedback widget: Google review link and private feedback form
  shown to every visitor (the core product loop)
- AI reply drafts (DeepSeek, with graceful fallback), sentiment analysis,
  fake-review detection
- Private-feedback email alerts for low ratings (Resend)
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
- Tests (last run): `npm test` against real PostgreSQL 92/92 · `test:memory` 68/68 · `test:unit` 47/47 · `smoke` 36/36 end-to-end checks
- Code quality: migrated MongoDB→Postgres, server-side paywall, no leaked
  internals in errors, rate-limited public endpoints

## What's NOT included (honest list)

- Google Business Profile API access is gated by Google's manual approval
  (days-weeks); until then reviews are manual-entry or widget-captured
- Google review import has not been tested against a live Google account
- Stripe checkout, webhook and portal have not been tested with live keys.
  Without Stripe keys, a customer whose trial has ended cannot pay
- DeepSeek and Resend have not been tested with live keys (canned AI replies
  and no alert emails until they are configured)
- Legal pages (Privacy, Terms) are drafts and have not been reviewed by a lawyer.
  Contact addresses (privacy@ / legal@ / hello@localproof.app) are placeholders
  you must replace with mailboxes you control
- The live demo account is shared and writable by anyone who logs in
- No paying customers yet — marketing and launch are up to the buyer
- AI drafts use DeepSeek (cheap); swap to any OpenAI-compatible provider

## Asking price

**$5,000** — the seller's asking price for the code, deployment guide and
30 days of support. It is not backed by revenue or comparable sales data.
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

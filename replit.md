# LocalProof — AI Review Manager for Local Businesses

## Overview
LocalProof is an AI-powered review management platform for local businesses. It helps business owners monitor reviews, detect fake reviews, generate AI-drafted responses (via Claude), and manage customer feedback through an embeddable widget and dashboard.

## Architecture
- **Frontend**: React 18 + Tailwind CSS + React Router v6 (Create React App), runs on port 5000
- **Backend**: Node.js + Express, runs on port 3001
- **Database**: Replit PostgreSQL (migrated from MongoDB)
- **AI**: Claude Haiku (Anthropic API) for review response drafts
- **Payments**: Stripe (optional)
- **Email**: Resend (optional)
- **Auth**: JWT + bcryptjs

## Project Layout
```
/frontend   — React app (port 5000)
/backend    — Express API (port 3001)
  src/
    index.js       — Entry point
    db.js          — PostgreSQL pool + schema init
    models/        — User, Review, Feedback (pg-based)
    routes/        — auth, reviews, business, billing, widget
    middleware/    — JWT auth middleware
    services/      — claude.js (AI + sentiment + fake detection)
```

## Running the App
- **Frontend**: `cd frontend && npm start` → port 5000
- **Backend**: `cd backend && npm start` → port 3001

## Environment Variables
The following secrets need to be configured for full functionality:
- `DATABASE_URL` — Auto-provisioned by Replit PostgreSQL
- `JWT_SECRET` — Set in `backend/.env` (default provided for dev)
- `CLAUDE_API_KEY` — Anthropic API key (for AI reply drafts)
- `STRIPE_SECRET_KEY` — Stripe secret (for billing)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook secret
- `STRIPE_PRICE_ID` — Stripe price ID for Pro plan
- `RESEND_API_KEY` — Resend API key (for email alerts)

## Key Notes
- Backend migrated from Mongoose/MongoDB to `pg` (PostgreSQL) to use Replit's built-in database
- `phosphor-react` had broken ESM files in v1; replaced with `lucide-react` in Landing.js
- CORS is set to `origin: true` to allow the Replit proxy to work in development
- Frontend uses `DANGEROUSLY_DISABLE_HOST_CHECK=true` and `HOST=0.0.0.0` for Replit compatibility

## User Preferences
- Keep code clean and maintainable
- Functional software over mocked data

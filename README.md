# LocalProof — AI Review Manager for Local Businesses

## Stack
- **Frontend:** React + Tailwind CSS + React Router
- **Backend:** Node.js + Express + PostgreSQL
- **AI:** DeepSeek Chat (OpenAI-compatible API)
- **Payments:** Stripe
- **Email:** Resend
- **Deploy:** Vercel (frontend + serverless API) / Railway (backend)

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your keys
npm run dev
```

### Frontend
```bash
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
npm start
```

## What's Built
- ✅ Auth (register/login/JWT)
- ✅ Review management (add, filter, AI reply draft)
- ✅ Google Business Profile import (OAuth connect + review sync)
- ✅ Fake review detection (heuristic, no API cost)
- ✅ Unhappy customer widget + email alerts
- ✅ Stripe billing (checkout + webhook + portal)
- ✅ Dashboard with stats
- ✅ Landing page + Pricing page
- ✅ Settings (tone, business name, Google connection)

## Keys Needed from Haseeb
- [ ] PostgreSQL connection string (`DATABASE_URL`)
- [ ] Stripe secret key + price ID
- [ ] Resend API key (free tier: resend.com)
- [ ] DeepSeek API key (platform.deepseek.com)
- [ ] Google OAuth client ID + secret (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) — see below
- [ ] Hosting: Vercel (frontend + serverless API) / Railway (backend)

## Google Business Profile setup
Importing real reviews requires a Google Cloud OAuth client, and Google
gates the Business Profile APIs behind manual approval — this is not
instant, budget a few days to weeks:

1. Create a project at console.cloud.google.com and enable the
   "My Business Account Management", "My Business Business Information",
   and "My Business" APIs.
2. Create an OAuth 2.0 Client ID (Web application), add
   `<BACKEND_URL>/api/google/callback` as an authorized redirect URI, and
   set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` from it.
3. Request access to the Business Profile APIs via Google's access request
   form — until that's approved, `/settings` will show a 502 error when
   listing locations or syncing, which is Google rejecting the request, not
   a bug in this app.
4. Once approved, a user connects from Settings → Google Business Profile,
   picks a location, and can sync reviews on demand.

Without `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` set, the "Connect Google"
button returns a clear error instead of silently failing — reviews stay
manual-entry only until it's configured.

## Cost Optimization
- AI only called when user clicks "AI Draft" — no background polling
- Fake detection is pure code (no API)
- Sentiment analysis is pure code (no API)
- Uses DeepSeek Chat (falls back to a canned reply if no API key is set)

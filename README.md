# LocalProof — AI Review Manager for Local Businesses

## Stack
- **Frontend:** React + Tailwind CSS + React Router
- **Backend:** Node.js + Express + MongoDB
- **AI:** Claude Haiku (cheapest, ~$0.25/1M tokens)
- **Payments:** Stripe
- **Email:** Resend
- **Deploy:** Vercel (frontend) + Railway (backend)

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
- ✅ Fake review detection (heuristic, no API cost)
- ✅ Unhappy customer widget + email alerts
- ✅ Stripe billing (checkout + webhook + portal)
- ✅ Dashboard with stats
- ✅ Landing page + Pricing page
- ✅ Settings (tone, business name)

## Keys Needed from Haseeb
- [ ] MongoDB URI (free: mongodb.com/atlas)
- [ ] Stripe secret key + price ID
- [ ] Resend API key (free tier: resend.com)
- [ ] Claude API key (Anthropic)
- [ ] Hosting: Vercel + Railway (both free tier)

## Cost Optimization
- AI only called when user clicks "AI Draft" — no background polling
- Fake detection is pure code (no API)
- Sentiment analysis is pure code (no API)
- Uses Claude Haiku (10x cheaper than Sonnet)

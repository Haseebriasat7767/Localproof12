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
- ✅ Fake review detection (heuristic, no API cost)
- ✅ Unhappy customer widget + email alerts
- ✅ Stripe billing (checkout + webhook + portal)
- ✅ Dashboard with stats
- ✅ Landing page + Pricing page
- ✅ Settings (tone, business name)

## Keys Needed from Haseeb
- [ ] PostgreSQL connection string (`DATABASE_URL`)
- [ ] Stripe secret key + price ID
- [ ] Resend API key (free tier: resend.com)
- [ ] DeepSeek API key (platform.deepseek.com)
- [ ] Hosting: Vercel (frontend + serverless API) / Railway (backend)

## Cost Optimization
- AI only called when user clicks "AI Draft" — no background polling
- Fake detection is pure code (no API)
- Sentiment analysis is pure code (no API)
- Uses DeepSeek Chat (falls back to a canned reply if no API key is set)

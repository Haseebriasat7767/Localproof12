# ChaseAI — Stop Chasing Clients. Start Closing the Books.

AI-powered client follow-up and document collection for US bookkeeping and accounting firms.
ChaseAI chases missing statements, receipts and transaction answers automatically so firms
close the month instead of writing the same follow-up email for the fourth time.

The application lives in **[`/chaseai-app`](./chaseai-app)**.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + shadcn/ui-style components on Radix primitives
- **Framer Motion** for animation, **Recharts** for charts, **lucide-react** for icons

## Running it

```bash
cd chaseai-app
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Routes

| Route | What it is |
|---|---|
| `/` | Marketing landing page (hero, problem, how it works, features, ROI, pricing, FAQ) |
| `/app` | Dashboard — KPIs, client follow-up table, activity feed, AI insight |
| `/app/clients` | Client list, filters, two-step Add Client + workflow setup |
| `/app/clients/[id]` | Client detail — checklist and the **AI Client Chaser** panel |
| `/app/document-requests` | Document requests across all clients |
| `/app/automations` | Visual follow-up sequence builder + automation settings |
| `/app/messages` | Unified inbox (All / Email / SMS / AI Generated / Scheduled) |
| `/app/transaction-questions` | Flagged transactions + AI question generator |
| `/app/analytics` | Collection rate, response time, overdue clients, automation performance |
| `/app/workspace` | Close-period overview and workflow templates |
| `/app/team` | Team roster, roles, invites |
| `/app/integrations` | QuickBooks, Xero, Gmail, Outlook, Stripe, Twilio, Slack (mock state) |
| `/app/settings` | Profile, Firm, Notifications, Security, Billing |
| `/app/billing` | Current plan, usage, invoices, plan grid |
| `/portal/[clientId]` | Client-facing portal — checklist, upload + mock AI document review |

## Demo data only

This is a **UI-first product build**. All data is realistic mock data held in local React
state (`chaseai-app/data/mock.ts` and `components/app/store.tsx`). No external service is
contacted: Supabase, OpenAI, Stripe, Twilio and Resend are not wired up, and no API keys
exist in this repo. "Connect", "Send", "Upgrade" and upload flows simulate their outcome
locally so every screen is fully navigable.

## Legacy code (unrelated)

`/frontend`, `/backend`, `/api`, `/screenshots` and the root `package.json` / `vercel.json`
belong to **LocalProof**, an older, unrelated product that previously lived in this repo.
They are left in place untouched and are not part of ChaseAI.

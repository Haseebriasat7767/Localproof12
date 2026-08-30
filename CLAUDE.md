# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this is

LocalProof is an AI review manager for local businesses. Owners collect reviews
and customer feedback, get AI-drafted replies, see heuristic fake-review flags,
and receive email alerts when an unhappy customer submits feedback through an
embeddable widget. Accounts run on a 14-day trial and then hit a Stripe paywall.

## Repository layout

```
/                     Vercel deployment root
  package.json        Dependency + Node pin for the serverless function (mirrors backend/package.json)
  vercel.json         Builds frontend/, routes /api/* to api/index.js, SPA-rewrites the rest
  api/index.js        Serverless entrypoint — re-exports backend/src/app.js, nothing more
  .replit, replit.md  Legacy Replit workspace config and notes

/backend              Express API (also the Vercel function body)
  src/index.js          Standalone server: loads .env, app.listen(PORT || 3001)
  src/app.js            Express app — middleware, health probes, route mounting
  src/db.js             Connection-string resolution, pg Pool, SCHEMA, initDb()
  src/config/env.js     Boot-time configuration report (checkEnv)
  src/models/           User, Review, Feedback — hand-written pg data access
  src/routes/           auth, reviews, business, billing, widget
  src/middleware/       auth (JWT), requireActive (paywall), errorHandler
  src/services/claude.js  DeepSeek reply drafts + pure-code sentiment/fake detection
  scripts/migrate.js    One-shot schema apply
  test/                 node:test suites

/frontend             Create React App (React 18 + Tailwind + React Router v6)
  src/App.js            Routes and PrivateRoute gate
  src/context/AuthContext.js  Token in localStorage, user state
  src/services/api.js   Single axios instance; all API calls go through here
  src/pages/            Landing, Login, Register, Pricing, Dashboard, Reviews, Alerts, Settings
  src/components/Layout.js  Authenticated shell (sidebar + nav)

/screenshots          Manual QA captures, not used by any code
```

## Running locally

```bash
# Backend — http://localhost:3001
cd backend && npm install
cp .env.example .env      # fill in at least DATABASE_URL and JWT_SECRET
npm run dev               # nodemon; `npm start` for plain node

# Frontend — http://localhost:3000
cd frontend && npm install
npm start                 # CRA dev server; package.json proxies /api to :3001
```

Leave `REACT_APP_API_URL` unset in local development — the CRA `proxy` field
handles it. `frontend/.env.production` pins it to `/api` for the Vercel
same-origin deploy; a split deploy (Railway backend) overrides it in the
hosting dashboard, not in the file.

## Tests

```bash
cd backend
npm test          # all suites (node --test)
npm run test:unit # services only, no database needed
```

- `test/services.test.js`, `test/env.test.js`, `test/db.test.js`,
  `test/deploy-config.test.js` run with no database.
- `test/api.test.js` drives the real HTTP surface with supertest against a real
  Postgres and **skips itself** when `DATABASE_URL` is unset. It `TRUNCATE`s
  `reviews, feedback, users` before each test — never point it at a database
  with data you care about.
- CI (`.github/workflows/test.yml`) runs backend tests on Node 22 against a
  `postgres:16` service container, and separately builds the frontend with
  `CI=true` (so warnings fail the build).

There are no frontend unit tests and no linter — `npm run build` is the only
frontend gate. Run the backend suite before pushing.

## Architecture notes

**One Express app, two deployment shapes.** `backend/src/app.js` exports the app
without listening. `backend/src/index.js` listens (Railway, local);
`api/index.js` re-exports it as a Vercel function. Anything added to `app.js`
works in both. Never call `listen()` from `app.js`.

**Root `package.json` mirrors `backend/package.json`.** Vercel installs the
function's dependencies from the repo root. Adding a backend dependency means
adding it in *both* files, at the same version.

**Database connection strings are resolved, not read.** `db.js`
`resolveConnectionString()` accepts the Postgres URL under any provider's name
(`DATABASE_URL`, `POSTGRES_URL`, `NILEDB_POSTGRES_URL`, …), with or without a
Vercel store prefix, and validates it actually starts with `postgres://`. Do not
reintroduce a bare `process.env.DATABASE_URL` read in application code.
(`scripts/migrate.js` is the one deliberate exception — it is run by hand.)

**Schema init is lazy, memoised, and retried.** `initDb()` applies `SCHEMA`
(idempotent `CREATE TABLE IF NOT EXISTS`) at most once per process, caching only
success — a failure clears the memo so a cold-starting database can be reached
on the next request. A request-level middleware awaits it and returns 503 on
failure. Set `SKIP_DB_INIT=1` after running `npm run migrate` to skip the
round-trip entirely.

**Two health endpoints, deliberately different.** `/healthz` is the platform
liveness probe and must never touch the database — a non-2xx there gets the
instance killed while a free-tier database is merely waking. `/health` reports
database reachability and the *name* (never the value) of the variable the
connection came from.

**Pool tuning is intentional.** `max`/`idleTimeoutMillis` key off `isServerless`
(many warm instances would exhaust connections); `connectionTimeoutMillis` is
20s unconditionally, because slow wake-from-idle is a property of the managed
database, not of the platform. Don't make it conditional again.

**Models are hand-written pg with a Mongoose-shaped surface.** `find`,
`findOne`, `findByIdAndUpdate`, `countDocuments`, `aggregate` are leftovers from
a MongoDB migration. Rows are snake_case in Postgres and camelCase in JSON —
each model has a `_format` mapper and an explicit `colMap` for updates. A new
column needs: `SCHEMA` in `db.js`, `_format`, and `colMap` if it is writable.
`_id` is mirrored to `id` for legacy frontend code.

**`services/claude.js` does not call Claude.** It calls DeepSeek
(`deepseek-chat`, OpenAI-compatible). `analyzeSentiment` and `detectFakeReview`
are pure keyword/heuristic code with no API cost — keep them that way; the AI
call happens only when a user clicks "AI Draft". With no `DEEPSEEK_API_KEY`,
`generateReplyDraft` returns tone-appropriate canned text rather than failing.

**Auth and the paywall.** `middleware/auth.js` verifies the JWT, loads the user,
and derives `isActive` from trial expiry plus an active Stripe subscription.
`middleware/requireActive.js` must run *after* it and returns 402 with
`code: 'SUBSCRIPTION_REQUIRED'`. Every paid surface (`/api/reviews`,
`/api/business`) mounts `router.use(auth, requireActive)` at the top; billing
routes deliberately do not, or an expired user could not pay. On the frontend, a
402 is caught by the axios response interceptor and redirects to
`/pricing?expired=1`. `plan: 'pro'` is only ever set by the Stripe webhook.

**Errors go through `next(err)`.** Routes never echo `err.message` to the
client; `middleware/errorHandler.js` (registered last, 4 args) logs server-side
and returns a generic 500. 4xx messages from body-parser and friends pass
through. The public widget route handles its own errors for the same reason.

**The widget endpoint is unauthenticated and public.** It lives on customers'
own websites, so it validates and length-caps every field, rate-limits, escapes
all user text before it enters the alert email HTML, and never leaks internals.
Treat any change there as security-relevant.

**Rate limiters skip in test.** `NODE_ENV === 'test'` disables them, and
`app.set('trust proxy', 1)` is required so limiters bucket by client IP rather
than the platform proxy's.

## Environment variables

Required: `JWT_SECRET`, plus a Postgres URL under any recognised name.
Optional but feature-gating: `DEEPSEEK_API_KEY` (AI drafts),
`STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID` (checkout), `STRIPE_WEBHOOK_SECRET`
(upgrades), `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (alert emails),
`FRONTEND_URL` (Stripe redirects), `PORT`, `SKIP_DB_INIT`.

`config/env.js` reports all of this at boot with the *consequence* of each
missing value. When adding a feature that depends on a new variable, add it to
`FEATURES` there, to `backend/.env.example`, and cover it in `test/env.test.js`.

## Frontend conventions

- All HTTP goes through `src/services/api.js`. Add a method to the relevant
  export group rather than calling axios from a component.
- Dark theme throughout: charcoal `#0C0C0E` background, amber `brand.*` primary
  (defined in `tailwind.config.js`), emerald for success, red for danger.
  Deliberately no blue. Display font Plus Jakarta Sans, body Inter.
- Icons come from `lucide-react`. Do not add `phosphor-react` — its v1 ESM
  builds broke the CRA build and that is why it was removed.
- Authenticated pages render inside `<PrivateRoute><Layout>…</Layout></PrivateRoute>`;
  Landing, Login, Register and Pricing are public and standalone.

## Working conventions

- Commit subjects are imperative and describe the user-visible effect ("Stop
  leaking internal error details to clients"), not the mechanics. Bodies explain
  the symptom, the wrong assumption, and the fix.
- Comments in this codebase explain *why* a non-obvious choice was made. Match
  that when touching load-bearing code; skip decorative comments elsewhere.
- `README.md` is the contributor-facing summary and `replit.md` is legacy
  workspace context — parts of `replit.md` (port numbers, "Replit PostgreSQL")
  are stale. `db.js`, `app.js` and `config/env.js` are the source of truth.

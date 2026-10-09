#!/usr/bin/env node
// One-command, full-stack smoke test: boots the real Express app against an
// in-memory Postgres (pg-mem — no database to provision), seeds the demo
// account, then drives the entire product over HTTP: auth, trial paywall,
// review management, AI drafts, widget routing, billing state transitions,
// and demo login. If the production frontend build exists, it is served and
// checked too. Exits non-zero on the first failure.
//
//   npm run smoke
//
// This is the fastest way to prove a deployment (or a fresh clone) works
// end to end.

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'smoke_secret';
process.env.PORT = process.env.SMOKE_PORT || '3210';

require('../test/helpers/pgMem');

const http = require('http');
const fs = require('fs');
const path = require('path');

const { seedDemo } = require('./seed-demo');
const { pool, initDb } = require('../src/db');
const app = require('../src/app');

const BASE = `http://127.0.0.1:${process.env.PORT}`;
const FRONTEND_BUILD = path.join(__dirname, '../../frontend/build');

let passed = 0;
let failed = 0;

function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`); }
}

async function api(method, p, { token, body } = {}) {
  const res = await fetch(BASE + p, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, body: json };
}

// Minimal static server for the production frontend build, with SPA fallback.
function serveFrontend(port, root) {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(root, urlPath);
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(port, '0.0.0.0', () => resolve(server)));
}

async function main() {
  console.log('\n== boot & seed ==');
  await initDb(); // also kicked off at app require time; memoised, this just awaits it
  const server = await new Promise(resolve => {
    const s = app.listen(process.env.PORT, '0.0.0.0', () => resolve(s));
  });
  await seedDemo({ initSchema: false });

  console.log('\n== health ==');
  check('healthz ok', (await api('GET', '/healthz')).body.status === 'ok');
  const health = await api('GET', '/health');
  check('health reports connected db', health.status === 200 && health.body.database.state === 'connected', JSON.stringify(health.body));

  console.log('\n== auth flow ==');
  const email = `smoke${Date.now()}@test.com`;
  const reg = await api('POST', '/api/auth/register', { body: { name: 'Smoke Owner', email, password: 'password123', businessName: 'Smoke Biz' } });
  check('register 201 with token', reg.status === 201 && !!reg.body.token);
  const token = reg.body.token;
  const login = await api('POST', '/api/auth/login', { body: { email, password: 'password123' } });
  check('login 200', login.status === 200 && login.body.user.email === email);
  const badLogin = await api('POST', '/api/auth/login', { body: { email, password: 'wrongwrong' } });
  check('wrong password 401, no field leak', badLogin.status === 401 && badLogin.body.error === 'Invalid email or password');
  const me = await api('GET', '/api/auth/me', { token });
  check('me returns user without password hash', me.status === 200 && me.body.user.password === undefined);
  const trial = await api('GET', '/api/auth/trial', { token });
  check('trial active with days left', trial.body.isActive === true && trial.body.daysLeft > 0);

  console.log('\n== review management ==');
  const add = await api('POST', '/api/reviews/manual', { token, body: { authorName: 'Alice', rating: 5, text: 'Amazing service, the best coffee in town, absolutely wonderful', platform: 'google' } });
  check('add review 201 with sentiment', add.status === 201 && add.body.review.sentiment === 'positive', JSON.stringify(add.body));
  const addNeg = await api('POST', '/api/reviews/manual', { token, body: { authorName: 'Bob', rating: 1, text: 'Terrible, horrible, the worst experience, awful and rude' } });
  check('negative sentiment detected', addNeg.body.review.sentiment === 'negative');
  const addFake = await api('POST', '/api/reviews/manual', { token, body: { authorName: 'Bot', rating: 1, text: 'worst ever aaaa' } });
  check('fake review flagged', addFake.body.review.isFakeSuspected === true);
  const draft = await api('POST', `/api/reviews/${add.body.review.id}/draft`, { token });
  check('AI draft returns text', draft.status === 200 && typeof draft.body.draft === 'string' && draft.body.draft.length > 10);
  const reply = await api('PATCH', `/api/reviews/${add.body.review.id}/reply`, { token, body: { replyText: 'Thanks Alice!' } });
  check('save reply marks replied', reply.status === 200 && reply.body.review.replied === true);
  const stats = await api('GET', '/api/reviews/stats', { token });
  check('stats aggregate correctly', stats.body.total === 3 && stats.body.replied === 1 && stats.body.pending === 2, JSON.stringify(stats.body));

  console.log('\n== profile & google review routing ==');
  const prof = await api('PATCH', '/api/business/profile', { token, body: { businessName: 'Smoke Biz', googleReviewUrl: 'https://g.page/r/smoke-biz/review' } });
  check('profile saves google review url', prof.status === 200 && prof.body.user.googleReviewUrl === 'https://g.page/r/smoke-biz/review', JSON.stringify(prof.body));
  const partial = await api('PATCH', '/api/business/profile', { token, body: { tone: 'casual' } });
  check('partial profile update does not 500', partial.status === 200 && partial.body.user.tone === 'casual');

  console.log('\n== widget (public, the core loop) ==');
  const config = await api('GET', `/api/widget/${me.body.user.id}/config`);
  check('widget config serves the review url', config.body.reviewUrl === 'https://g.page/r/smoke-biz/review', JSON.stringify(config.body));
  const happy = await api('POST', `/api/widget/${me.body.user.id}/submit`, { body: { rating: 5, customerName: 'Happy Customer' } });
  check('5-star rating is recorded', happy.status === 200, JSON.stringify(happy.body));
  const unhappy = await api('POST', `/api/widget/${me.body.user.id}/submit`, { body: { rating: 2, customerName: 'Sad Customer', customerEmail: 'sad@test.com', comment: 'Cold coffee' } });
  check('low rating is recorded and private feedback accepted', unhappy.status === 200 && unhappy.body.reviewUrl === undefined, JSON.stringify(unhappy.body));
  const badRating = await api('POST', `/api/widget/${me.body.user.id}/submit`, { body: { rating: 9 } });
  check('invalid rating rejected 400', badRating.status === 400);
  const alerts = await api('GET', '/api/business/alerts', { token });
  check('unhappy feedback appears in alerts', alerts.body.alerts.length === 1 && alerts.body.alerts[0].customerName === 'Sad Customer');
  const embed = await api('GET', `/api/widget/${me.body.user.id}/embed`);
  check('embed code contains submit and config endpoints', /\/api\/widget\/\d+\/submit/.test(embed.body.embedCode) && /\/api\/widget\/\d+\/config/.test(embed.body.embedCode));
  {
    // The embed is shipped to customer websites as-is, so it must parse as
    // valid JS and show both options to every visitor — a broken snippet is a
    // broken product for every site that installs it.
    const match = embed.body.embedCode.match(/<script>([\s\S]*)<\/script>/);
    let ok = false;
    try { new Function(match[1]); ok = true; } catch {}
    check('embed script is syntactically valid JS', ok && /showStars\(\)/.test(match[1]) && /showChoice\(\)/.test(match[1]) && /REVIEW_URL/.test(match[1]));
  }

  console.log('\n== demo account ==');
  const demoStatus = await api('GET', '/api/auth/demo');
  check('demo status available after seed', demoStatus.body.available === true && demoStatus.body.email === 'demo@localproof.app');
  const demoLogin = await api('POST', '/api/auth/demo-login');
  check('demo login issues token', demoLogin.status === 200 && !!demoLogin.body.token && demoLogin.body.user.isDemo === true);
  const demoStats = await api('GET', '/api/reviews/stats', { token: demoLogin.body.token });
  check('demo account has seeded reviews', demoStats.status === 200 && demoStats.body.total >= 5, JSON.stringify(demoStats.body));
  const demoReviews = await api('GET', '/api/reviews', { token: demoLogin.body.token });
  check('demo data includes replied + fake-suspected reviews', demoReviews.body.reviews.some(r => r.replied) && demoReviews.body.reviews.some(r => r.isFakeSuspected));
  const demoMe = await api('GET', '/api/auth/me', { token: demoLogin.body.token });
  check('demo flag survives /me', demoMe.body.user.isDemo === true);

  console.log('\n== paywall ==');
  await pool.query("UPDATE users SET trial_ends_at = NOW() - INTERVAL '1 day' WHERE email = $1", [email]);
  const gated = await api('GET', '/api/reviews/stats', { token });
  check('expired trial → 402 on paid routes', gated.status === 402 && gated.body.code === 'SUBSCRIPTION_REQUIRED');
  const stillAuth = await api('GET', '/api/auth/me', { token });
  check('expired user can still reach account/billing', stillAuth.status === 200);
  const widgetStillWorks = await api('POST', `/api/widget/${me.body.user.id}/submit`, { body: { rating: 3, comment: 'after lapse' } });
  check('widget keeps working for lapsed business', widgetStillWorks.status === 200);
  await pool.query("UPDATE users SET plan = 'pro', stripe_subscription_id = 'sub_smoke' WHERE email = $1", [email]);
  const ungated = await api('GET', '/api/reviews/stats', { token });
  check('paid plan restores access', ungated.status === 200);

  let feServer = null;
  if (fs.existsSync(path.join(FRONTEND_BUILD, 'index.html'))) {
    console.log('\n== frontend build ==');
    feServer = await serveFrontend(Number(process.env.PORT) + 1, FRONTEND_BUILD);
    const feBase = `http://127.0.0.1:${Number(process.env.PORT) + 1}`;
    const home = await fetch(feBase + '/');
    const homeText = await home.text();
    check('landing page serves', home.status === 200 && homeText.includes('LocalProof'));
    // SPA: every route serves the same HTML shell; page content lives in the
    // JS bundle, so assert the shell for deep links and the bundle for pages.
    const shellOk = async (p) => {
      const res = await fetch(feBase + p);
      const text = await res.text();
      return res.status === 200 && text.includes('id="root"');
    };
    check('privacy route serves the app shell', await shellOk('/privacy'));
    check('unknown route serves the app shell (client 404)', await shellOk('/definitely-not-a-page'));
    const jsDir = path.join(FRONTEND_BUILD, 'static/js');
    const bundle = fs.readFileSync(path.join(jsDir, fs.readdirSync(jsDir).find(f => f.endsWith('.js'))), 'utf8');
    check('bundle includes privacy & terms pages', bundle.includes('Privacy Policy') && bundle.includes('Terms of Service'));
    check('bundle includes demo login flow', bundle.includes('demo-login'));
  } else {
    console.log('\n== frontend build == (skipped — run `npm run build` in frontend/ first)');
  }

  server.close();
  if (feServer) feServer.close();
  await pool.end();

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch(err => { console.error('SMOKE FATAL:', err); process.exit(1); });

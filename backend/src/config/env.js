// Boot-time configuration report.
//
// Most misconfiguration here fails silently at runtime: alerts that never
// send, AI drafts that quietly fall back to canned text, or — worst — a
// lapsed user who is blocked by the paywall and cannot reach checkout.
// Surfacing it once at startup turns those into something visible in the
// platform logs.

const { CONNECTION_VARS } = require('../db');

const REQUIRED = [
  ['JWT_SECRET', 'login and registration will fail — tokens cannot be signed']
];

const FEATURES = [
  {
    name: 'Billing (Stripe)',
    vars: ['STRIPE_SECRET_KEY', 'STRIPE_PRICE_ID'],
    consequence: 'checkout is unavailable, so users whose trial has ended cannot subscribe'
  },
  {
    name: 'Subscription webhook',
    vars: ['STRIPE_WEBHOOK_SECRET'],
    consequence: 'payments will not upgrade accounts to pro — paying users stay locked out'
  },
  {
    name: 'AI reply drafts',
    vars: ['DEEPSEEK_API_KEY'],
    consequence: 'drafts silently fall back to generic canned text'
  },
  {
    name: 'Unhappy-customer alerts',
    vars: ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'],
    consequence: 'alert emails are never delivered'
  },
  {
    name: 'Checkout redirects',
    vars: ['FRONTEND_URL'],
    consequence: 'Stripe will redirect to an undefined URL after payment'
  }
];

function missing(vars) {
  return vars.filter((v) => !process.env[v]);
}

function checkEnv({ log = console } = {}) {
  const problems = { missingRequired: [], degradedFeatures: [], critical: [] };

  for (const [name, consequence] of REQUIRED) {
    if (!process.env[name]) problems.missingRequired.push({ name, consequence });
  }

  // The database connection string is accepted under any provider's name, so
  // report it missing only when none of them is set.
  if (!CONNECTION_VARS.some((name) => process.env[name])) {
    problems.missingRequired.push({
      name: 'DATABASE_URL',
      consequence:
        'no database connection string found (tried ' +
        CONNECTION_VARS.join(', ') +
        ') — every request returns 503'
    });
  }

  for (const feature of FEATURES) {
    const absent = missing(feature.vars);
    if (absent.length) problems.degradedFeatures.push({ ...feature, absent });
  }

  // The paywall is always on. Without Stripe, an expired user is blocked from
  // the product *and* from paying to unblock themselves.
  const stripeReady = !missing(['STRIPE_SECRET_KEY', 'STRIPE_PRICE_ID']).length;
  if (!stripeReady) {
    problems.critical.push(
      'Paywall is active but Stripe is not configured: any user whose trial has ' +
      'expired will be blocked from the app with no way to subscribe.'
    );
  }

  if (process.env.NODE_ENV === 'test') return problems;

  for (const { name, consequence } of problems.missingRequired) {
    log.error(`[config] MISSING ${name} — ${consequence}`);
  }

  for (const { name, absent, consequence } of problems.degradedFeatures) {
    log.warn(`[config] ${name} disabled (missing ${absent.join(', ')}) — ${consequence}`);
  }

  for (const message of problems.critical) {
    log.error(`[config] ${message}`);
  }

  if (!problems.missingRequired.length && !problems.degradedFeatures.length) {
    log.log('[config] All services configured.');
  }

  return problems;
}

module.exports = { checkEnv, REQUIRED, FEATURES };

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

const { checkEnv } = require('../src/config/env');

const MANAGED = [
  'DATABASE_URL', 'JWT_SECRET',
  'STRIPE_SECRET_KEY', 'STRIPE_PRICE_ID', 'STRIPE_WEBHOOK_SECRET',
  'DEEPSEEK_API_KEY', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'FRONTEND_URL'
];

let saved;

beforeEach(() => {
  saved = Object.fromEntries(MANAGED.map((k) => [k, process.env[k]]));
  for (const k of MANAGED) delete process.env[k];
});

afterEach(() => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

const names = (list) => list.map((p) => p.name);

describe('checkEnv', () => {
  test('reports required variables that are missing', () => {
    const { missingRequired } = checkEnv();
    assert.deepEqual(names(missingRequired).sort(), ['DATABASE_URL', 'JWT_SECRET']);
  });

  test('reports nothing required missing once they are set', () => {
    process.env.DATABASE_URL = 'postgresql://localhost/x';
    process.env.JWT_SECRET = 'secret';
    assert.deepEqual(checkEnv().missingRequired, []);
  });

  test('flags the paywall-without-Stripe trap', () => {
    const { critical } = checkEnv();
    assert.equal(critical.length, 1);
    assert.match(critical[0], /Paywall is active but Stripe is not configured/);
    assert.match(critical[0], /no way to subscribe/);
  });

  test('clears the paywall warning once Stripe is configured', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    process.env.STRIPE_PRICE_ID = 'price_test';
    assert.deepEqual(checkEnv().critical, []);
  });

  test('flags a partially configured feature, naming only the absent vars', () => {
    process.env.RESEND_API_KEY = 'set';
    const alerts = checkEnv().degradedFeatures.find((f) => f.name === 'Unhappy-customer alerts');
    assert.deepEqual(alerts.absent, ['RESEND_FROM_EMAIL']);
  });

  test('does not flag a feature whose variables are all present', () => {
    process.env.DEEPSEEK_API_KEY = 'set';
    const ai = checkEnv().degradedFeatures.find((f) => f.name === 'AI reply drafts');
    assert.equal(ai, undefined);
  });

  test('logs errors for missing required vars and warnings for degraded features', () => {
    const errors = [];
    const warnings = [];
    const previousEnv = process.env.NODE_ENV;
    delete process.env.NODE_ENV; // logging is suppressed under NODE_ENV=test

    try {
      checkEnv({ log: { error: (m) => errors.push(m), warn: (m) => warnings.push(m), log: () => {} } });
    } finally {
      process.env.NODE_ENV = previousEnv;
    }

    assert.ok(errors.some((m) => m.includes('MISSING DATABASE_URL')));
    assert.ok(errors.some((m) => m.includes('MISSING JWT_SECRET')));
    assert.ok(errors.some((m) => m.includes('Paywall is active')));
    assert.ok(warnings.some((m) => m.includes('AI reply drafts')));
    // Every message should say what actually breaks, not just name the var.
    assert.ok(errors.every((m) => m.length > 40));
  });

  test('stays quiet under NODE_ENV=test so suites are not noisy', () => {
    const calls = [];
    const sink = (m) => calls.push(m);
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    try {
      checkEnv({ log: { error: sink, warn: sink, log: sink } });
    } finally {
      if (previousEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousEnv;
    }

    assert.deepEqual(calls, []);
  });
});

const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');

// These tests exercise the real HTTP surface against a real Postgres. Without
// a DATABASE_URL there is nothing to test against, so skip rather than fail.
const HAS_DB = !!process.env.DATABASE_URL;

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

describe('API', { skip: HAS_DB ? false : 'DATABASE_URL not set' }, () => {
  let request, app, pool;

  before(async () => {
    request = require('supertest');
    app = require('../src/app');
    ({ pool } = require('../src/db'));
    // Wait for the schema init kicked off at app load.
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  after(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE reviews, feedback, users RESTART IDENTITY CASCADE');
  });

  const signup = async (overrides = {}) => {
    const body = {
      name: 'Test Owner',
      email: `owner${Math.random().toString(36).slice(2)}@test.com`,
      password: 'password123',
      businessName: 'Test Biz',
      ...overrides
    };
    const res = await request(app).post('/api/auth/register').send(body);
    return { res, body };
  };

  describe('registration', () => {
    test('creates an account on a trial, never pre-granted pro', async () => {
      const { res } = await signup();
      assert.equal(res.status, 201);
      assert.equal(res.body.user.plan, 'trialing');
      assert.ok(res.body.token);
      assert.ok(res.body.user.trialEndsAt);
    });

    test('rejects a password shorter than 8 characters', async () => {
      const { res } = await signup({ password: 'short' });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /8 characters/);
    });

    test('rejects a duplicate email', async () => {
      const { body } = await signup();
      const res = await request(app).post('/api/auth/register').send({ ...body });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /already in use/);
    });

    test('never returns the password hash', async () => {
      const { res } = await signup();
      assert.equal(res.body.user.password, undefined);
    });
  });

  describe('login', () => {
    test('rejects a wrong password without revealing which field was wrong', async () => {
      const { body } = await signup();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: body.email, password: 'wrongpassword' });
      assert.equal(res.status, 401);
      assert.equal(res.body.error, 'Invalid email or password');
    });

    test('rejects an unknown email with the same message', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'password123' });
      assert.equal(res.status, 401);
      assert.equal(res.body.error, 'Invalid email or password');
    });
  });

  describe('auth middleware', () => {
    test('rejects a request with no token', async () => {
      assert.equal((await request(app).get('/api/reviews/stats')).status, 401);
    });

    test('rejects a malformed token', async () => {
      const res = await request(app)
        .get('/api/reviews/stats')
        .set('Authorization', 'Bearer not-a-real-token');
      assert.equal(res.status, 401);
    });
  });

  describe('paywall', () => {
    const expireTrial = (email) =>
      pool.query("UPDATE users SET trial_ends_at = NOW() - INTERVAL '1 day' WHERE email = $1", [email]);

    test('allows paid routes while the trial is active', async () => {
      const { res } = await signup();
      const auth = { Authorization: `Bearer ${res.body.token}` };
      assert.equal((await request(app).get('/api/reviews/stats').set(auth)).status, 200);
      assert.equal((await request(app).get('/api/business/alerts').set(auth)).status, 200);
    });

    test('returns 402 on paid routes once the trial expires unpaid', async () => {
      const { res, body } = await signup();
      await expireTrial(body.email);
      const auth = { Authorization: `Bearer ${res.body.token}` };

      const stats = await request(app).get('/api/reviews/stats').set(auth);
      assert.equal(stats.status, 402);
      assert.equal(stats.body.code, 'SUBSCRIPTION_REQUIRED');

      assert.equal((await request(app).get('/api/reviews').set(auth)).status, 402);
      assert.equal((await request(app).get('/api/business/alerts').set(auth)).status, 402);
      assert.equal((await request(app).post('/api/reviews/1/draft').set(auth)).status, 402);
      assert.equal(
        (await request(app).patch('/api/business/profile').set(auth).send({ businessName: 'X' })).status,
        402
      );
    });

    test('restores access once Stripe marks the account paid', async () => {
      const { res, body } = await signup();
      await expireTrial(body.email);
      await pool.query(
        "UPDATE users SET plan = 'pro', stripe_subscription_id = 'sub_test' WHERE email = $1",
        [body.email]
      );
      const auth = { Authorization: `Bearer ${res.body.token}` };
      assert.equal((await request(app).get('/api/reviews/stats').set(auth)).status, 200);
    });

    test('blocks again when the subscription is cancelled', async () => {
      const { res, body } = await signup();
      await expireTrial(body.email);
      await pool.query(
        "UPDATE users SET plan = 'free', stripe_subscription_id = '' WHERE email = $1",
        [body.email]
      );
      const auth = { Authorization: `Bearer ${res.body.token}` };
      assert.equal((await request(app).get('/api/reviews/stats').set(auth)).status, 402);
    });

    test('leaves account and billing routes reachable so a lapsed user can pay', async () => {
      const { res, body } = await signup();
      await expireTrial(body.email);
      const auth = { Authorization: `Bearer ${res.body.token}` };
      assert.equal((await request(app).get('/api/auth/me').set(auth)).status, 200);

      const trial = await request(app).get('/api/auth/trial').set(auth);
      assert.equal(trial.status, 200);
      assert.equal(trial.body.trialExpired, true);
      assert.equal(trial.body.isActive, false);
    });
  });

  describe('reviews', () => {
    const authedUser = async () => {
      const { res } = await signup();
      return { Authorization: `Bearer ${res.body.token}` };
    };

    test('counts only the requested platform when filtering', async () => {
      const auth = await authedUser();
      const add = (platform, authorName) =>
        request(app).post('/api/reviews/manual').set(auth).send({
          authorName, rating: 5, text: 'A perfectly ordinary review body', platform
        });

      await add('google', 'Alice');
      await add('google', 'Carl');
      await add('yelp', 'Bob');

      const all = await request(app).get('/api/reviews').set(auth);
      assert.equal(all.body.total, 3);

      // Regression: countDocuments used to ignore the platform filter, so
      // `total` reported every platform while `reviews` was filtered.
      const google = await request(app).get('/api/reviews?platform=google').set(auth);
      assert.equal(google.body.reviews.length, 2);
      assert.equal(google.body.total, 2);
      assert.equal(google.body.pages, 1);
    });

    test('derives sentiment and fake flags when adding a review', async () => {
      const auth = await authedUser();
      const res = await request(app).post('/api/reviews/manual').set(auth).send({
        authorName: 'Dana', rating: 1, text: 'Absolutely terrible, the worst experience', platform: 'google'
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.review.sentiment, 'negative');
    });

    test('does not leak another business\'s reviews', async () => {
      const authA = await authedUser();
      await request(app).post('/api/reviews/manual').set(authA).send({
        authorName: 'Alice', rating: 5, text: 'A perfectly ordinary review body', platform: 'google'
      });

      const authB = await authedUser();
      const res = await request(app).get('/api/reviews').set(authB);
      assert.equal(res.body.total, 0);
      assert.deepEqual(res.body.reviews, []);
    });

    test('reports stats for the current user only', async () => {
      const auth = await authedUser();
      await request(app).post('/api/reviews/manual').set(auth).send({
        authorName: 'Alice', rating: 4, text: 'A perfectly ordinary review body', platform: 'google'
      });
      const res = await request(app).get('/api/reviews/stats').set(auth);
      assert.equal(res.status, 200);
      assert.equal(res.body.total, 1);
      assert.equal(res.body.pending, 1);
      assert.equal(res.body.replied, 0);
    });
  });

  describe('public widget', () => {
    const newBusiness = async () => {
      const { res } = await signup();
      return res.body.user.id;
    };

    test('stores the customer comment sent by the widget', async () => {
      const userId = await newBusiness();
      const submit = await request(app)
        .post(`/api/widget/${userId}/submit`)
        .send({ rating: 2, customerName: 'Jordan', comment: 'Barista was rude' });
      assert.equal(submit.status, 200);

      const { rows } = await pool.query('SELECT * FROM feedback WHERE user_id = $1', [userId]);
      assert.equal(rows.length, 1);
      // Regression: the widget used to send `feedback` while the API read
      // `comment`, so the complaint text was silently dropped.
      assert.equal(rows[0].comment, 'Barista was rude');
      assert.equal(rows[0].is_unhappy, true);
    });

    test('treats 4 stars and up as happy', async () => {
      const userId = await newBusiness();
      const res = await request(app).post(`/api/widget/${userId}/submit`).send({ rating: 5 });
      assert.equal(res.body.showReviewLink, true);

      const { rows } = await pool.query('SELECT is_unhappy FROM feedback WHERE user_id = $1', [userId]);
      assert.equal(rows[0].is_unhappy, false);
    });

    test('rejects out-of-range and non-numeric ratings with 400, not 500', async () => {
      const userId = await newBusiness();
      for (const rating of [99, 0, -1, 3.5, 'abc', null, undefined]) {
        const res = await request(app).post(`/api/widget/${userId}/submit`).send({ rating });
        assert.equal(res.status, 400, `rating ${JSON.stringify(rating)} should be a 400`);
        assert.match(res.body.error, /between 1 and 5/);
      }
    });

    test('rejects a non-numeric business id', async () => {
      const res = await request(app).post('/api/widget/not-an-id/submit').send({ rating: 3 });
      assert.equal(res.status, 400);
    });

    test('returns 404 for a business that does not exist', async () => {
      const res = await request(app).post('/api/widget/999999/submit').send({ rating: 3 });
      assert.equal(res.status, 404);
    });

    test('rejects an over-long comment', async () => {
      const userId = await newBusiness();
      const res = await request(app)
        .post(`/api/widget/${userId}/submit`)
        .send({ rating: 3, comment: 'x'.repeat(2001) });
      assert.equal(res.status, 400);
    });

    test('accepts submissions from a business whose trial has lapsed', async () => {
      // The widget lives on the customer's own site; it must not break when
      // the business stops paying, or their visitors see errors.
      const { res, body } = await signup();
      await pool.query("UPDATE users SET trial_ends_at = NOW() - INTERVAL '1 day' WHERE email = $1", [body.email]);
      const submit = await request(app)
        .post(`/api/widget/${res.body.user.id}/submit`)
        .send({ rating: 2, comment: 'still recorded' });
      assert.equal(submit.status, 200);
    });
  });

  describe('error handling', () => {
    test('does not leak internal error details on a server failure', async () => {
      const { res: signupRes } = await signup();
      const auth = { Authorization: `Bearer ${signupRes.body.token}` };

      // Force a genuine server-side failure behind an authenticated route.
      const Review = require('../src/models/Review');
      const original = Review.countDocuments;
      Review.countDocuments = async () => {
        throw new Error('relation "reviews" does not exist at character 42');
      };

      try {
        const res = await request(app).get('/api/reviews/stats').set(auth);
        assert.equal(res.status, 500);
        assert.equal(res.body.error, 'Something went wrong. Please try again.');
        // Regression: routes used to echo err.message straight to the client.
        assert.doesNotMatch(res.body.error, /relation|character|does not exist/);
      } finally {
        Review.countDocuments = original;
      }
    });

    test('still returns useful messages for client errors', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'A', email: 'a@test.com', password: 'short' });
      assert.equal(res.status, 400);
      assert.match(res.body.error, /8 characters/);
    });

    test('returns json, not html, for an unknown route', async () => {
      const res = await request(app).get('/api/does-not-exist');
      assert.equal(res.status, 404);
      assert.equal(res.body.error, 'Not found');
    });

    test('rejects malformed json without exposing a stack trace', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"email": broken}');
      assert.equal(res.status, 400);
      assert.ok(res.body.error);
      assert.doesNotMatch(JSON.stringify(res.body), /at Object|node_modules|\.js:\d+/);
    });
  });

  describe('health', () => {
    test('reports ok and a connected database', async () => {
      const res = await request(app).get('/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'ok');
      assert.equal(res.body.database.state, 'connected');
      assert.ok(res.body.database.configuredFrom, 'should name the variable in use');
    });

    test('answers even when the database gate would reject', async () => {
      // /health is mounted before the dbReady gate precisely so it can still
      // report when the database is down.
      const res = await request(app).get('/health');
      assert.notEqual(res.body.database, undefined);
    });

    test('never exposes the connection string itself', async () => {
      const res = await request(app).get('/health');
      const body = JSON.stringify(res.body);
      assert.doesNotMatch(body, /postgres(ql)?:\/\//, 'must report names, not values');
      assert.doesNotMatch(body, /password/i);
    });
  });

  describe('healthz', () => {
    test('always reports ok regardless of database state', async () => {
      // Unlike /health, this must never 503 — it is the platform liveness
      // probe, and a database that is still waking up must not look like a
      // crashed process to Railway/Vercel.
      const res = await request(app).get('/healthz');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'ok');
    });
  });
});

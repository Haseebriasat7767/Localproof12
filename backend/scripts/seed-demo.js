#!/usr/bin/env node
// Seeds a demo account with realistic sample data, so a prospective buyer (or
// a new owner during evaluation) can log in and see the product fully
// populated — reviews with sentiment/fake flags, a saved reply, and unhappy
// customer alerts — without entering anything by hand.
//
//   DATABASE_URL=postgres://... npm run seed:demo
//
// Idempotent: safe to re-run. The demo account is marked as a paid 'pro'
// account (with a placeholder subscription id) so it never hits the trial
// paywall. Credentials default to demo@localproof.app / demo1234 and can be
// overridden with DEMO_EMAIL / DEMO_PASSWORD.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { pool, applySchema } = require('../src/db');
const User = require('../src/models/User');
const Review = require('../src/models/Review');
const Feedback = require('../src/models/Feedback');
const { analyzeSentiment, detectFakeReview } = require('../src/services/claude');

const DEMO_EMAIL = (process.env.DEMO_EMAIL || 'demo@localproof.app').toLowerCase();
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'demo1234';

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const SAMPLE_REVIEWS = [
  { reviewId: 'demo-g-1', platform: 'google', authorName: 'Sarah M.', rating: 5, text: 'Best flat white in town! The team remembered my order and the new patio is lovely. Highly recommend to anyone who loves good coffee.', date: daysAgo(2) },
  { reviewId: 'demo-g-2', platform: 'google', authorName: 'James T.', rating: 4, text: 'Great atmosphere and fast service. Only wish they had more dairy-free milk options.', date: daysAgo(5) },
  { reviewId: 'demo-g-3', platform: 'google', authorName: 'Priya K.', rating: 5, text: 'Wonderful little spot. The baristas are friendly and the banana bread is perfect. A neighborhood gem!', date: daysAgo(9) },
  { reviewId: 'demo-y-1', platform: 'yelp', authorName: 'Marcus D.', rating: 2, text: 'Waited 25 minutes for a simple latte. The place was slammed and nobody apologized. The coffee itself was fine but the experience was terrible and rude.', date: daysAgo(12) },
  { reviewId: 'demo-g-4', platform: 'google', authorName: 'Anonymous', rating: 1, text: 'worst ever', date: daysAgo(14) },
  { reviewId: 'demo-g-5', platform: 'google', authorName: 'Elena R.', rating: 5, text: 'Amazing cortado and the staff genuinely care about getting it right. My new morning spot, fantastic and wonderful.', date: daysAgo(18) },
  { reviewId: 'demo-y-2', platform: 'yelp', authorName: 'Tom H.', rating: 3, text: 'Decent coffee, but the seating is cramped and it gets very loud in the afternoon.', date: daysAgo(21) }
];

const SAMPLE_FEEDBACK = [
  { customerName: 'Jordan P.', customerEmail: 'jordan.p@example.com', rating: 2, comment: 'Barista was rude when I asked about the oat milk. Made me feel unwelcome.', date: daysAgo(3) },
  { customerName: 'Anonymous', customerEmail: '', rating: 5, comment: '', date: daysAgo(6) },
  { customerName: 'Aisha N.', customerEmail: 'aisha.n@example.com', rating: 1, comment: 'My order was wrong twice and nobody offered to fix it.', date: daysAgo(10) }
];

// `initSchema` applies the schema first (the default, for CLI use). Pass
// { initSchema: false } when the caller has already initialised the schema —
// e.g. an in-process smoke test booting the app and seeding in one process.
async function seedDemo({ initSchema = true } = {}) {
  if (initSchema) await applySchema();

  let demo = await User.findOne({ email: DEMO_EMAIL });
  if (demo) {
    demo = await User.findByIdAndUpdate(demo.id, {
      name: 'Demo Owner',
      businessName: 'Demo Coffee Co.',
      tone: 'friendly',
      googleReviewUrl: 'https://g.page/r/demo-coffee-co/review'
    });
    console.log(`Demo account already exists (${DEMO_EMAIL}) — profile refreshed.`);
    console.log('If you changed DEMO_PASSWORD, reset it with: npm run seed:demo -- --reset-password');
  } else {
    demo = await User.create({
      name: 'Demo Owner',
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      businessName: 'Demo Coffee Co.',
      plan: 'trialing'
    });
    await User.findByIdAndUpdate(demo.id, {
      tone: 'friendly',
      googleReviewUrl: 'https://g.page/r/demo-coffee-co/review'
    });
    demo = await User.findById(demo.id);
    console.log(`Demo account created (${DEMO_EMAIL}).`);
  }

  // Mark as paid so the demo never expires behind the trial paywall. The
  // placeholder subscription id only needs to be non-empty for the
  // isActive check; no Stripe calls are ever made for this account.
  await pool.query(
    `UPDATE users
     SET plan = 'pro',
         stripe_subscription_id = CASE
           WHEN stripe_subscription_id IS NULL OR stripe_subscription_id = '' THEN 'demo_sub'
           ELSE stripe_subscription_id
         END
     WHERE id = $1`,
    [demo.id]
  );

  let reviewsAdded = 0;
  for (const sample of SAMPLE_REVIEWS) {
    const sentiment = await analyzeSentiment(sample.text);
    const { isFake, reasons } = await detectFakeReview({ rating: sample.rating, text: sample.text });
    const created = await Review.upsertExternal({
      userId: demo.id,
      platform: sample.platform,
      reviewId: sample.reviewId,
      authorName: sample.authorName,
      rating: sample.rating,
      text: sample.text,
      date: sample.date,
      sentiment,
      isFakeSuspected: isFake,
      fakeReasons: reasons
    });
    if (created) reviewsAdded += 1;
  }

  // One review already has a reply saved, so the dashboard shows the full loop.
  const replied = await Review.findOne({ userId: demo.id, reviewId: 'demo-g-1' });
  if (replied && !replied.replied) {
    await Review.findByIdAndUpdate(replied.id, {
      replyText: 'Thank you so much, Sarah! We loved having you on the new patio — see you tomorrow! ☕',
      replied: true
    });
  }

  // Idempotency key for feedback: the sample content itself. (The feedback
  // table has no natural unique constraint, so existence is checked in JS.)
  const existingFeedback = await Feedback.find({ userId: demo.id }, { limit: 1000 });
  const feedbackKey = (f) => `${f.customerName}|${f.rating}|${f.comment}`;
  const seenFeedback = new Set(existingFeedback.map(feedbackKey));

  let feedbackAdded = 0;
  for (const sample of SAMPLE_FEEDBACK) {
    if (seenFeedback.has(feedbackKey(sample))) continue;
    await Feedback.create({
      userId: demo.id,
      customerName: sample.customerName,
      customerEmail: sample.customerEmail,
      rating: sample.rating,
      comment: sample.comment,
      isUnhappy: sample.rating <= 3
    });
    feedbackAdded += 1;
  }

  console.log(`Seeded ${reviewsAdded} new reviews (${SAMPLE_REVIEWS.length} total in set) and ${feedbackAdded} new feedback entries.`);
  console.log('');
  console.log('Demo login:');
  console.log(`  Email:    ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}`);
  console.log('');
  console.log('Tip: set your own Google review URL in Settings after logging in.');

  return { email: DEMO_EMAIL, password: DEMO_PASSWORD };
}

module.exports = { seedDemo };

// Run directly (`npm run seed:demo`) against the database in the environment;
// exportable so tests and smoke checks can seed an in-process database.
if (require.main === module) {
  seedDemo()
    .then(() => pool.end())
    .catch((err) => {
      console.error('Seed failed:', err.message);
      process.exit(1);
    });
}

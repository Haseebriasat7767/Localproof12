#!/usr/bin/env node
// Seeds a realistic demo business — one owner account with a spread of reviews
// (positive, neutral, negative, and one that trips the suspicious-review
// heuristics) plus widget feedback, including unhappy customers.
//
// Standalone (against any configured database):
//   DATABASE_URL=postgres://... npm run seed
//
// It is also imported by scripts/demo.js. Safe to re-run: it never duplicates
// the demo account, its reviews, or its feedback.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { pool, initDb } = require('../src/db');
const User = require('../src/models/User');
const Review = require('../src/models/Review');
const Feedback = require('../src/models/Feedback');
const { analyzeSentiment, detectFakeReview } = require('../src/services/claude');

const DEMO_EMAIL = 'demo@localproof.app';
const DEMO_PASSWORD = 'demo1234'; // demo-only credential, >= 8 chars to satisfy validation
const DEMO_NAME = 'Demo Owner';
const BUSINESS_NAME = 'Harbor and Hearth Cafe';
const REVIEW_URL = 'https://g.page/r/harborandhearth/review';

const daysAgo = (n) => new Date(Date.now() - n * 86400000);

// text is run through the same analyzeSentiment / detectFakeReview the live
// ingest path uses, so the seeded flags match what a real import would produce.
const SAMPLE_REVIEWS = [
  { platform: 'google', authorName: 'Mariana Lopez', rating: 5, date: daysAgo(2),
    text: 'Best flat white in the neighborhood, and the staff remember my name. Cozy, wifi-friendly seating too — I get more work done here than at the office.',
    replyText: 'Thank you Mariana! We love having you in — see you at your usual table soon.' },
  { platform: 'google', authorName: 'Dev Patel', rating: 4, date: daysAgo(4),
    text: 'Great coffee and fresh pastries. It gets busy around 8am so expect a short wait, but the line moves fast.' },
  { platform: 'yelp', authorName: 'Jordan Kim', rating: 5, date: daysAgo(6),
    text: 'Absolutely wonderful spot. The avocado toast is worth the trip and the atmosphere is warm and welcoming.' },
  { platform: 'google', authorName: 'Sam Rivera', rating: 2, date: daysAgo(8),
    text: 'Disappointed. My medium latte was lukewarm and the barista seemed annoyed when I asked to warm it up. Not rushing back.' },
  { platform: 'google', authorName: 'Alice Nguyen', rating: 2, date: daysAgo(10),
    text: 'Waited a while and my coffee was cold when it arrived. A bit disappointed, though the staff were polite about it.',
    replyText: 'Alice, we are sorry your visit fell short — that is not the standard we hold ourselves to. Please email us so we can make it right.' },
  { platform: 'manual', authorName: 'Tom Brady', rating: 3, date: daysAgo(12),
    text: 'It was fine. Coffee was okay, a little overpriced for the size, but the seating is nice and quiet.' },
  { platform: 'google', authorName: 'xXcoffeeloverXx', rating: 1, date: daysAgo(14),
    text: 'worst ever do not use!!!!!' },
  { platform: 'yelp', authorName: 'Priya Sharma', rating: 5, date: daysAgo(16),
    text: 'Love this place! Friendly staff, excellent espresso, and oat milk at no extra charge. Highly recommend the cinnamon roll.' },
  { platform: 'google', authorName: 'Marcus Bell', rating: 5, date: daysAgo(18),
    text: 'Solid neighborhood cafe. The cold brew is excellent and the pastries are always fresh.',
    replyText: 'Thanks Marcus — glad the cold brew hit the spot. See you again soon!' },
  { platform: 'manual', authorName: 'Elena Rossi', rating: 4, date: daysAgo(20),
    text: 'Really enjoyed the pastries and the seating is cozy. Service was a touch slow but the quality made up for it.' },
  { platform: 'google', authorName: 'Chris Walker', rating: 5, date: daysAgo(22),
    text: 'Fantastic service and the best croissants in town. This is my new regular spot before work.' },
  { platform: 'yelp', authorName: 'Hannah Lee', rating: 5, date: daysAgo(25),
    text: 'Great vibe, friendly baristas, and quick service even during the morning rush. Excellent cappuccino.',
    replyText: 'Hannah, thank you! We appreciate you — see you next morning.' }
];

const SAMPLE_FEEDBACK = [
  { rating: 5, customerName: 'Grace Hopper', customerEmail: 'grace@example.com',
    comment: 'Loved the latte and the cozy atmosphere. Will be back!' },
  { rating: 2, customerName: 'Liam Turner', customerEmail: 'liam.t@example.com',
    comment: 'Waited over 20 minutes and my order came out wrong.' },
  { rating: 1, customerName: 'Anonymous', customerEmail: '',
    comment: 'Restroom was out of order and nobody could tell me when it would be fixed.' },
  { rating: 4, customerName: 'Noah Price', customerEmail: 'noah@example.com',
    comment: 'Great pastries, just a little slow at the counter during the rush.' },
  { rating: 3, customerName: 'Ava Martinez', customerEmail: 'ava.m@example.com',
    comment: 'Wifi kept dropping during my meeting — frustrating when you are trying to work.' }
];

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '');

async function seed({ log = () => {} } = {}) {
  await initDb();

  let user = await User.findOne({ email: DEMO_EMAIL });
  if (!user) {
    user = await User.create({
      name: DEMO_NAME,
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      businessName: BUSINESS_NAME,
      plan: 'trialing'
    });
    await User.findByIdAndUpdate(user.id, { tone: 'friendly', reviewUrl: REVIEW_URL });
    log(`created demo account ${DEMO_EMAIL} (id ${user.id})`);
  } else {
    log(`demo account already present (id ${user.id})`);
  }

  const reviewCount = await Review.countDocuments({ userId: user.id });
  if (reviewCount === 0) {
    let i = 0;
    for (const r of SAMPLE_REVIEWS) {
      i += 1;
      const sentiment = await analyzeSentiment(r.text);
      const { isFake, reasons } = await detectFakeReview({ rating: r.rating, text: r.text });
      const review = await Review.create({
        userId: user.id,
        platform: r.platform,
        reviewId: `seed_${i}_${slug(r.authorName)}`,
        authorName: r.authorName,
        rating: r.rating,
        text: r.text,
        date: r.date,
        sentiment,
        isFakeSuspected: isFake,
        fakeReasons: reasons
      });
      if (r.replyText) {
        await Review.findByIdAndUpdate(review.id, {
          replyDraft: r.replyText,
          replyText: r.replyText,
          replied: true
        });
      }
    }
    log(`seeded ${SAMPLE_REVIEWS.length} reviews`);
  } else {
    log(`reviews already present (${reviewCount}) — skipping`);
  }

  const feedbackCount = (await Feedback.find({ userId: user.id }, { limit: 1 })).length;
  if (feedbackCount === 0) {
    for (const f of SAMPLE_FEEDBACK) {
      await Feedback.create({
        userId: user.id,
        customerName: f.customerName,
        customerEmail: f.customerEmail,
        rating: f.rating,
        comment: f.comment,
        isUnhappy: f.rating <= 3,
        source: 'widget'
      });
    }
    log(`seeded ${SAMPLE_FEEDBACK.length} feedback entries`);
  } else {
    log('feedback already present — skipping');
  }

  return user;
}

module.exports = { seed, DEMO_EMAIL, DEMO_PASSWORD, BUSINESS_NAME };

if (require.main === module) {
  (async () => {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set — nothing to seed against.');
      process.exit(1);
    }
    try {
      await seed({ log: (m) => console.log('[seed]', m) });
      console.log(`\nDemo login → ${DEMO_EMAIL} / ${DEMO_PASSWORD}\n`);
    } catch (err) {
      console.error('Seed failed:', err.message);
      process.exitCode = 1;
    } finally {
      await pool.end();
    }
  })();
}

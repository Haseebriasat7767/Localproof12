const express = require('express');
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const { generateReplyDraft, analyzeSentiment, detectFakeReview } = require('../services/claude');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();
const aiLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, keyGenerator: (req) => String(req.user?.id || req.ip || 'unknown') });

function parseReviewInput(body = {}) {
  const authorName = typeof body.authorName === 'string' ? body.authorName.trim() : '';
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const platform = typeof body.platform === 'string' ? body.platform.trim().toLowerCase() : 'manual';
  const rating = Number(body.rating);

  if (!authorName || authorName.length > 100) return { error: 'Author name is required and must be 100 characters or fewer' };
  if (!text || text.length > 5000) return { error: 'Review text is required and must be 5000 characters or fewer' };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: 'Rating must be an integer between 1 and 5' };
  if (!/^[a-z0-9_-]{1,50}$/.test(platform)) return { error: 'Invalid platform' };

  return { authorName, text, platform, rating };
}

// Get all reviews for current user
router.get('/', auth, async (req, res) => {
  try {
    const { sentiment, replied, platform } = req.query;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const filter = { userId: req.user.id };
    if (sentiment) filter.sentiment = sentiment;
    if (replied !== undefined) filter.replied = replied === 'true';
    if (platform) filter.platform = platform;

    const skip = (page - 1) * limit;
    const reviews = await Review.find(filter, { skip, limit, sort: '-date' });
    const total = await Review.countDocuments(filter);
    res.json({ reviews, total, pages: Math.ceil(total / limit), page, limit });
  } catch (err) {
    console.error('List reviews error:', err);
    res.status(500).json({ error: 'Unable to load reviews' });
  }
});

// Add review manually
router.post('/manual', auth, async (req, res) => {
  try {
    const parsed = parseReviewInput(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const { authorName, rating, text, platform } = parsed;
    const date = req.body.date ? new Date(req.body.date) : new Date();
    if (Number.isNaN(date.getTime())) return res.status(400).json({ error: 'Invalid review date' });

    const sentiment = await analyzeSentiment(text);
    const { isFake, reasons } = await detectFakeReview({ rating, text });

    const review = await Review.create({
      userId: req.user.id,
      platform,
      reviewId: `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      authorName,
      rating,
      text,
      date,
      sentiment,
      isFakeSuspected: isFake,
      fakeReasons: reasons
    });

    res.status(201).json({ review });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ error: 'Unable to create review' });
  }
});

// Generate AI reply draft
router.post('/:id/draft', auth, aiLimiter, async (req, res) => {
  try {
    const review = await Review.findOne({ id: req.params.id, userId: req.user.id });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const draft = await generateReplyDraft(review, req.user.businessName, req.user.tone);
    await Review.findByIdAndUpdate(review.id, { replyDraft: draft });

    res.json({ draft });
  } catch (err) {
    console.error('Generate draft error:', err);
    res.status(502).json({ error: 'Unable to generate an AI draft' });
  }
});

// Save final reply
router.patch('/:id/reply', auth, async (req, res) => {
  try {
    const replyText = typeof req.body.replyText === 'string' ? req.body.replyText.trim() : '';
    if (!replyText || replyText.length > 5000) {
      return res.status(400).json({ error: 'Reply must be between 1 and 5000 characters' });
    }
    const review = await Review.findOneAndUpdate(
      { id: req.params.id, userId: req.user.id },
      { replyText, replied: true }
    );
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ review });
  } catch (err) {
    console.error('Save reply error:', err);
    res.status(500).json({ error: 'Unable to save reply' });
  }
});

// Dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const total = await Review.countDocuments({ userId });
    const replied = await Review.countDocuments({ userId, replied: true });
    const negative = await Review.countDocuments({ userId, sentiment: 'negative' });
    const fake = await Review.countDocuments({ userId, isFakeSuspected: true });

    const ratingAgg = await Review.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);

    res.json({
      total,
      replied,
      pending: total - replied,
      negative,
      fake,
      avgRating: ratingAgg[0]?.avg?.toFixed(1) || 0
    });
  } catch (err) {
    console.error('Review stats error:', err);
    res.status(500).json({ error: 'Unable to load review statistics' });
  }
});

module.exports = router;

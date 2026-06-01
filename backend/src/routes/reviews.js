const express = require('express');
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const { generateReplyDraft, analyzeSentiment, detectFakeReview } = require('../services/claude');

const router = express.Router();

// Get all reviews for current user
router.get('/', auth, async (req, res) => {
  try {
    const { sentiment, replied, platform, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user.id };
    if (sentiment) filter.sentiment = sentiment;
    if (replied !== undefined) filter.replied = replied === 'true';
    if (platform) filter.platform = platform;

    const skip = (page - 1) * limit;
    const reviews = await Review.find(filter, { skip: parseInt(skip), limit: parseInt(limit) });
    const total = await Review.countDocuments(filter);
    res.json({ reviews, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add review manually
router.post('/manual', auth, async (req, res) => {
  try {
    const { authorName, rating, text, platform = 'manual', date } = req.body;
    const sentiment = await analyzeSentiment(text);
    const { isFake, reasons } = await detectFakeReview({ rating, text });

    const review = await Review.create({
      userId: req.user.id,
      platform,
      reviewId: `manual_${Date.now()}`,
      authorName,
      rating,
      text,
      date: date || new Date(),
      sentiment,
      isFakeSuspected: isFake,
      fakeReasons: reasons
    });

    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate AI reply draft
router.post('/:id/draft', auth, async (req, res) => {
  try {
    const review = await Review.findOne({ id: req.params.id, userId: req.user.id });
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const draft = await generateReplyDraft(review, req.user.businessName, req.user.tone);
    await Review.findByIdAndUpdate(review.id, { replyDraft: draft });

    res.json({ draft });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save final reply
router.patch('/:id/reply', auth, async (req, res) => {
  try {
    const { replyText } = req.body;
    const review = await Review.findOneAndUpdate(
      { id: req.params.id, userId: req.user.id },
      { replyText, replied: true }
    );
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ review });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['google', 'yelp', 'manual'], required: true },
  reviewId: { type: String, required: true },
  authorName: { type: String, default: 'Anonymous' },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  replied: { type: Boolean, default: false },
  replyText: { type: String, default: '' },
  replyDraft: { type: String, default: '' },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  isFakeSuspected: { type: Boolean, default: false },
  fakeReasons: [String],
  createdAt: { type: Date, default: Date.now }
});

reviewSchema.index({ userId: 1, reviewId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

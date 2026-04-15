const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, default: 'Anonymous' },
  customerEmail: { type: String, default: '' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' },
  // If rating <= 3, flag as unhappy and alert owner BEFORE they post publicly
  isUnhappy: { type: Boolean, default: false },
  alertSent: { type: Boolean, default: false },
  source: { type: String, default: 'widget' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);

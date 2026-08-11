const express = require('express');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();

const widgetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
});

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function validateInput({ customerName, customerEmail, rating, comment }) {
  const parsedRating = Number(rating);
  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return { error: 'Rating must be an integer between 1 and 5' };
  }

  if (customerName != null && String(customerName).length > 100) {
    return { error: 'Customer name is too long' };
  }

  if (customerEmail != null && String(customerEmail).length > 254) {
    return { error: 'Customer email is too long' };
  }

  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customerEmail))) {
    return { error: 'Invalid customer email' };
  }

  if (comment != null && String(comment).length > 2000) {
    return { error: 'Comment is too long' };
  }

  return { rating: parsedRating };
}

// Public widget endpoint — protected against basic abuse, but intentionally unauthenticated.
router.post('/:userId/submit', widgetLimiter, async (req, res) => {
  try {
    const { customerName, customerEmail, rating, comment } = req.body || {};
    const validation = validateInput({ customerName, customerEmail, rating, comment });
    if (validation.error) return res.status(400).json({ error: validation.error });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Business not found' });

    const normalizedRating = validation.rating;
    const isUnhappy = normalizedRating <= 3;

    await Feedback.create({
      userId: user.id,
      customerName: customerName ? String(customerName).trim() : 'Anonymous',
      customerEmail: customerEmail ? String(customerEmail).trim().toLowerCase() : null,
      rating: normalizedRating,
      comment: comment ? String(comment).trim() : '',
      isUnhappy
    });

    if (isUnhappy && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'LocalProof <alerts@localproof.io>',
          to: user.email,
          subject: `Unhappy customer alert — ${normalizedRating}/5 stars`,
          html: `
            <h2>Unhappy Customer Alert</h2>
            <p><strong>Business:</strong> ${escapeHtml(user.businessName)}</p>
            <p><strong>Customer:</strong> ${escapeHtml(customerName || 'Anonymous')}</p>
            <p><strong>Rating:</strong> ${normalizedRating}/5</p>
            <p><strong>Comment:</strong> ${escapeHtml(comment || '')}</p>
            <p><strong>Email:</strong> ${escapeHtml(customerEmail || '')}</p>
            <hr/>
            <p>Reach out to them promptly.</p>
          `
        });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
      }
    }

    const response = isUnhappy
      ? { message: "Thank you for your feedback. We'll be in touch shortly." }
      : { message: "Thank you! Would you mind sharing this on Google?", showReviewLink: true };

    res.json(response);
  } catch (err) {
    console.error('Widget submission failed:', err);
    res.status(500).json({ error: 'Unable to submit feedback' });
  }
});

// Alias: /feedback endpoint used by the demo widget
router.post('/:userId/feedback', widgetLimiter, async (req, res) => {
  req.url = `/${req.params.userId}/submit`;
  router.handle(req, res);
});

// Get widget embed code for business
router.get('/:userId/embed', async (req, res) => {
  const apiBase = process.env.BACKEND_URL || process.env.FRONTEND_URL || 'http://localhost:3001';
  const embedCode = `
<script>
(function() {
  var btn = document.createElement('button');
  btn.innerHTML = '⭐ Rate Us';
  btn.style = 'position:fixed;bottom:20px;right:20px;background:#D97706;color:white;padding:12px 20px;border:none;border-radius:8px;cursor:pointer;font-size:16px;z-index:9999;';
  btn.onclick = function() {
    var rating = prompt('How would you rate us? (1-5)');
    if (!rating) return;
    var comment = prompt('Any comments? (optional)');
    var name = prompt('Your name? (optional)') || 'Anonymous';
    var parsedRating = Number.parseInt(rating, 10);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      alert('Please enter a rating from 1 to 5.');
      return;
    }
    fetch('${apiBase}/api/widget/${req.params.userId}/submit', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ customerName: name, rating: parsedRating, comment: comment || '' })
    }).then(r => r.json()).then(d => alert(d.message || d.error || 'Thank you!'));
  };
  document.body.appendChild(btn);
})();
</script>`;
  res.json({ embedCode });
});

module.exports = router;

const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

const router = express.Router();

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_COMMENT = 2000;

// This endpoint sits on customers' public websites, so it is both
// unauthenticated and a spam target.
const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Too many submissions. Please try again shortly.' }
});

// Escape untrusted text before it goes into the alert email body.
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseUserId(raw) {
  return /^\d+$/.test(raw) ? Number(raw) : null;
}

// Public widget endpoint — no auth needed (used on client websites)
router.post('/:userId/submit', submitLimiter, async (req, res) => {
  try {
    const userId = parseUserId(req.params.userId);
    if (userId === null) return res.status(400).json({ error: 'Invalid business id' });

    const { customerName, customerEmail, rating, comment } = req.body;

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5)
      return res.status(400).json({ error: 'Rating must be a whole number between 1 and 5' });

    if (customerName != null && String(customerName).length > MAX_NAME)
      return res.status(400).json({ error: 'Name is too long' });
    if (customerEmail != null && String(customerEmail).length > MAX_EMAIL)
      return res.status(400).json({ error: 'Email is too long' });
    if (comment != null && String(comment).length > MAX_COMMENT)
      return res.status(400).json({ error: 'Comment is too long' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Business not found' });

    const isUnhappy = numericRating <= 3;

    await Feedback.create({
      userId: user.id,
      customerName,
      customerEmail,
      rating: numericRating,
      comment,
      isUnhappy
    });

    if (isUnhappy && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: user.email,
          subject: `Unhappy customer alert — ${numericRating}/5 stars`,
          html: `
            <h2>Unhappy Customer Alert</h2>
            <p><strong>Business:</strong> ${escapeHtml(user.businessName)}</p>
            <p><strong>Customer:</strong> ${escapeHtml(customerName || 'Anonymous')}</p>
            <p><strong>Rating:</strong> ${numericRating}/5</p>
            <p><strong>Comment:</strong> ${escapeHtml(comment || '')}</p>
            <p><strong>Email:</strong> ${escapeHtml(customerEmail || '')}</p>
            <hr/>
            <p>Reach out to them before they leave a public review!</p>
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
    // Public endpoint: log server-side, don't leak internals to the page.
    console.error('Widget submit failed:', err.message);
    res.status(500).json({ error: 'Could not record feedback. Please try again.' });
  }
});

// Alias: /feedback endpoint used by the demo widget
router.post('/:userId/feedback', async (req, res) => {
  req.url = `/${req.params.userId}/submit`;
  router.handle(req, res);
});

// Get widget embed code for business
router.get('/:userId/embed', async (req, res) => {
  const userId = parseUserId(req.params.userId);
  if (userId === null) return res.status(400).json({ error: 'Invalid business id' });

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
    fetch('${apiBase}/api/widget/${userId}/submit', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ customerName: name, rating: parseInt(rating), comment: comment || '' })
    }).then(r => r.json()).then(d => alert(d.message));
  };
  document.body.appendChild(btn);
})();
</script>`;
  res.json({ embedCode });
});

module.exports = router;

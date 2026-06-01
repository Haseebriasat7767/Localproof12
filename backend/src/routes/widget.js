const express = require('express');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

const router = express.Router();

// Public widget endpoint — no auth needed (used on client websites)
router.post('/:userId/submit', async (req, res) => {
  try {
    const { customerName, customerEmail, rating, comment } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'Business not found' });

    const isUnhappy = rating <= 3;

    await Feedback.create({
      userId: user.id,
      customerName,
      customerEmail,
      rating,
      comment,
      isUnhappy
    });

    if (isUnhappy && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'LocalProof <alerts@localproof.io>',
          to: user.email,
          subject: `Unhappy customer alert — ${rating}/5 stars`,
          html: `
            <h2>Unhappy Customer Alert</h2>
            <p><strong>Business:</strong> ${user.businessName}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Rating:</strong> ${rating}/5</p>
            <p><strong>Comment:</strong> ${comment}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
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
    res.status(500).json({ error: err.message });
  }
});

// Alias: /feedback endpoint used by the demo widget
router.post('/:userId/feedback', async (req, res) => {
  req.url = `/${req.params.userId}/submit`;
  router.handle(req, res);
});

// Get widget embed code for business
router.get('/:userId/embed', async (req, res) => {
  const apiBase = process.env.FRONTEND_URL || 'http://localhost:3001';
  const embedCode = `
<script>
(function() {
  var btn = document.createElement('button');
  btn.innerHTML = '⭐ Rate Us';
  btn.style = 'position:fixed;bottom:20px;right:20px;background:#2563eb;color:white;padding:12px 20px;border:none;border-radius:8px;cursor:pointer;font-size:16px;z-index:9999;';
  btn.onclick = function() {
    var rating = prompt('How would you rate us? (1-5)');
    if (!rating) return;
    var comment = prompt('Any comments? (optional)');
    var name = prompt('Your name? (optional)') || 'Anonymous';
    fetch('${apiBase}/api/widget/${req.params.userId}/submit', {
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

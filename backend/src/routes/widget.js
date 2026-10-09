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

    // Happy customers (4-5 stars) are routed to the business's Google review
    // page — that routing is the product. Unhappy ones stay private.
    const response = isUnhappy
      ? { message: "Thank you for your feedback. We'll be in touch shortly.", isUnhappy: true }
      : {
          message: "Thank you! Would you mind sharing this on Google?",
          showReviewLink: true,
          reviewUrl: user.googleReviewUrl || null,
          businessName: user.businessName || ''
        };

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

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'Business not found' });

  const apiBase = process.env.BACKEND_URL || process.env.FRONTEND_URL || 'http://localhost:3001';
  const businessName = JSON.stringify(user.businessName || 'us');
  // The embed is a self-contained IIFE: no dependencies, works on any site.
  // Happy raters (4-5) are routed to the business's Google review page;
  // unhappy raters (1-3) get a private comment form instead — the review
  // never reaches Google. That routing is the entire product.
  const embedCode = `
<script>
(function() {
  var API = '${apiBase}/api/widget/${userId}/submit';
  var NAME = ${businessName};
  var css = 'font-family:system-ui,sans-serif;color:#0f172a;';
  var box = document.createElement('div');
  box.style = 'position:fixed;bottom:20px;right:20px;z-index:9999;width:300px;background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.25);padding:18px;display:none;' + css;
  var btn = document.createElement('button');
  btn.innerHTML = '\\u2B50 Rate ' + (NAME || 'us');
  btn.style = 'position:fixed;bottom:20px;right:20px;z-index:9999;background:#D97706;color:#fff;padding:12px 20px;border:none;border-radius:999px;cursor:pointer;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(217,119,6,.4);' + css;
  var close = document.createElement('button');
  close.innerHTML = '\\u00D7';
  close.style = 'position:absolute;top:6px;right:10px;background:none;border:none;font-size:18px;cursor:pointer;color:#94a3b8;';
  box.appendChild(close);
  close.onclick = function() { box.style.display = 'none'; btn.style.display = 'block'; };
  btn.onclick = function() { btn.style.display = 'none'; box.style.display = 'block'; showRating(); };

  function el(tag, style, text) {
    var e = document.createElement(tag);
    e.setAttribute('style', style + css);
    if (text != null) e.innerHTML = text;
    return e;
  }
  function clear() { while (box.lastChild) box.removeChild(box.lastChild); box.appendChild(close); }
  var starRow = null;
  function paint(n) {
    if (!starRow) return;
    Array.prototype.forEach.call(starRow.children, function(s) {
      s.style.color = s._v <= n ? '#f59e0b' : '#e2e8f0';
    });
  }
  function stars() {
    var row = el('div', 'display:flex;gap:4px;margin:10px 0;');
    for (var i = 1; i <= 5; i++) {
      (function(v) {
        var s = el('button', 'background:none;border:none;font-size:26px;cursor:pointer;padding:0;color:#e2e8f0;', '\\u2605');
        s._v = v;
        s.onmouseover = function() { paint(v); };
        s.onclick = function() { pick(v); };
        row.appendChild(s);
      })(i);
    }
    row.onmouseleave = function() { paint(0); };
    return row;
  }
  function showRating() {
    clear();
    box.appendChild(el('div', 'font-weight:600;font-size:14px;', 'How was your experience with ' + NAME + '?'));
    starRow = stars();
    box.appendChild(starRow);
  }
  function showHappy() {
    clear();
    box.appendChild(el('div', 'font-weight:600;font-size:14px;margin-bottom:4px;', 'Thanks so much! \\u2764\\uFE0F'));
    box.appendChild(el('div', 'font-size:12px;color:#64748b;margin-bottom:10px;', 'Mind sharing it on Google? It takes 20 seconds.'));
    var go = el('button', 'width:100%;background:#D97706;color:#fff;border:none;border-radius:8px;padding:10px;cursor:pointer;font-size:13px;font-weight:600;', 'Leave a Google review');
    go.onclick = function() { window.open(d.reviewUrl, '_blank'); };
    box.appendChild(go);
  }
  function showUnhappy() {
    clear();
    box.appendChild(el('div', 'font-weight:600;font-size:14px;margin-bottom:4px;', 'Sorry to hear that.'));
    box.appendChild(el('div', 'font-size:12px;color:#64748b;margin-bottom:10px;', 'Tell us what happened — we\\'ll make it right. This stays private.'));
    var ta = el('textarea', 'width:100%;box-sizing:border-box;border:1px solid #e2e8f0;border-radius:8px;padding:8px;font-size:13px;resize:vertical;', '');
    ta.rows = 3; ta.placeholder = 'What went wrong?';
    box.appendChild(ta);
    var send = el('button', 'width:100%;margin-top:8px;background:#0f172a;color:#fff;border:none;border-radius:8px;padding:10px;cursor:pointer;font-size:13px;font-weight:600;', 'Send feedback');
    send.onclick = function() { submit(current, ta.value); };
    box.appendChild(send);
  }
  var current = 0, d = {};
  // Picking 1-3 stars opens the private form without sending anything yet;
  // picking 4-5 stars records the rating immediately and routes to Google.
  function pick(rating) {
    if (rating >= 4) {
      submit(rating, '');
    } else {
      current = rating;
      showUnhappy();
    }
  }
  function submit(rating, comment) {
    fetch(API, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ rating: rating, comment: comment || '' })
    }).then(function(r) { return r.json(); })
      .then(function(data) {
        d = data;
        if (rating >= 4) {
          if (data.reviewUrl) { showHappy(); }
          else {
            clear();
            box.appendChild(el('div', 'font-size:13px;', data.message || 'Thank you!'));
          }
        } else {
          done(data.message);
        }
      })
      .catch(function() {
        clear();
        box.appendChild(el('div', 'font-size:13px;', 'Could not send. Please try again.'));
      });
  }
  function done(msg) {
    clear();
    box.appendChild(el('div', 'font-size:13px;', msg || 'Thank you — we\\'ll be in touch.'));
  }
  document.body.appendChild(btn);
  document.body.appendChild(box);
})();
</script>`;
  res.json({ embedCode, businessName: user.businessName || '' });
});

module.exports = router;

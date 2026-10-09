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

// Public widget config. The embed fetches this when it loads, so changing the
// Google review link in Settings takes effect without re-pasting the snippet.
// Every visitor gets the same link, whatever they rate.
router.get('/:userId/config', async (req, res) => {
  try {
    const userId = parseUserId(req.params.userId);
    if (userId === null) return res.status(400).json({ error: 'Invalid business id' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Business not found' });

    res.json({
      businessName: user.businessName || '',
      reviewUrl: user.googleReviewUrl || null
    });
  } catch (err) {
    console.error('Widget config failed:', err.message);
    res.status(500).json({ error: 'Could not load widget settings.' });
  }
});

// Public widget endpoint: records a rating and optional private note.
// It does not decide what the visitor is offered; the widget always shows the
// public review link and the private feedback form to everyone.
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

    // Internal label for the owner's dashboard only. It never changes what the
    // customer is offered.
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
          subject: `Low-rated feedback — ${numericRating}/5 stars`,
          html: `
            <h2>Low-rated feedback</h2>
            <p><strong>Business:</strong> ${escapeHtml(user.businessName)}</p>
            <p><strong>Customer:</strong> ${escapeHtml(customerName || 'Anonymous')}</p>
            <p><strong>Rating:</strong> ${numericRating}/5</p>
            <p><strong>Comment:</strong> ${escapeHtml(comment || '')}</p>
            <p><strong>Email:</strong> ${escapeHtml(customerEmail || '')}</p>
            <hr/>
            <p>This feedback was sent privately through your widget. Consider replying to the customer.</p>
          `
        });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
      }
    }

    res.json({ message: 'Thank you for your feedback.', businessName: user.businessName || '' });
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
  // The embed is a self-contained IIFE: no dependencies, works on any site.
  // Every visitor sees the same two options after rating: the public Google
  // review link, and a separate private feedback form. Neither is withheld
  // based on the rating.
  const embedCode = `
<script>
(function () {
  var CONFIG_URL = "${apiBase}/api/widget/${userId}/config";
  var SUBMIT_URL = "${apiBase}/api/widget/${userId}/submit";
  var NAME = "us";
  var REVIEW_URL = "";
  var FONT = "font-family:system-ui,sans-serif;color:#0f172a;";
  var rating = 0;

  var box = document.createElement("div");
  box.setAttribute("style", "position:fixed;bottom:20px;right:20px;z-index:9999;width:300px;background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.25);padding:18px;display:none;" + FONT);
  var btn = document.createElement("button");
  btn.textContent = "Rate us";
  btn.setAttribute("style", "position:fixed;bottom:20px;right:20px;z-index:9999;background:#D97706;color:#fff;padding:12px 20px;border:none;border-radius:999px;cursor:pointer;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(217,119,6,.4);" + FONT);
  var close = document.createElement("button");
  close.textContent = "x";
  close.setAttribute("style", "position:absolute;top:6px;right:10px;background:none;border:none;font-size:18px;cursor:pointer;color:#94a3b8;");
  close.onclick = function () { box.style.display = "none"; btn.style.display = "block"; };

  function el(tag, style, text) {
    var e = document.createElement(tag);
    e.setAttribute("style", style + FONT);
    if (text != null) e.textContent = text;
    return e;
  }
  function clear() {
    while (box.firstChild) box.removeChild(box.firstChild);
    box.appendChild(close);
  }
  function showStars() {
    clear();
    box.appendChild(el("div", "font-weight:600;font-size:14px;", "How was your experience with " + NAME + "?"));
    var row = el("div", "display:flex;gap:4px;margin:10px 0;", "");
    for (var i = 1; i <= 5; i++) {
      (function (v) {
        var s = el("button", "background:none;border:none;font-size:26px;cursor:pointer;padding:0;color:#f59e0b;", "\u2605");
        s.onclick = function () { rating = v; showChoice(); };
        row.appendChild(s);
      })(i);
    }
    box.appendChild(row);
  }
  function showChoice() {
    clear();
    box.appendChild(el("div", "font-weight:600;font-size:14px;margin-bottom:10px;", "Thanks for rating us " + rating + "/5."));
    if (REVIEW_URL) {
      var go = el("button", "width:100%;background:#D97706;color:#fff;border:none;border-radius:8px;padding:10px;cursor:pointer;font-size:13px;font-weight:600;", "Leave a Google review");
      go.onclick = function () { window.open(REVIEW_URL, "_blank", "noopener"); };
      box.appendChild(go);
      box.appendChild(el("div", "font-size:12px;color:#64748b;margin:12px 0 6px;", "Or send private feedback to the owner:"));
    } else {
      box.appendChild(el("div", "font-size:12px;color:#64748b;margin-bottom:6px;", "Send private feedback to the owner:"));
    }
    var ta = el("textarea", "width:100%;box-sizing:border-box;border:1px solid #e2e8f0;border-radius:8px;padding:8px;font-size:13px;resize:vertical;", "");
    ta.rows = 3;
    ta.placeholder = "Tell us more (optional)";
    box.appendChild(ta);
    var send = el("button", "width:100%;margin-top:8px;background:#0f172a;color:#fff;border:none;border-radius:8px;padding:10px;cursor:pointer;font-size:13px;font-weight:600;", "Send private feedback");
    send.onclick = function () { submit(ta.value, send); };
    box.appendChild(send);
  }
  function submit(comment, sendBtn) {
    sendBtn.disabled = true;
    fetch(SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: rating, comment: comment || "" })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.data.error || "Could not send");
        clear();
        box.appendChild(el("div", "font-size:13px;", "Thank you. Your feedback was sent privately."));
      })
      .catch(function (err) {
        sendBtn.disabled = false;
        box.appendChild(el("div", "font-size:12px;color:#b91c1c;margin-top:8px;", err.message || "Could not send. Please try again."));
      });
  }

  btn.onclick = function () { btn.style.display = "none"; box.style.display = "block"; showStars(); };
  document.body.appendChild(btn);
  document.body.appendChild(box);

  fetch(CONFIG_URL)
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (cfg) {
      REVIEW_URL = cfg.reviewUrl || "";
      if (cfg.businessName) { NAME = cfg.businessName; btn.textContent = "Rate " + NAME; }
    })
    .catch(function () {});
})();
</script>`;
  res.json({ embedCode, businessName: user.businessName || '' });
});

module.exports = router;

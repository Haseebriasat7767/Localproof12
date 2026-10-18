const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

const router = express.Router();

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_COMMENT = 2000;

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'Too many submissions. Please try again shortly.' }
});

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

// Public widget endpoint — identical flow for every rating. Public review
// links are offered to everyone after submission, never based on sentiment.
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
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(customerEmail)))
      return res.status(400).json({ error: 'Please enter a valid email address' });
    if (comment != null && String(comment).length > MAX_COMMENT)
      return res.status(400).json({ error: 'Comment is too long' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Business not found' });

    const isUnhappy = numericRating <= 3;
    await Feedback.create({
      userId: user.id,
      customerName: String(customerName || 'Anonymous').trim().slice(0, MAX_NAME),
      customerEmail: String(customerEmail || '').trim().slice(0, MAX_EMAIL),
      rating: numericRating,
      comment: String(comment || '').trim(),
      isUnhappy
    });

    if (isUnhappy && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: user.email,
          subject: 'New customer feedback — ' + numericRating + '/5 stars',
          html: '<h2>New Customer Feedback</h2>' +
            '<p><strong>Business:</strong> ' + escapeHtml(user.businessName) + '</p>' +
            '<p><strong>Customer:</strong> ' + escapeHtml(customerName || 'Anonymous') + '</p>' +
            '<p><strong>Rating:</strong> ' + numericRating + '/5</p>' +
            '<p><strong>Comment:</strong> ' + escapeHtml(comment || '') + '</p>' +
            '<p><strong>Email:</strong> ' + escapeHtml(customerEmail || '') + '</p>'
        });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
      }
    }

    res.json({
      message: 'Thank you for sharing your feedback.',
      reviewUrl: user.reviewUrl || ''
    });
  } catch (err) {
    console.error('Widget submit failed:', err.message);
    res.status(500).json({ error: 'Could not record feedback. Please try again.' });
  }
});

// Backwards-compatible alias used by older demo embeds.
router.post('/:userId/feedback', submitLimiter, async (req, res) => {
  req.url = '/' + req.params.userId + '/submit';
  router.handle(req, res);
});

// Return an accessible, branded modal embed. The same optional public-review
// link is offered after every rating; rating never determines review access.
router.get('/:userId/embed', async (req, res) => {
  try {
    const userId = parseUserId(req.params.userId);
    if (userId === null) return res.status(400).json({ error: 'Invalid business id' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Business not found' });

    const apiBase = process.env.BACKEND_URL || process.env.FRONTEND_URL || 'http://localhost:3001';
    const apiBaseJson = JSON.stringify(apiBase);
    const reviewUrlJson = JSON.stringify(user.reviewUrl || '');
    const embedCode = '<script>(function(){' +
      'if(document.getElementById("localproof-widget-' + userId + '"))return;' +
      'var API=' + apiBaseJson + ',BUSINESS=' + userId + ',REVIEW_URL=' + reviewUrlJson + ';' +
      'var root=document.createElement("div");root.id="localproof-widget-' + userId + '";' +
      'var style=document.createElement("style");style.textContent=' +
      '"#lp-trigger-' + userId + '{position:fixed;right:20px;bottom:20px;z-index:2147483000;background:#111827;color:#fff;border:0;border-radius:999px;padding:13px 18px;font:600 14px system-ui;box-shadow:0 8px 30px #0003;cursor:pointer}" +' +
      '"#lp-panel-' + userId + '{position:fixed;right:20px;bottom:78px;z-index:2147483000;width:min(360px,calc(100vw - 32px));box-sizing:border-box;background:#fff;color:#111827;border:1px solid #e5e7eb;border-radius:18px;padding:20px;box-shadow:0 18px 60px #0003;font:14px system-ui}" +' +
      '"#lp-panel-' + userId + ' *{box-sizing:border-box}#lp-panel-' + userId + ' input,#lp-panel-' + userId + ' textarea,#lp-panel-' + userId + ' select{width:100%;margin:5px 0 12px;padding:10px;border:1px solid #d1d5db;border-radius:8px;font:inherit;color:#111827;background:#fff}" +' +
      '"#lp-panel-' + userId + ' button{cursor:pointer;border:0;border-radius:8px;padding:10px 12px;font:600 14px system-ui}#lp-submit-' + userId + '{width:100%;background:#111827;color:#fff}#lp-close-' + userId + '{float:right;background:#f3f4f6;color:#111827}" +' +
      '"#lp-result-' + userId + '{line-height:1.5;margin-top:12px}#lp-panel-' + userId + ' a{color:#1d4ed8;font-weight:600}";' +
      'document.head.appendChild(style);' +
      'var button=document.createElement("button");button.id="lp-trigger-' + userId + '";button.type="button";button.textContent="Share feedback";button.setAttribute("aria-expanded","false");' +
      'var panel=document.createElement("section");panel.id="lp-panel-' + userId + '";panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Share feedback");' +
      'panel.innerHTML="<button type=\\"button\\" id=\\"lp-close-' + userId + '\\" aria-label=\\"Close\\">Close</button><h2 style=\\"font-size:19px;margin:0 0 6px\\">How was your experience?</h2><p style=\\"color:#4b5563;margin:0 0 12px\\">Your honest feedback helps us improve.</p><form id=\\"lp-form-' + userId + '\\"><label for=\\"lp-rating-' + userId + '\\">Rating</label><select id=\\"lp-rating-' + userId + '\\" required><option value=\\"\\">Choose a rating</option><option value=\\"5\\">5 — Excellent</option><option value=\\"4\\">4 — Good</option><option value=\\"3\\">3 — Okay</option><option value=\\"2\\">2 — Poor</option><option value=\\"1\\">1 — Very poor</option></select><label for=\\"lp-comment-' + userId + '\\">Comments (optional)</label><textarea id=\\"lp-comment-' + userId + '\\" rows=\\"3\\" maxlength=\\"2000\\" placeholder=\\"Tell us about your experience\\"></textarea><label for=\\"lp-name-' + userId + '\\">Name (optional)</label><input id=\\"lp-name-' + userId + '\\" maxlength=\\"120\\" autocomplete=\\"name\\"/><label for=\\"lp-email-' + userId + '\\">Email (optional)</label><input id=\\"lp-email-' + userId + '\\" type=\\"email\\" maxlength=\\"254\\" autocomplete=\\"email\\"/><button id=\\"lp-submit-' + userId + '\\" type=\\"submit\\">Send feedback</button><div id=\\"lp-result-' + userId + '\\" role=\\"status\\" aria-live=\\"polite\\"></div></form>";' +
      'root.appendChild(button);root.appendChild(panel);document.body.appendChild(root);' +
      'button.addEventListener("click",function(){panel.hidden=!panel.hidden;button.setAttribute("aria-expanded",String(!panel.hidden));if(!panel.hidden)document.getElementById("lp-rating-' + userId + '").focus();});' +
      'document.getElementById("lp-close-' + userId + '").addEventListener("click",function(){panel.hidden=true;button.setAttribute("aria-expanded","false");button.focus();});' +
      'document.getElementById("lp-form-' + userId + '").addEventListener("submit",async function(e){e.preventDefault();var submit=document.getElementById("lp-submit-' + userId + '"),result=document.getElementById("lp-result-' + userId + '");submit.disabled=true;submit.textContent="Sending…";result.textContent="";' +
      'try{var response=await fetch(API+"/api/widget/' + userId + '/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rating:Number(document.getElementById("lp-rating-' + userId + '").value),comment:document.getElementById("lp-comment-' + userId + '").value,customerName:document.getElementById("lp-name-' + userId + '").value,customerEmail:document.getElementById("lp-email-' + userId + '").value})});var data=await response.json();if(!response.ok)throw new Error(data.error||"Could not send feedback.");' +
      'result.textContent=data.message||"Thank you for your feedback.";if(data.reviewUrl){var link=document.createElement("a");link.href=data.reviewUrl;link.target="_blank";link.rel="noopener noreferrer";link.textContent="Share your experience publicly";result.appendChild(document.createElement("br"));result.appendChild(link);}document.getElementById("lp-form-' + userId + '").querySelectorAll("input,textarea,select,button[type=submit]").forEach(function(el){el.disabled=true;});' +
      '}catch(err){result.textContent=err.message||"Something went wrong. Please try again.";}finally{submit.textContent="Send feedback";if(!document.getElementById("lp-rating-' + userId + '").disabled)submit.disabled=false;}});' +
      '})();</script>';

    res.json({ embedCode });
  } catch (err) {
    console.error('Widget embed generation failed:', err.message);
    res.status(500).json({ error: 'Could not generate the widget embed code' });
  }
});

module.exports = router;

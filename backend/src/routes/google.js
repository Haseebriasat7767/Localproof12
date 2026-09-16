const express = require('express');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const requireActive = require('../middleware/requireActive');
const User = require('../models/User');
const Review = require('../models/Review');
const google = require('../services/googleBusiness');
const { analyzeSentiment, detectFakeReview } = require('../services/claude');

const router = express.Router();

const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:3000';

// Starts the OAuth flow. Returns a URL rather than redirecting directly,
// since this call carries the user's JWT in an Authorization header — a
// plain browser navigation can't send that. The frontend redirects the
// browser to the returned url itself.
router.get('/connect', auth, (req, res) => {
  if (!google.isConfigured()) {
    return res.status(400).json({ error: 'Google integration is not configured on this server' });
  }
  // Short-lived, signed state so /callback (which Google calls directly,
  // with no Authorization header of its own) knows which user is connecting
  // without trusting an unsigned query param.
  const state = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '10m' });
  res.json({ url: google.getAuthUrl(state) });
});

// Google redirects the browser here after the consent screen.
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  if (error) return res.redirect(`${frontendUrl()}/settings?google=denied`);
  if (!code || !state) return res.redirect(`${frontendUrl()}/settings?google=error`);

  let userId;
  try {
    ({ userId } = jwt.verify(state, process.env.JWT_SECRET));
  } catch {
    return res.redirect(`${frontendUrl()}/settings?google=error`);
  }

  try {
    const tokens = await google.exchangeCodeForTokens(code);
    await User.findByIdAndUpdate(userId, {
      googleConnected: true,
      googleTokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresAt: tokens.expiresAt }
    });
    res.redirect(`${frontendUrl()}/settings?google=connected`);
  } catch (err) {
    console.error('Google OAuth callback failed:', err.response?.data || err.message);
    res.redirect(`${frontendUrl()}/settings?google=error`);
  }
});

// Refreshes the stored token if needed and persists the refreshed copy.
async function accessTokenFor(user) {
  return google.getValidAccessToken(user.googleTokens, async (updated) => {
    await User.findByIdAndUpdate(user.id, { googleTokens: updated });
  });
}

// Lists the Google Business Profile locations this account manages, so the
// user can pick which one to sync reviews from.
router.get('/locations', auth, async (req, res, next) => {
  try {
    if (!req.user.googleConnected) return res.status(400).json({ error: 'Google account not connected' });

    const accessToken = await accessTokenFor(req.user);
    const accounts = await google.listAccounts(accessToken);

    const locations = [];
    for (const account of accounts) {
      const accountLocations = await google.listLocations(accessToken, account.name);
      for (const location of accountLocations) {
        locations.push({
          accountId: account.name,
          locationId: location.name,
          title: location.title || location.name
        });
      }
    }
    res.json({ locations });
  } catch (err) {
    // Reviews access on Google's Business Profile APIs requires a manual
    // approval from Google per OAuth client — a 403 here almost always means
    // that hasn't been granted yet, not a bug in this integration.
    if (err.response?.status === 403) {
      return res.status(502).json({
        error: 'Google denied access to Business Profile data. This app\'s Google API access may still be pending approval.'
      });
    }
    next(err);
  }
});

// Saves which location to sync reviews from.
router.post('/link', auth, async (req, res, next) => {
  try {
    const { accountId, locationId, title } = req.body;
    if (!accountId || !locationId) return res.status(400).json({ error: 'accountId and locationId are required' });

    const user = await User.findByIdAndUpdate(req.user.id, {
      googleAccountId: accountId,
      googleLocationId: locationId,
      googleLocationName: title || ''
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// Pulls current reviews from the linked location and imports any new ones.
router.post('/sync', auth, requireActive, async (req, res, next) => {
  try {
    if (!req.user.googleConnected) return res.status(400).json({ error: 'Google account not connected' });
    if (!req.user.googleLocationId) return res.status(400).json({ error: 'No Google location linked yet' });

    const accessToken = await accessTokenFor(req.user);
    const googleReviews = await google.listReviews(accessToken, req.user.googleAccountId, req.user.googleLocationId);

    let imported = 0;
    for (const raw of googleReviews) {
      const normalized = google.normalizeReview(raw);
      const sentiment = await analyzeSentiment(normalized.text);
      const { isFake, reasons } = await detectFakeReview({ rating: normalized.rating, text: normalized.text });

      const created = await Review.upsertExternal({
        userId: req.user.id,
        platform: 'google',
        ...normalized,
        sentiment,
        isFakeSuspected: isFake,
        fakeReasons: reasons
      });
      if (created) imported += 1;
    }

    res.json({ imported, total: googleReviews.length });
  } catch (err) {
    if (err.response?.status === 403) {
      return res.status(502).json({
        error: 'Google denied access to review data. This app\'s Google API access may still be pending approval.'
      });
    }
    next(err);
  }
});

module.exports = router;

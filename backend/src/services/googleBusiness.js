const axios = require('axios');

// Google Business Profile integration.
//
// Three separate Google APIs are involved, each with its own host:
//  - oauth2.googleapis.com          token exchange / refresh
//  - mybusinessaccountmanagement    list the accounts this user manages
//  - mybusinessbusinessinformation  list locations under an account
//  - mybusiness (v4)                the review data itself
//
// Reviews access is NOT self-serve: Google gates the Business Profile APIs
// behind a manual approval (https://developers.google.com/my-business/content/basic-setup#request-access)
// that can take days to weeks. Until that's granted for this app's OAuth
// client, listLocations/listReviews will fail with a 403 from Google — that
// is Google rejecting the request, not a bug here.
const OAUTH_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const ACCOUNTS_URL = 'https://mybusinessaccountmanagement.googleapis.com/v1/accounts';
const LOCATIONS_URL = (accountId) =>
  `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations?readMask=name,title`;
const REVIEWS_URL = (accountId, locationId) =>
  `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews`;

const SCOPE = 'https://www.googleapis.com/auth/business.manage';

function isConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function redirectUri() {
  return process.env.GOOGLE_REDIRECT_URI ||
    `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/google/callback`;
}

// `state` carries the signed, short-lived token identifying which user is
// connecting — Google echoes it back on the callback unmodified.
function getAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

async function exchangeCodeForTokens(code) {
  const { data } = await axios.post(OAUTH_TOKEN_URL, {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri(),
    grant_type: 'authorization_code'
  });
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000
  };
}

async function refreshAccessToken(refreshToken) {
  const { data } = await axios.post(OAUTH_TOKEN_URL, {
    refresh_token: refreshToken,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    grant_type: 'refresh_token'
  });
  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000
  };
}

// Returns a valid access token for this user's stored tokens, refreshing and
// persisting a new one first if the current one has expired. `onRefresh` is
// called with the updated token bundle so the caller can save it.
async function getValidAccessToken(tokens, onRefresh) {
  if (tokens.expiresAt && tokens.expiresAt > Date.now() + 60000) {
    return tokens.accessToken;
  }
  const refreshed = await refreshAccessToken(tokens.refreshToken);
  const updated = { ...tokens, accessToken: refreshed.accessToken, expiresAt: refreshed.expiresAt };
  if (onRefresh) await onRefresh(updated);
  return updated.accessToken;
}

async function listAccounts(accessToken) {
  const { data } = await axios.get(ACCOUNTS_URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return data.accounts || [];
}

async function listLocations(accessToken, accountId) {
  const { data } = await axios.get(LOCATIONS_URL(accountId), {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return data.locations || [];
}

async function listReviews(accessToken, accountId, locationId) {
  const { data } = await axios.get(REVIEWS_URL(accountId, locationId), {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return data.reviews || [];
}

// Google's star rating comes back as an enum string, not a number.
const STAR_RATING_MAP = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

function normalizeReview(googleReview) {
  return {
    reviewId: googleReview.reviewId,
    authorName: googleReview.reviewer?.displayName || 'Anonymous',
    rating: STAR_RATING_MAP[googleReview.starRating] || 5,
    text: googleReview.comment || '',
    date: googleReview.createTime ? new Date(googleReview.createTime) : new Date()
  };
}

module.exports = {
  isConfigured,
  getAuthUrl,
  exchangeCodeForTokens,
  getValidAccessToken,
  listAccounts,
  listLocations,
  listReviews,
  normalizeReview
};

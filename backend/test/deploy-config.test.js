const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO = path.join(__dirname, '../..');

// `.env.production` is committed and baked into the frontend bundle at build
// time, so a placeholder left in it ships to production and silently points
// every API call at a domain that does not exist.
const PLACEHOLDER = /your-[a-z-]*(app|domain|project)|example\.com|CHANGEME|<[a-z-]+>/i;

describe('committed deployment config', () => {
  test('frontend production env has no placeholder values', () => {
    const file = path.join(REPO, 'frontend/.env.production');
    const contents = fs.readFileSync(file, 'utf8');

    for (const line of contents.split('\n')) {
      if (!line.trim() || line.trim().startsWith('#')) continue;
      assert.doesNotMatch(
        line,
        PLACEHOLDER,
        `frontend/.env.production ships to production — replace the placeholder in: ${line}`
      );
    }
  });

  test('frontend API base points at the same origin', () => {
    const contents = fs.readFileSync(path.join(REPO, 'frontend/.env.production'), 'utf8');
    const match = contents.match(/^REACT_APP_API_URL=(.*)$/m);
    assert.ok(match, 'REACT_APP_API_URL should be set explicitly');
    assert.equal(
      match[1].trim(),
      '/api',
      'the API is served from /api on the same Vercel domain; override in the dashboard for a split deploy'
    );
  });

  test('vercel.json routes /api to the serverless function', () => {
    const vercel = JSON.parse(fs.readFileSync(path.join(REPO, 'vercel.json'), 'utf8'));
    const apiRewrite = vercel.rewrites.find((r) => r.source.startsWith('/api'));
    assert.ok(apiRewrite, 'an /api rewrite must exist or the backend is unreachable');
    assert.ok(vercel.functions['api/index.js'], 'the serverless function must be declared');
  });

  test('the serverless entrypoint exists at the repo root', () => {
    // If this moves under frontend/, or Vercel's Root Directory is set to
    // frontend, the API is excluded from the deployment entirely.
    assert.ok(fs.existsSync(path.join(REPO, 'api/index.js')));
  });
});

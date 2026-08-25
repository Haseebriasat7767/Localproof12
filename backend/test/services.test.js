const { test, describe } = require('node:test');
const assert = require('node:assert');

const { analyzeSentiment, detectFakeReview, generateReplyDraft } = require('../src/services/claude');

describe('analyzeSentiment', () => {
  test('classifies clearly negative text as negative', async () => {
    assert.equal(await analyzeSentiment('This was terrible and the staff were rude'), 'negative');
  });

  test('classifies clearly positive text as positive', async () => {
    assert.equal(await analyzeSentiment('Amazing service, absolutely wonderful'), 'positive');
  });

  test('falls back to neutral when there are no signal words', async () => {
    assert.equal(await analyzeSentiment('I visited on Tuesday afternoon'), 'neutral');
  });

  test('falls back to neutral when positive and negative signals tie', async () => {
    assert.equal(await analyzeSentiment('The food was great but the service was awful'), 'neutral');
  });
});

describe('detectFakeReview', () => {
  test('flags a review only when at least two heuristics fire', async () => {
    // Short AND generic phrasing => two reasons => flagged.
    const result = await detectFakeReview({ rating: 5, text: 'best ever' });
    assert.equal(result.isFake, true);
    assert.ok(result.reasons.length >= 2);
  });

  test('does not flag a substantial, specific review', async () => {
    const result = await detectFakeReview({
      rating: 5,
      text: 'The technician arrived on time and walked me through the repair in detail.'
    });
    assert.equal(result.isFake, false);
    assert.deepEqual(result.reasons, []);
  });

  test('does not flag on a single heuristic alone', async () => {
    // Long text, but with repeated characters => exactly one reason.
    const result = await detectFakeReview({
      rating: 4,
      text: 'This place is really goooood and I would come back again next week for sure'
    });
    assert.equal(result.reasons.length, 1);
    assert.equal(result.isFake, false);
  });

  test('handles a missing text field without throwing', async () => {
    const result = await detectFakeReview({ rating: 1 });
    assert.equal(typeof result.isFake, 'boolean');
  });
});

describe('generateReplyDraft', () => {
  // No DEEPSEEK_API_KEY in the test env, so this exercises the fallback path
  // rather than making a network call.
  test('returns a usable reply when no API key is configured', async () => {
    delete process.env.DEEPSEEK_API_KEY;
    const draft = await generateReplyDraft({ rating: 5, text: 'Great!' }, 'Test Biz', 'professional');
    assert.ok(draft.length > 0);
    assert.equal(typeof draft, 'string');
  });

  test('fallback text varies by configured tone', async () => {
    delete process.env.DEEPSEEK_API_KEY;
    const review = { rating: 5, text: 'Great!' };
    const professional = await generateReplyDraft(review, 'Test Biz', 'professional');
    const casual = await generateReplyDraft(review, 'Test Biz', 'casual');
    assert.notEqual(professional, casual);
  });
});

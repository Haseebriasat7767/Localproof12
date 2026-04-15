const axios = require('axios');

// Uses Claude Haiku (cheapest model) to save API costs
const CLAUDE_MODEL = 'claude-haiku-20240307';

async function generateReplyDraft(review, businessName, tone = 'professional') {
  const toneMap = {
    professional: 'professional and courteous',
    friendly: 'warm and friendly',
    casual: 'casual and conversational'
  };

  const prompt = `You are a ${toneMap[tone]} business owner named at "${businessName}".
Write a SHORT reply (2-4 sentences max) to this customer review.
Rating: ${review.rating}/5
Review: "${review.text}"

Rules:
- Thank them if positive
- Apologize and offer to resolve if negative
- Never be defensive
- Sound human, not robotic
- Do NOT include subject lines or signatures
Reply only with the response text:`;

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: CLAUDE_MODEL,
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }]
    },
    {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    }
  );

  return response.data.content[0].text.trim();
}

async function analyzeSentiment(text) {
  // Simple keyword-based to save tokens — no API call needed
  const negative = ['terrible', 'horrible', 'worst', 'awful', 'bad', 'rude', 'never again', 'disappointed', 'scam', 'fraud'];
  const positive = ['great', 'excellent', 'amazing', 'love', 'best', 'perfect', 'wonderful', 'fantastic'];

  const lower = text.toLowerCase();
  const negCount = negative.filter(w => lower.includes(w)).length;
  const posCount = positive.filter(w => lower.includes(w)).length;

  if (negCount > posCount) return 'negative';
  if (posCount > negCount) return 'positive';
  return 'neutral';
}

async function detectFakeReview(review) {
  const reasons = [];
  const text = review.text || '';

  // Heuristic detection — no API call needed
  if (text.length < 15) reasons.push('Suspiciously short review');
  if (review.rating === 1 && text.length < 30) reasons.push('1-star with no explanation');
  if (/(.)\1{4,}/.test(text)) reasons.push('Repeated characters detected');
  const genericPhrases = ['worst ever', 'best ever', 'highly recommend', 'do not use'];
  if (genericPhrases.some(p => text.toLowerCase().includes(p)) && text.length < 50)
    reasons.push('Generic phrasing with no detail');

  return { isFake: reasons.length >= 2, reasons };
}

module.exports = { generateReplyDraft, analyzeSentiment, detectFakeReview };

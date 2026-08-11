const axios = require('axios');

// DeepSeek is OpenAI-compatible and keeps the AI reply feature independent of Claude.
const DEEPSEEK_MODEL = 'deepseek-chat';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

async function generateReplyDraft(review, businessName, tone = 'professional') {
  // Graceful fallback if no API key is configured.
  if (!process.env.DEEPSEEK_API_KEY) {
    const fallback = tone === 'professional'
      ? `Thank you for your feedback! We truly appreciate you taking the time to share your experience with us.`
      : tone === 'friendly'
      ? `Thanks so much for your review! We're really glad you enjoyed your experience with us.`
      : `Hey, thanks for the review! Really appreciate you stopping by and sharing your thoughts.`;
    return fallback;
  }

  const toneMap = {
    professional: 'professional and courteous',
    friendly: 'warm and friendly',
    casual: 'casual and conversational'
  };

  const prompt = `You are a ${toneMap[tone] || toneMap.professional} business owner at "${businessName}".
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
    DEEPSEEK_API_URL,
    {
      model: DEEPSEEK_MODEL,
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }]
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'content-type': 'application/json'
      },
      timeout: 30000
    }
  );

  return response.data.choices[0].message.content.trim();
}

async function analyzeSentiment(text) {
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

  if (text.length < 15) reasons.push('Suspiciously short review');
  if (review.rating === 1 && text.length < 30) reasons.push('1-star with no explanation');
  if (/(.)\1{4,}/.test(text)) reasons.push('Repeated characters detected');
  const genericPhrases = ['worst ever', 'best ever', 'highly recommend', 'do not use'];
  if (genericPhrases.some(p => text.toLowerCase().includes(p)) && text.length < 50)
    reasons.push('Generic phrasing with no detail');

  return { isFake: reasons.length >= 2, reasons };
}

module.exports = { generateReplyDraft, analyzeSentiment, detectFakeReview };

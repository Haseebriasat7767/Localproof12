import React, { useState } from 'react';
import { Star, X, ExternalLink } from 'lucide-react';

// Live preview of the customer-facing widget, rendered inside the dashboard.
// It uses the exact same routing rules as the embed script on a customer's
// site: 4-5 stars routes to the business's Google review page, 1-3 stars
// opens a private comment form. Submissions are recorded for real, so this
// doubles as an end-to-end check that the widget → API → alerts loop works.
export default function WidgetPreview({ userId, businessName, googleReviewUrl }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(null); // 'happy' | 'unhappy'
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const apiBase = process.env.REACT_APP_API_URL || '/api';

  const pick = (value) => {
    setRating(value);
    setError('');
    if (value >= 4) submit(value, '');
  };

  const submit = async (value, text) => {
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/widget/${userId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: value, comment: text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send');
      setSent(value >= 4 ? 'happy' : 'unhappy');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const reset = () => { setRating(0); setComment(''); setSent(null); setError(''); };

  return (
    <div className="relative bg-[#0a0e1a] border border-white/10 rounded-xl p-5 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Live preview</span>
        <button onClick={reset} className="text-slate-500 hover:text-white transition" aria-label="Reset preview">
          <X size={14} />
        </button>
      </div>

      {sent === 'happy' && (
        <div className="text-center py-4">
          <p className="text-sm font-semibold text-white">Thanks so much! ❤️</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Mind sharing it on Google? It takes 20 seconds.</p>
          {googleReviewUrl ? (
            <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-brand-400 transition">
              Leave a Google review <ExternalLink size={12} />
            </a>
          ) : (
            <p className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
              Set your Google review link in Settings to route happy customers here.
            </p>
          )}
        </div>
      )}

      {sent === 'unhappy' && (
        <div className="text-center py-4">
          <p className="text-sm font-semibold text-white">Thank you for telling us.</p>
          <p className="text-xs text-slate-400 mt-1">Your feedback stays private — we'll be in touch.</p>
          <p className="text-xs text-emerald-400 mt-3">✓ Recorded — it appears under Alerts</p>
        </div>
      )}

      {!sent && rating < 4 && (
        <div>
          <p className="text-sm font-medium text-white">Sorry to hear that.</p>
          <p className="text-xs text-slate-400 mt-1 mb-3">Tell us what happened — this stays private.</p>
          <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
            placeholder="What went wrong?"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 transition" />
          <button onClick={() => submit(rating, comment)} disabled={sending || !rating}
            className="w-full mt-2 bg-slate-700 text-white text-xs font-semibold py-2 rounded-lg hover:bg-slate-600 transition disabled:opacity-50">
            {sending ? 'Sending…' : 'Send feedback'}
          </button>
        </div>
      )}

      {!sent && rating >= 4 && sending && (
        <p className="text-xs text-slate-500 text-center py-4">Sending…</p>
      )}

      {!sent && rating === 0 && (
        <div>
          <p className="text-sm font-medium text-white">How was your experience with {businessName || 'us'}?</p>
          <div className="flex gap-1 mt-3" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} onClick={() => pick(v)} onMouseEnter={() => setHover(v)}
                className="bg-none border-none cursor-pointer p-0.5 transition-transform hover:scale-110">
                <Star size={26} className={(hover || rating) >= v ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3">4-5★ → Google review · 1-3★ → private feedback</p>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
    </div>
  );
}

import React, { useState } from 'react';
import { Star, X, ExternalLink } from 'lucide-react';

// Live preview of the customer-facing widget, rendered inside the dashboard.
// It mirrors the embed script on a customer's site: after rating, EVERY
// visitor sees the same two options: the public Google review link, and a
// separate private feedback form. Neither is withheld based on the rating.
// Private feedback is recorded for real, so this also checks the widget → API
// → alerts loop.
export default function WidgetPreview({ userId, businessName, googleReviewUrl }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const apiBase = process.env.REACT_APP_API_URL || '/api';

  const sendPrivate = async () => {
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${apiBase}/widget/${userId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send');
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const reset = () => { setRating(0); setComment(''); setSent(false); setError(''); };

  return (
    <div className="relative bg-[#0a0e1a] border border-white/10 rounded-xl p-5 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Live preview</span>
        <button onClick={reset} className="text-slate-500 hover:text-white transition" aria-label="Reset preview">
          <X size={14} />
        </button>
      </div>

      {rating === 0 && (
        <div>
          <p className="text-sm font-medium text-white">How was your experience with {businessName || 'us'}?</p>
          <div className="flex gap-1 mt-3" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map(v => (
              <button key={v} onClick={() => setRating(v)} onMouseEnter={() => setHover(v)}
                aria-label={`${v} star${v > 1 ? 's' : ''}`}
                className="bg-none border-none cursor-pointer p-0.5 transition-transform hover:scale-110">
                <Star size={26} className={(hover || rating) >= v ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
              </button>
            ))}
          </div>
        </div>
      )}

      {rating > 0 && !sent && (
        <div>
          <p className="text-sm font-semibold text-white mb-3">Thanks for rating us {rating}/5.</p>
          {googleReviewUrl ? (
            <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-brand-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-brand-400 transition">
              Leave a Google review <ExternalLink size={12} />
            </a>
          ) : (
            <p className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
              Set your Google review link in Settings to show it to visitors.
            </p>
          )}
          <p className="text-xs text-slate-500 mt-4 mb-1.5">
            {googleReviewUrl ? 'Or send private feedback to the owner:' : 'Send private feedback to the owner:'}
          </p>
          <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Tell us more (optional)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 transition" />
          <button onClick={sendPrivate} disabled={sending}
            className="w-full mt-2 bg-slate-700 text-white text-xs font-semibold py-2 rounded-lg hover:bg-slate-600 transition disabled:opacity-50">
            {sending ? 'Sending…' : 'Send private feedback'}
          </button>
        </div>
      )}

      {sent && (
        <div className="text-center py-4">
          <p className="text-sm font-semibold text-white">Thank you. Your feedback was sent privately.</p>
          <p className="text-xs text-emerald-400 mt-3">✓ Recorded: it appears under Alerts</p>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
    </div>
  );
}

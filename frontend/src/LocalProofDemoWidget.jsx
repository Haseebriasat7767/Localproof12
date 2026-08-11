import React, { useState } from 'react';

export default function LocalProofDemoWidget({ userId, apiUrl, googleReviewUrl }) {
  const [step, setStep] = useState('rating');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const baseUrl = apiUrl || process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  const handleRating = (r) => {
    setRating(r);
    setError('');
    setStep(r >= 4 ? 'positive' : 'negative');
  };

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      setError('Please tell us what went wrong.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${baseUrl}/widget/${userId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: feedback.trim(), customerName: 'Anonymous' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to submit feedback');
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const leaveReview = () => {
    if (googleReviewUrl) window.open(googleReviewUrl, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  if (submitted) return <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}><div style={{ fontSize: '40px' }}>🙏</div><h3 style={{ color: '#1e293b' }}>Thank you for your feedback!</h3></div>;

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '400px' }}>
      {step === 'rating' && <div><h3 style={{ color: '#1e293b', marginBottom: '16px' }}>How was your experience?</h3><div style={{ display: 'flex', gap: '8px' }}>{[1, 2, 3, 4, 5].map((r) => <button key={r} type="button" aria-label={`${r} stars`} onClick={() => handleRating(r)} style={{ fontSize: '28px', background: 'none', border: 'none', cursor: 'pointer', opacity: rating >= r ? 1 : 0.4 }}>⭐</button>)}</div></div>}
      {step === 'positive' && <div><h3 style={{ color: '#1e293b' }}>Great! Would you leave us a review?</h3><p style={{ color: '#64748b' }}>Your feedback helps others find us.</p><button type="button" onClick={leaveReview} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', marginRight: '8px' }}>Leave a Review</button><button type="button" onClick={() => setStep('negative')} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>No thanks</button></div>}
      {step === 'negative' && <div><h3 style={{ color: '#1e293b' }}>We&apos;re sorry to hear that.</h3><p style={{ color: '#64748b' }}>Tell us what went wrong:</p><textarea maxLength={2000} value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', marginBottom: '12px', resize: 'vertical', boxSizing: 'border-box' }} placeholder="Your feedback..." />{error && <p role="alert" style={{ color: 'red', fontSize: '14px' }}>{error}</p>}<button type="button" disabled={loading} onClick={handleSubmit} style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'Sending...' : 'Send Feedback'}</button></div>}
    </div>
  );
}

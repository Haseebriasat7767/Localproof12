import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Star, Shield, Zap, Globe, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { billing } from '../services/api';

const features = [
  { icon: Star, text: 'Unlimited review tracking' },
  { icon: Zap, text: 'AI reply drafts (DeepSeek)' },
  { icon: Shield, text: 'Fake review detection' },
  { icon: Globe, text: 'Embeddable feedback widget' },
  { icon: CheckCircle, text: 'Unhappy customer alerts (email)' },
  { icon: CheckCircle, text: 'Weekly reputation digest' },
  { icon: CheckCircle, text: 'Multi-platform (Google, Yelp)' },
  { icon: CheckCircle, text: 'Cancel anytime' }
];

export default function Pricing() {
  const { user, loading } = useAuth();
  const { search } = useLocation();
  const expired = new URLSearchParams(search).get('expired') === '1';
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');

  const subscribe = async () => {
    setCheckingOut(true);
    setError('');
    try {
      const res = await billing.checkout();
      window.location.href = res.data.url;
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start checkout. Please try again.');
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center px-6 py-16">
      <Link to="/" className="flex items-center gap-2.5 mb-10">
        <img src="/logo.svg" alt="LocalProof" className="w-8 h-8" />
        <span className="text-xl font-bold text-white tracking-tight">LocalProof</span>
      </Link>

      {expired && (
        <div className="mb-8 max-w-md w-full flex items-start gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
          <AlertTriangle size={18} className="text-orange-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-300">Your free trial has ended</p>
            <p className="text-xs text-orange-300/70 mt-1">
              Subscribe to get back into your dashboard — your reviews and feedback are safe.
            </p>
          </div>
        </div>
      )}

      <div className="text-center max-w-xl mb-10">
        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Simple pricing</h2>
        <p className="text-slate-400">Everything you need to protect your reputation. No hidden fees.</p>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-10 w-full max-w-sm text-center hover:border-white/20 transition duration-300">
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs font-semibold mb-6">
          Pro Plan
        </div>
        <div className="flex items-end justify-center gap-1 mb-1">
          <span className="text-5xl font-bold text-white">$49</span>
          <span className="text-slate-400 mb-2">/month</span>
        </div>
        <p className="text-xs text-slate-500 mb-8">
          {user ? 'Billed monthly · Cancel anytime' : '14-day free trial · No credit card · Pay after trial'}
        </p>

        <ul className="space-y-3 text-left mb-8">
          {features.map(f => (
            <li key={f.text} className="flex items-center gap-3 text-sm text-slate-300">
              <f.icon size={16} className="text-brand-500 shrink-0" /> {f.text}
            </li>
          ))}
        </ul>

        {error && (
          <p className="text-red-400 text-xs mb-3 text-left">{error}</p>
        )}

        {loading ? (
          <div className="w-full py-3.5 rounded-xl bg-white/10 text-slate-400 text-sm font-medium text-center">
            Loading…
          </div>
        ) : user ? (
          <button onClick={subscribe} disabled={checkingOut}
            className="w-full bg-white text-[#0a0e1a] py-3.5 rounded-xl font-semibold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {checkingOut ? 'Redirecting…' : <>Subscribe now <ArrowRight size={16} /></>}
          </button>
        ) : (
          <Link to="/register"
            className="block w-full bg-white text-[#0a0e1a] py-3.5 rounded-xl font-semibold hover:bg-slate-200 text-center transition-all flex items-center justify-center gap-2">
            Start free trial <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {!user && (
        <p className="text-slate-500 text-sm mt-8">
          Already have an account? <Link to="/login" className="text-white font-medium hover:underline">Sign in</Link>
        </p>
      )}
    </div>
  );
}

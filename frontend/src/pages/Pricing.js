import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Star, Shield, Zap, Globe } from 'lucide-react';

const features = [
  { icon: Star, text: 'Unlimited review tracking' },
  { icon: Zap, text: 'AI reply drafts (Claude Haiku)' },
  { icon: Shield, text: 'Fake review detection' },
  { icon: Globe, text: 'Embeddable feedback widget' },
  { icon: CheckCircle, text: 'Unhappy customer alerts (email)' },
  { icon: CheckCircle, text: 'Weekly reputation digest' },
  { icon: CheckCircle, text: 'Multi-platform (Google, Yelp)' },
  { icon: CheckCircle, text: 'Cancel anytime' }
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center px-6 py-16">
      <Link to="/" className="flex items-center gap-2.5 mb-10">
        <img src="/logo.svg" alt="LocalProof" className="w-8 h-8" />
        <span className="text-xl font-bold text-white tracking-tight">LocalProof</span>
      </Link>

      <div className="text-center max-w-xl mb-10">
        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Simple pricing</h2>
        <p className="text-slate-400">Everything you need to protect your reputation. No hidden fees.</p>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-10 w-full max-w-sm text-center hover:border-white/20 transition duration-300">
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
          Pro Plan
        </div>
        <div className="flex items-end justify-center gap-1 mb-1">
          <span className="text-5xl font-bold text-white">$49</span>
          <span className="text-slate-400 mb-2">/month</span>
        </div>
        <p className="text-xs text-slate-500 mb-8">14-day free trial · Cancel anytime</p>

        <ul className="space-y-3 text-left mb-8">
          {features.map(f => (
            <li key={f.text} className="flex items-center gap-3 text-sm text-slate-300">
              <f.icon size={16} className="text-blue-400 shrink-0" /> {f.text}
            </li>
          ))}
        </ul>

        <Link to="/register"
          className="block w-full bg-white text-[#0a0e1a] py-3.5 rounded-xl font-semibold hover:bg-slate-200 text-center transition-all flex items-center justify-center gap-2">
          Start free trial <ArrowRight size={16} />
        </Link>
      </div>

      <p className="text-slate-500 text-sm mt-8">
        Already have an account? <Link to="/login" className="text-white font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

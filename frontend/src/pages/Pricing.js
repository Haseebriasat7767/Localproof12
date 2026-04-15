import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const features = [
  'Unlimited review tracking',
  'AI reply drafts (Claude Haiku)',
  'Fake review detection',
  'Unhappy customer alerts (email)',
  'Embeddable feedback widget',
  'Weekly reputation digest',
  'Multi-platform (Google, Yelp)',
  'Cancel anytime'
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-16">
      <Link to="/" className="text-2xl font-bold text-blue-600 mb-10">⭐ LocalProof</Link>
      <h2 className="text-4xl font-bold text-gray-900 text-center mb-3">Simple pricing</h2>
      <p className="text-gray-500 text-center mb-10">Everything you need to protect your reputation</p>

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 w-full max-w-sm text-center">
        <p className="text-gray-500 text-sm mb-2">Pro Plan</p>
        <div className="flex items-end justify-center gap-1 mb-1">
          <span className="text-5xl font-bold text-gray-900">$29</span>
          <span className="text-gray-400 mb-2">/month</span>
        </div>
        <p className="text-xs text-gray-400 mb-6">14-day free trial · No card required</p>

        <ul className="space-y-3 text-left mb-8">
          {features.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle size={16} className="text-green-500 shrink-0" /> {f}
            </li>
          ))}
        </ul>

        <Link to="/register"
          className="block w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 text-center">
          Start Free Trial
        </Link>
      </div>

      <p className="text-gray-400 text-xs mt-6">
        Already have an account? <Link to="/login" className="text-blue-600">Sign in</Link>
      </p>
    </div>
  );
}

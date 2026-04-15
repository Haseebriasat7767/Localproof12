import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Shield, Bell, Zap, CheckCircle } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-blue-600">⭐ LocalProof</h1>
        <div className="flex gap-4">
          <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Login</Link>
          <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-20 px-6 max-w-4xl mx-auto">
        <span className="bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full">
          Used by 500+ local businesses
        </span>
        <h2 className="text-5xl font-bold text-gray-900 mt-6 leading-tight">
          Stop losing customers<br />to bad reviews
        </h2>
        <p className="text-xl text-gray-500 mt-4 max-w-2xl mx-auto">
          LocalProof catches unhappy customers before they post, and replies to all your reviews with AI — in your voice, in seconds.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link to="/register"
            className="bg-blue-600 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors">
            Start Free Trial
          </Link>
          <Link to="/pricing"
            className="border border-gray-300 text-gray-700 px-8 py-3.5 rounded-xl text-lg font-medium hover:bg-gray-50">
            See Pricing
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-3">No credit card required · Cancel anytime</p>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Bell, title: 'Unhappy Customer Alerts', desc: 'Get notified before 1-3 star customers post publicly. Fix it privately.' },
            { icon: Zap, title: 'AI Reply Drafts', desc: 'One click generates a professional reply in your business voice.' },
            { icon: Shield, title: 'Fake Review Detection', desc: 'Automatically flag suspicious reviews so you can report them.' },
            { icon: Star, title: 'Reputation Score', desc: 'Weekly digest of your rating trends across all platforms.' }
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 max-w-4xl mx-auto px-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Trusted by local businesses</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Ahmed K.', business: 'Karachi Restaurant', quote: 'We saved 3 negative reviews this month by catching them first. Worth every penny.' },
            { name: 'Sara M.', business: 'Beauty Salon, Lahore', quote: 'The AI replies sound exactly like me. Saves me 30 minutes every day.' },
            { name: 'Raza T.', business: 'Auto Repair, Islamabad', quote: 'Found 2 fake reviews, reported them, both removed. Game changer.' }
          ].map(({ name, business, quote }) => (
            <div key={name} className="bg-gray-50 p-6 rounded-2xl text-left">
              <div className="flex mb-3">{[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}</div>
              <p className="text-gray-700 text-sm mb-4">"{quote}"</p>
              <p className="font-semibold text-gray-900 text-sm">{name}</p>
              <p className="text-gray-500 text-xs">{business}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-16 bg-blue-600 text-white text-center px-6">
        <h3 className="text-3xl font-bold mb-3">Simple, honest pricing</h3>
        <p className="text-blue-200 mb-8">One plan. Everything included. Cancel anytime.</p>
        <div className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-2xl">
          $29 <span className="text-base font-normal text-gray-500">/ month</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-blue-100">
          {['Unlimited reviews', 'AI reply drafts', 'Fake review detection', 'Unhappy customer alerts', 'Embed widget', 'Weekly reports'].map(f => (
            <span key={f} className="flex items-center gap-1.5"><CheckCircle size={14} /> {f}</span>
          ))}
        </div>
        <Link to="/register" className="mt-8 inline-block bg-white text-blue-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-50">
          Start Free → 14 Days
        </Link>
      </section>

      <footer className="text-center py-8 text-gray-400 text-sm">
        © 2026 LocalProof · Built for local businesses
      </footer>
    </div>
  );
}

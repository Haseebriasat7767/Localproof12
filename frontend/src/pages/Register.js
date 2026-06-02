import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form.name, form.email, form.password, form.businessName);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const benefits = [
    '14-day free trial — no credit card',
    'Pay $49 only after trial ends',
    'Cancel anytime before billing'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <img src="/logo.svg" alt="LocalProof" className="w-8 h-8" />
            <span className="text-2xl font-bold text-white tracking-tight">LocalProof</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
          <p className="text-slate-400 mb-6 text-sm">14-day free trial · $49/month after</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {benefits.map(b => (
              <span key={b} className="inline-flex items-center gap-1 text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                <CheckCircle size={12} className="text-emerald-400" /> {b}
              </span>
            ))}
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Full name</label>
              <input type="text" required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition"
                placeholder="John Smith"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Email address</label>
              <input type="email" required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition"
                placeholder="you@company.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Password</label>
              <input type="password" required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition"
                placeholder="Min 8 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Business name</label>
              <input type="text"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition"
                placeholder="Your Business"
                value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-white text-[#0a0e1a] py-3 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {loading ? 'Creating account...' : <>Start Free Trial <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <Link to="/login" className="text-white font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

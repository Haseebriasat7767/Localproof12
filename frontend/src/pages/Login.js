import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/api';
import { ArrowLeft, ArrowRight, PlayCircle } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoAvailable, setDemoAvailable] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // The demo account only exists once the operator has run `npm run seed:demo`.
  useEffect(() => {
    auth.demoStatus()
      .then(res => setDemoAvailable(!!res.data.available))
      .catch(() => setDemoAvailable(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const tryDemo = async () => {
    setDemoLoading(true); setError('');
    try {
      const res = await auth.demoLogin();
      localStorage.setItem('token', res.data.token);
      window.location.assign('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Demo is not available on this deployment');
      setDemoLoading(false);
    }
  };

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

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 mb-8 text-sm">Sign in to your account</p>

          <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mb-6 text-center">
            All accounts start with a 14-day free trial. No credit card required.
          </p>

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Email</label>
              <input type="email" required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition"
                placeholder="you@company.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Password</label>
              <input type="password" required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition"
                placeholder="Enter your password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-white text-[#0a0e1a] py-3 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {loading ? 'Signing in...' : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            No account? <Link to="/register" className="text-white font-medium hover:underline">Create one</Link>
          </p>

          {demoAvailable && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 border-t border-white/10" />
                <span className="text-xs text-slate-500">or</span>
                <div className="flex-1 border-t border-white/10" />
              </div>
              <button onClick={tryDemo} disabled={demoLoading}
                className="w-full bg-white/5 border border-white/10 text-slate-300 py-3 rounded-lg font-medium hover:bg-white/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm">
                <PlayCircle size={16} /> {demoLoading ? 'Loading demo…' : 'Explore the live demo'}
              </button>
              <p className="text-center text-xs text-slate-600 mt-3">
                Click through the full product with sample data — no signup needed.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

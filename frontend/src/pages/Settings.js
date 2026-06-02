import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { business, billing, auth as authApi } from '../services/api';
import { Check, ArrowRight } from 'lucide-react';

export default function Settings() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ businessName: user?.businessName || '', tone: user?.tone || 'professional' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await business.updateProfile(form);
      setUser(res.data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const manageSubscription = async () => {
    const res = await billing.portal();
    window.location.href = res.data.url;
  };

  const tones = [
    { value: 'professional', label: 'Professional', desc: 'Formal, polished, and respectful' },
    { value: 'friendly', label: 'Friendly', desc: 'Warm, approachable, and conversational' },
    { value: 'casual', label: 'Casual', desc: 'Relaxed, informal, and human' }
  ];

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage your business profile and preferences</p>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-5">Business Profile</h3>
        <form onSubmit={save} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-400 block mb-1.5">Business Name</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition"
              value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-400 block mb-1.5">Reply Tone</label>
            <div className="space-y-2">
              {tones.map(t => (
                <label key={t.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  form.tone === t.value ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
                }`}>
                  <input type="radio" name="tone" value={t.value} className="sr-only"
                    checked={form.tone === t.value} onChange={e => setForm({ ...form, tone: e.target.value })} />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    form.tone === t.value ? 'border-blue-400' : 'border-slate-500'
                  }`}>
                    {form.tone === t.value && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{t.label}</div>
                    <div className="text-xs text-slate-500">{t.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">AI will draft replies in this tone</p>
          </div>
          <button type="submit" disabled={loading}
            className="bg-white text-[#0a0e1a] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-all flex items-center gap-2 disabled:opacity-50">
            {saved ? <><Check size={16} /> Saved!</> : <>{loading ? 'Saving...' : 'Save Changes'} <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-2">Subscription</h3>
        <p className="text-sm text-slate-400 mb-4">
          Current plan: <span className="font-semibold text-white">Pro ($49/mo)</span>
        </p>
        {user?.trialEndsAt && !user?.stripeSubscriptionId && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-emerald-400 font-medium">
              Free trial active until {new Date(user.trialEndsAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-emerald-400/70 mt-1">
              You'll be billed $49 on {new Date(user.trialEndsAt).toLocaleDateString()}. Cancel anytime before.
            </p>
          </div>
        )}
        {user?.stripeSubscriptionId && (
          <p className="text-xs text-slate-500 mb-4">Subscription active — paid via Stripe</p>
        )}
        <button onClick={manageSubscription}
          className="bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white/20 transition-all">
          Manage Subscription
        </button>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-1">Account</h3>
        <p className="text-sm text-slate-400">{user?.email}</p>
      </div>
    </div>
  );
}

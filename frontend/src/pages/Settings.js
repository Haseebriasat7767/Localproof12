import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { business, billing, googleBusiness } from '../services/api';
import { Check, ArrowRight, Link2, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { user, setUser } = useAuth();
  const { search } = useLocation();
  const [form, setForm] = useState({ businessName: user?.businessName || '', tone: user?.tone || 'professional' });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const googleStatus = new URLSearchParams(search).get('google');
  const [locations, setLocations] = useState(null);
  const [locationsError, setLocationsError] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [linking, setLinking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    if (!user?.googleConnected || user?.googleLocationId) return;
    googleBusiness.getLocations()
      .then(res => setLocations(res.data.locations))
      .catch(err => setLocationsError(err.response?.data?.error || 'Could not load Google locations'));
  }, [user?.googleConnected, user?.googleLocationId]);

  const connectGoogle = async () => {
    setConnecting(true);
    try {
      const res = await googleBusiness.getConnectUrl();
      window.location.href = res.data.url;
    } catch (err) {
      setLocationsError(err.response?.data?.error || 'Could not start Google connection');
      setConnecting(false);
    }
  };

  const linkLocation = async (loc) => {
    setLinking(true);
    try {
      const res = await googleBusiness.linkLocation({ accountId: loc.accountId, locationId: loc.locationId, title: loc.title });
      setUser(res.data.user);
    } finally {
      setLinking(false);
    }
  };

  const syncReviews = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await googleBusiness.sync();
      setSyncResult(res.data);
    } catch (err) {
      setSyncResult({ error: err.response?.data?.error || 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

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
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition"
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
                    form.tone === t.value ? 'border-brand-500' : 'border-slate-500'
                  }`}>
                    {form.tone === t.value && <div className="w-2 h-2 rounded-full bg-brand-500" />}
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
        <h3 className="font-semibold text-white mb-2">Google Business Profile</h3>
        <p className="text-sm text-slate-400 mb-4">
          Connect your Google Business Profile to pull real reviews in automatically, instead of adding them by hand.
        </p>

        {googleStatus === 'denied' && (
          <p className="text-sm text-orange-400 mb-3">Google connection was cancelled.</p>
        )}
        {googleStatus === 'error' && (
          <p className="text-sm text-red-400 mb-3">Something went wrong connecting to Google. Please try again.</p>
        )}
        {locationsError && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-3">
            <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{locationsError}</p>
          </div>
        )}

        {!user?.googleConnected && (
          <button onClick={connectGoogle} disabled={connecting}
            className="flex items-center gap-2 bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white/20 transition-all disabled:opacity-50">
            <Link2 size={14} /> {connecting ? 'Redirecting…' : 'Connect Google Business Profile'}
          </button>
        )}

        {user?.googleConnected && !user?.googleLocationId && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Choose which business location to sync reviews from:</p>
            {locations === null && !locationsError && <p className="text-xs text-slate-500">Loading locations…</p>}
            {locations?.length === 0 && <p className="text-xs text-slate-500">No locations found on this Google account.</p>}
            {locations?.map(loc => (
              <button key={loc.locationId} onClick={() => linkLocation(loc)} disabled={linking}
                className="w-full text-left bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white hover:bg-white/10 transition disabled:opacity-50">
                {loc.title}
              </button>
            ))}
          </div>
        )}

        {user?.googleConnected && user?.googleLocationId && (
          <div className="space-y-3">
            <p className="text-xs text-emerald-400">Linked to {user.googleLocationName || user.googleLocationId}</p>
            <button onClick={syncReviews} disabled={syncing}
              className="flex items-center gap-2 bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white/20 transition-all disabled:opacity-50">
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncing…' : 'Sync reviews now'}
            </button>
            {syncResult?.error && <p className="text-xs text-red-400">{syncResult.error}</p>}
            {syncResult && !syncResult.error && (
              <p className="text-xs text-slate-500">Imported {syncResult.imported} new review{syncResult.imported === 1 ? '' : 's'} of {syncResult.total} found.</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-2">Subscription</h3>
        <p className="text-sm text-slate-400 mb-4">
          Current plan: <span className="font-semibold text-white">
            {user?.plan === 'pro' && user?.stripeSubscriptionId ? 'Pro ($49/mo)' : 'Free Trial'}
          </span>
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

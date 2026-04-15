import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { business, billing, auth as authApi } from '../services/api';

export default function Settings() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ businessName: user?.businessName || '', tone: user?.tone || 'professional' });
  const [saved, setSaved] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    const res = await business.updateProfile(form);
    setUser(res.data.user);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const manageSubscription = async () => {
    const res = await billing.portal();
    window.location.href = res.data.url;
  };

  const upgrade = async () => {
    const res = await billing.checkout();
    window.location.href = res.data.url;
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Business Profile</h3>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Business Name</label>
            <input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Reply Tone</label>
            <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.tone} onChange={e => setForm({ ...form, tone: e.target.value })}>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">AI will draft replies in this tone</p>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
            {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Subscription</h3>
        <p className="text-sm text-gray-500 mb-4">
          Current plan: <span className={`font-semibold ${user?.plan === 'pro' ? 'text-blue-600' : 'text-gray-700'}`}>
            {user?.plan === 'pro' ? 'Pro ($29/mo)' : 'Free'}
          </span>
        </p>
        {user?.plan === 'pro' ? (
          <button onClick={manageSubscription} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Manage Subscription
          </button>
        ) : (
          <button onClick={upgrade} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Upgrade to Pro — $29/mo
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Account</h3>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>
    </div>
  );
}

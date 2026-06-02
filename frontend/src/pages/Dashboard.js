import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, AlertTriangle, TrendingUp, ArrowRight, ArrowUpRight } from 'lucide-react';
import { reviews, billing } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([reviews.getStats(), reviews.getAll({ limit: 5 })])
      .then(([s, r]) => { setStats(s.data); setRecentReviews(r.data.reviews); })
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async () => {
    const res = await billing.checkout();
    window.location.href = res.data.url;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
      <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mr-2" />
      Loading dashboard...
    </div>
  );

  const statCards = [
    { label: 'Total Reviews', value: stats?.total || 0, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Avg Rating', value: stats?.avgRating || '—', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Pending Replies', value: stats?.pending || 0, icon: MessageSquare, color: 'text-brand-500', bg: 'bg-brand-500/10' },
    { label: 'Fake Suspected', value: stats?.fake || 0, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back, {user?.name}</h2>
          <p className="text-slate-500 text-sm mt-1">{user?.businessName || 'Your business'} · Reputation Dashboard</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Pro Plan
        </div>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="font-semibold text-white text-sm">Pro Plan</p>
          <p className="text-slate-400 text-xs mt-0.5">$49/month — unlimited AI replies + alerts</p>
          {user?.trialEndsAt && !user?.stripeSubscriptionId && (
            <p className="text-emerald-400 text-xs mt-1">
              Trial ends: {new Date(user.trialEndsAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <button onClick={handleUpgrade}
          className="bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-all">
          Manage
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/[0.05] transition-all">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${bg}`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="font-semibold text-white">Recent Reviews</h3>
          <Link to="/reviews" className="text-brand-500 text-sm flex items-center gap-1 hover:text-brand-400 transition">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {recentReviews.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              No reviews yet. <Link to="/reviews" className="text-brand-500 hover:text-brand-400">Add your first review →</Link>
            </div>
          )}
          {recentReviews.map(review => (
            <div key={review._id} className="p-5 flex items-start gap-4 hover:bg-white/[0.02] transition">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white text-sm">{review.authorName}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600 fill-slate-600'} />
                    ))}
                  </div>
                  {review.isFakeSuspected && (
                    <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">Fake?</span>
                  )}
                </div>
                <p className="text-sm text-slate-400 line-clamp-2">{review.text || 'No text'}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                review.replied ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
              }`}>
                {review.replied ? 'Replied' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react';
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

  if (loading) return <div className="text-gray-500 text-sm">Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Reviews', value: stats?.total || 0, icon: Star, color: 'text-yellow-500 bg-yellow-50' },
    { label: 'Avg Rating', value: stats?.avgRating || '—', icon: TrendingUp, color: 'text-green-500 bg-green-50' },
    { label: 'Pending Replies', value: stats?.pending || 0, icon: MessageSquare, color: 'text-blue-500 bg-blue-50' },
    { label: 'Fake Suspected', value: stats?.fake || 0, icon: AlertTriangle, color: 'text-red-500 bg-red-50' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {user?.name} 👋</h2>
        <p className="text-gray-500 text-sm mt-1">{user?.businessName || 'Your business'} · Reputation Dashboard</p>
      </div>

      {user?.plan === 'free' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-900 text-sm">You're on the Free plan</p>
            <p className="text-blue-700 text-xs mt-0.5">Upgrade to Pro for unlimited AI replies + alerts</p>
          </div>
          <button onClick={handleUpgrade}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Upgrade $29/mo
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Reviews</h3>
          <Link to="/reviews" className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentReviews.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              No reviews yet. <Link to="/reviews" className="text-blue-600">Add your first review →</Link>
            </div>
          )}
          {recentReviews.map(review => (
            <div key={review._id} className="p-5 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">{review.authorName}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                  {review.isFakeSuspected && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Fake?</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{review.text || 'No text'}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                review.replied ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
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

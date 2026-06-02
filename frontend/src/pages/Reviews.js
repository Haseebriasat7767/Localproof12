import React, { useEffect, useState } from 'react';
import { Star, Zap, Check, AlertTriangle, Plus, X, Search, Filter } from 'lucide-react';
import { reviews as reviewsApi } from '../services/api';

export default function Reviews() {
  const [reviewList, setReviewList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ sentiment: '', replied: '', platform: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ authorName: '', rating: 5, text: '', platform: 'google' });
  const [drafts, setDrafts] = useState({});
  const [generating, setGenerating] = useState({});
  const [editReply, setEditReply] = useState({});

  const load = async () => {
    setLoading(true);
    const res = await reviewsApi.getAll(filter);
    setReviewList(res.data.reviews);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const generateDraft = async (id) => {
    setGenerating(g => ({ ...g, [id]: true }));
    try {
      const res = await reviewsApi.generateDraft(id);
      setDrafts(d => ({ ...d, [id]: res.data.draft }));
      setEditReply(e => ({ ...e, [id]: res.data.draft }));
    } finally {
      setGenerating(g => ({ ...g, [id]: false }));
    }
  };

  const saveReply = async (id) => {
    await reviewsApi.saveReply(id, editReply[id]);
    setReviewList(list => list.map(r => r._id === id ? { ...r, replied: true, replyText: editReply[id] } : r));
  };

  const addReview = async (e) => {
    e.preventDefault();
    await reviewsApi.addManual(addForm);
    setShowAdd(false);
    setAddForm({ authorName: '', rating: 5, text: '', platform: 'google' });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Reviews</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage and respond to all your reviews</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white/20 transition-all">
          <Plus size={16} /> Add Review
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['', 'positive', 'neutral', 'negative'].map(s => (
          <button key={s} onClick={() => setFilter(f => ({ ...f, sentiment: s }))}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${
              filter.sentiment === s ? 'bg-white/10 text-white border-white/20' : 'bg-transparent border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
            }`}>
            {s || 'All'}
          </button>
        ))}
        <button onClick={() => setFilter(f => ({ ...f, replied: f.replied === 'false' ? '' : 'false' }))}
          className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${
            filter.replied === 'false' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-transparent border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
          }`}>
          Pending only
        </button>
      </div>

      {/* Add review modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d1221] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white">Add Review Manually</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-white transition"><X size={20} /></button>
            </div>
            <form onSubmit={addReview} className="space-y-3">
              <input placeholder="Customer name" required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition"
                value={addForm.authorName} onChange={e => setAddForm({ ...addForm, authorName: e.target.value })} />
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50 transition"
                value={addForm.platform} onChange={e => setAddForm({ ...addForm, platform: e.target.value })}>
                <option value="google" className="bg-[#0d1221]">Google</option>
                <option value="yelp" className="bg-[#0d1221]">Yelp</option>
                <option value="manual" className="bg-[#0d1221]">Other</option>
              </select>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50 transition"
                value={addForm.rating} onChange={e => setAddForm({ ...addForm, rating: Number(e.target.value) })}>
                {[5,4,3,2,1].map(n => <option key={n} value={n} className="bg-[#0d1221]">{n} Star{n > 1 ? 's' : ''}</option>)}
              </select>
              <textarea placeholder="Review text..." rows={3} required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition"
                value={addForm.text} onChange={e => setAddForm({ ...addForm, text: e.target.value })} />
              <button type="submit" className="w-full bg-white text-[#0a0e1a] py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-200 transition">
                Add Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
          <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </div>
      ) : (
        <div className="space-y-3">
          {reviewList.length === 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center text-slate-500 text-sm">
              No reviews found. Add your first one!
            </div>
          )}
          {reviewList.map(review => (
            <div key={review._id} className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/[0.05] transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{review.authorName}</span>
                    <span className="text-xs text-slate-500 capitalize">{review.platform}</span>
                    {review.isFakeSuspected && (
                      <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                        <AlertTriangle size={10} /> Fake?
                      </span>
                    )}
                  </div>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600 fill-slate-600'} />
                    ))}
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                  review.replied ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                }`}>
                  {review.replied ? 'Replied' : 'Pending'}
                </span>
              </div>

              <p className="text-sm text-slate-300 mb-3">{review.text}</p>

              {review.isFakeSuspected && review.fakeReasons?.length > 0 && (
                <div className="bg-red-500/5 rounded-lg p-2.5 mb-3 text-xs text-red-400 border border-red-500/10">
                  <AlertTriangle size={12} className="inline mr-1" /> {review.fakeReasons.join(' · ')}
                </div>
              )}

              {review.replied ? (
                <div className="bg-white/5 rounded-lg p-3 text-sm text-slate-400 border border-white/5">
                  <span className="font-medium text-slate-300 block text-xs mb-1">Your reply:</span>
                  {review.replyText}
                </div>
              ) : (
                <div className="space-y-2">
                  {editReply[review._id] && (
                    <textarea rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition"
                      value={editReply[review._id]}
                      onChange={e => setEditReply(r => ({ ...r, [review._id]: e.target.value }))} />
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => generateDraft(review._id)} disabled={generating[review._id]}
                      className="flex items-center gap-1.5 bg-brand-500/10 text-brand-500 border border-brand-500/20 px-3 py-2 rounded-lg text-xs font-medium hover:bg-brand-500/20 transition disabled:opacity-50">
                      <Zap size={12} /> {generating[review._id] ? 'Generating...' : 'AI Draft'}
                    </button>
                    {editReply[review._id] && (
                      <button onClick={() => saveReply(review._id)}
                        className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition">
                        <Check size={12} /> Save Reply
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

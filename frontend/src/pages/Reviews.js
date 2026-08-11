import React, { useEffect, useState } from 'react';
import { Star, Zap, Check, AlertTriangle, Plus, X } from 'lucide-react';
import { reviews as reviewsApi } from '../services/api';

export default function Reviews() {
  const [reviewList, setReviewList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ sentiment: '', replied: '', platform: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState({});
  const [addForm, setAddForm] = useState({ authorName: '', rating: 5, text: '', platform: 'google' });
  const [generating, setGenerating] = useState({});
  const [editReply, setEditReply] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await reviewsApi.getAll({ ...filter, page, limit: 20 });
      setReviewList(res.data.reviews || []);
      setPages(res.data.pages || 1);
      setError('');
    } catch {
      setError('Unable to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter, page]);

  const updateFilter = (next) => { setPage(1); setFilter(next); };

  const generateDraft = async (id) => {
    setGenerating(g => ({ ...g, [id]: true }));
    try {
      const res = await reviewsApi.generateDraft(id);
      setEditReply(e => ({ ...e, [id]: res.data.draft }));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to generate an AI draft.');
    } finally { setGenerating(g => ({ ...g, [id]: false })); }
  };

  const saveReply = async (id) => {
    const text = editReply[id]?.trim();
    if (!text || text.length > 5000) { setError('Reply must be between 1 and 5000 characters.'); return; }
    setSaving(s => ({ ...s, [id]: true }));
    try {
      await reviewsApi.saveReply(id, text);
      setReviewList(list => list.map(r => r._id === id ? { ...r, replied: true, replyText: text } : r));
      setError('');
    } catch (err) { setError(err.response?.data?.error || 'Unable to save reply.'); }
    finally { setSaving(s => ({ ...s, [id]: false })); }
  };

  const addReview = async (e) => {
    e.preventDefault();
    try {
      await reviewsApi.addManual(addForm);
      setShowAdd(false);
      setAddForm({ authorName: '', rating: 5, text: '', platform: 'google' });
      setError('');
      load();
    } catch (err) { setError(err.response?.data?.error || 'Unable to add review.'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold text-white tracking-tight">Reviews</h2><p className="text-slate-500 text-sm mt-0.5">Manage and respond to your reviews</p></div><button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-white/10 text-white border border-white/10 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-white/20 transition-all"><Plus size={16} /> Add Review</button></div>
      {error && <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-3 text-sm">{error}</div>}
      <div className="flex flex-wrap gap-2">{['', 'positive', 'neutral', 'negative'].map(s => <button key={s} onClick={() => updateFilter({ ...filter, sentiment: s })} className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${filter.sentiment === s ? 'bg-white/10 text-white border-white/20' : 'bg-transparent border-white/10 text-slate-400 hover:border-white/20'}`}>{s || 'All'}</button>)}<button onClick={() => updateFilter({ ...filter, replied: filter.replied === 'false' ? '' : 'false' })} className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all ${filter.replied === 'false' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-transparent border-white/10 text-slate-400'}`}>Pending only</button></div>

      {showAdd && <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"><div className="bg-[#0d1221] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"><div className="flex items-center justify-between mb-5"><h3 className="font-bold text-white">Add Review Manually</h3><button onClick={() => setShowAdd(false)} aria-label="Close"><X size={20} /></button></div><form onSubmit={addReview} className="space-y-3"><input placeholder="Customer name" required maxLength={100} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white" value={addForm.authorName} onChange={e => setAddForm({ ...addForm, authorName: e.target.value })} /><select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white" value={addForm.platform} onChange={e => setAddForm({ ...addForm, platform: e.target.value })}><option value="google">Google</option><option value="yelp">Yelp</option><option value="manual">Other</option></select><select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white" value={addForm.rating} onChange={e => setAddForm({ ...addForm, rating: Number(e.target.value) })}>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}</select><textarea placeholder="Review text..." rows={3} required maxLength={5000} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white" value={addForm.text} onChange={e => setAddForm({ ...addForm, text: e.target.value })} /><button type="submit" className="w-full bg-white text-[#0a0e1a] py-2.5 rounded-lg font-semibold text-sm">Add Review</button></form></div></div>}

      {loading ? <div className="flex items-center justify-center h-48 text-slate-500 text-sm"><div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mr-2" />Loading...</div> : <div className="space-y-3">{reviewList.length === 0 && <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center text-slate-500 text-sm">No reviews found.</div>}{reviewList.map(review => <div key={review._id} className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-5"><div className="flex items-start justify-between mb-3"><div><div className="flex items-center gap-2"><span className="font-semibold text-white text-sm">{review.authorName}</span><span className="text-xs text-slate-500 capitalize">{review.platform}</span>{review.isFakeSuspected && <span className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full"><AlertTriangle size={10} /> Suspicious</span>}</div><div className="flex mt-1">{[...Array(5)].map((_, i) => <Star key={i} size={13} className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600 fill-slate-600'} />)}</div></div><span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${review.replied ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>{review.replied ? 'Replied' : 'Pending'}</span></div><p className="text-sm text-slate-300 mb-3">{review.text}</p>{review.isFakeSuspected && review.fakeReasons?.length > 0 && <div className="bg-red-500/5 rounded-lg p-2.5 mb-3 text-xs text-red-400 border border-red-500/10"><AlertTriangle size={12} className="inline mr-1" />{review.fakeReasons.join(' · ')}</div>}{review.replied ? <div className="bg-white/5 rounded-lg p-3 text-sm text-slate-400"><span className="font-medium text-slate-300 block text-xs mb-1">Your reply:</span>{review.replyText}</div> : <div className="space-y-2">{editReply[review._id] && <textarea rows={3} maxLength={5000} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" value={editReply[review._id]} onChange={e => setEditReply(r => ({ ...r, [review._id]: e.target.value }))} />}{<div className="flex gap-2"><button onClick={() => generateDraft(review._id)} disabled={generating[review._id]} className="flex items-center gap-1.5 bg-brand-500/10 text-brand-500 border border-brand-500/20 px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50"><Zap size={12} />{generating[review._id] ? 'Generating...' : 'AI Draft'}</button>{editReply[review._id] && <button onClick={() => saveReply(review._id)} disabled={saving[review._id]} className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50"><Check size={12} />{saving[review._id] ? 'Saving...' : 'Save Reply'}</button>}</div>}</div>}</div>)}</div>}
      {!loading && pages > 1 && <div className="flex items-center justify-center gap-3"><button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-2 text-xs rounded-lg border border-white/10 text-slate-300 disabled:opacity-40">Previous</button><span className="text-xs text-slate-500">Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-2 text-xs rounded-lg border border-white/10 text-slate-300 disabled:opacity-40">Next</button></div>}
    </div>
  );
}

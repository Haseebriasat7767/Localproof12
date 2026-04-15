import React, { useEffect, useState } from 'react';
import { Star, Zap, Check, AlertTriangle, Plus, X } from 'lucide-react';
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
        <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Add Review
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['', 'positive', 'neutral', 'negative'].map(s => (
          <button key={s} onClick={() => setFilter(f => ({ ...f, sentiment: s }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filter.sentiment === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
            }`}>
            {s || 'All'}
          </button>
        ))}
        <button onClick={() => setFilter(f => ({ ...f, replied: f.replied === 'false' ? '' : 'false' }))}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            filter.replied === 'false' ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-200 text-gray-600'
          }`}>
          Pending only
        </button>
      </div>

      {/* Add review modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Add Review Manually</h3>
              <button onClick={() => setShowAdd(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={addReview} className="space-y-3">
              <input placeholder="Customer name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={addForm.authorName} onChange={e => setAddForm({ ...addForm, authorName: e.target.value })} />
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={addForm.platform} onChange={e => setAddForm({ ...addForm, platform: e.target.value })}>
                <option value="google">Google</option>
                <option value="yelp">Yelp</option>
                <option value="manual">Other</option>
              </select>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={addForm.rating} onChange={e => setAddForm({ ...addForm, rating: Number(e.target.value) })}>
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
              </select>
              <textarea placeholder="Review text..." rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={addForm.text} onChange={e => setAddForm({ ...addForm, text: e.target.value })} />
              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700">
                Add Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Review list */}
      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
        <div className="space-y-3">
          {reviewList.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
              No reviews found. Add your first one!
            </div>
          )}
          {reviewList.map(review => (
            <div key={review._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">{review.authorName}</span>
                    <span className="text-xs text-gray-400 capitalize">{review.platform}</span>
                    {review.isFakeSuspected && (
                      <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        <AlertTriangle size={10} /> Fake?
                      </span>
                    )}
                  </div>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  review.replied ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {review.replied ? 'Replied' : 'Pending'}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-3">{review.text}</p>

              {review.isFakeSuspected && review.fakeReasons?.length > 0 && (
                <div className="bg-red-50 rounded-lg p-2 mb-3 text-xs text-red-600">
                  ⚠️ {review.fakeReasons.join(' · ')}
                </div>
              )}

              {review.replied ? (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <span className="font-medium text-gray-800 block text-xs mb-1">Your reply:</span>
                  {review.replyText}
                </div>
              ) : (
                <div className="space-y-2">
                  {editReply[review._id] && (
                    <textarea rows={3} className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={editReply[review._id]}
                      onChange={e => setEditReply(r => ({ ...r, [review._id]: e.target.value }))} />
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => generateDraft(review._id)} disabled={generating[review._id]}
                      className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
                      <Zap size={12} /> {generating[review._id] ? 'Generating...' : 'AI Draft'}
                    </button>
                    {editReply[review._id] && (
                      <button onClick={() => saveReply(review._id)}
                        className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700">
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

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Star, Code, Copy, Check } from 'lucide-react';
import { business } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [embedCode, setEmbedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([business.getAlerts(), business.getEmbedCode(user.id)])
      .then(([a, e]) => { setAlerts(a.data.alerts); setEmbedCode(e.data.embedCode); })
      .finally(() => setLoading(false));
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
      <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mr-2" />
      Loading...
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Alerts & Widget</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage your widget and track unhappy customers</p>
      </div>

      {/* Embed code */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Code size={18} className="text-blue-400" />
          <h3 className="font-semibold text-white">Feedback Widget</h3>
        </div>
        <p className="text-sm text-slate-400 mb-3">
          Add this to your website footer. It captures customer ratings privately — unhappy ones alert you before they post publicly.
        </p>
        <div className="bg-[#0a0e1a] rounded-xl p-4 relative border border-white/10">
          <pre className="text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap">{embedCode}</pre>
          <button onClick={copy}
            className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg transition-all border border-white/10 flex items-center gap-1.5">
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
      </div>

      {/* Unhappy alerts */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl">
        <div className="flex items-center gap-2 p-5 border-b border-white/5">
          <AlertTriangle size={18} className="text-red-400" />
          <h3 className="font-semibold text-white">Unhappy Customer Alerts</h3>
          <span className="ml-auto bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium px-2.5 py-1 rounded-full">{alerts.length}</span>
        </div>
        <div className="divide-y divide-white/5">
          {alerts.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              No unhappy alerts yet. Add the widget to your site to start capturing feedback.
            </div>
          )}
          {alerts.map(alert => (
            <div key={alert._id} className="p-5 hover:bg-white/[0.02] transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-white text-sm">{alert.customerName}</p>
                  {alert.customerEmail && (
                    <a href={`mailto:${alert.customerEmail}`} className="text-xs text-blue-400 hover:text-blue-300 transition">
                      {alert.customerEmail}
                    </a>
                  )}
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className={i < alert.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600 fill-slate-600'} />
                  ))}
                </div>
              </div>
              {alert.comment && <p className="text-sm text-slate-400 mt-2">{alert.comment}</p>}
              <p className="text-xs text-slate-600 mt-2">{new Date(alert.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

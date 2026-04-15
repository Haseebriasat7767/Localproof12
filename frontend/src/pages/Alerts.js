import React, { useEffect, useState } from 'react';
import { AlertTriangle, Star, Code } from 'lucide-react';
import { business } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [embedCode, setEmbedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([business.getAlerts(), business.getEmbedCode(user._id)])
      .then(([a, e]) => { setAlerts(a.data.alerts); setEmbedCode(e.data.embedCode); })
      .finally(() => setLoading(false));
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Alerts & Widget</h2>

      {/* Embed code */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Code size={18} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">Feedback Widget</h3>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Add this to your website footer. It captures customer ratings privately — unhappy ones alert you before they post publicly.
        </p>
        <div className="bg-gray-900 rounded-lg p-4 relative">
          <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">{embedCode}</pre>
          <button onClick={copy}
            className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded-md transition-colors">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Unhappy alerts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 p-5 border-b border-gray-100">
          <AlertTriangle size={18} className="text-red-500" />
          <h3 className="font-semibold text-gray-900">Unhappy Customer Alerts</h3>
          <span className="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">{alerts.length}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {alerts.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              No unhappy alerts yet. Add the widget to your site to start capturing feedback.
            </div>
          )}
          {alerts.map(alert => (
            <div key={alert._id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{alert.customerName}</p>
                  {alert.customerEmail && (
                    <a href={`mailto:${alert.customerEmail}`} className="text-xs text-blue-600 hover:underline">
                      {alert.customerEmail}
                    </a>
                  )}
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} className={i < alert.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                  ))}
                </div>
              </div>
              {alert.comment && <p className="text-sm text-gray-600 mt-2">{alert.comment}</p>}
              <p className="text-xs text-gray-400 mt-2">{new Date(alert.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

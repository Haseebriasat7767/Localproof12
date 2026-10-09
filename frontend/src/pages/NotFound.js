import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-white tracking-tight">404</p>
        <p className="text-slate-400 mt-3 mb-8">This page doesn't exist.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-white text-[#0a0e1a] px-6 py-3 rounded-full font-semibold text-sm hover:bg-slate-200 transition-all">
          <ArrowLeft size={16} /> Back to LocalProof
        </Link>
      </div>
    </div>
  );
}

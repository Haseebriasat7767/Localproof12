import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-300 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: October 2026</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <p>
            LocalProof ("we", "us") operates the LocalProof review-management service. This policy
            explains what data we collect, why, and how it is protected. It applies to the LocalProof
            web application, API, and the customer feedback widget embedded on our customers' websites.
          </p>

          <h2 className="text-lg font-semibold text-white">What we collect</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li><span className="text-slate-300">Account data:</span> your name, email address, business name, and password (stored only as a bcrypt hash).</li>
            <li><span className="text-slate-300">Review data:</span> reviews you add or import, your replies, and AI-generated reply drafts.</li>
            <li><span className="text-slate-300">Widget feedback:</span> ratings, comments, and (optionally) names and email addresses submitted by your customers through the widget.</li>
            <li><span className="text-slate-300">Billing data:</span> handled entirely by Stripe. We never see or store your card details — only your Stripe customer and subscription IDs.</li>
            <li><span className="text-slate-300">Google data:</span> if you connect Google Business Profile, we store OAuth tokens needed to read your reviews, limited to the permissions you grant.</li>
          </ul>

          <h2 className="text-lg font-semibold text-white">How we use it</h2>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>To provide the service: dashboards, review management, AI reply drafts, and the feedback widget.</li>
            <li>To send alert emails to you (via our email provider) when a widget visitor sends private feedback rated 1-3 stars.</li>
            <li>To process subscriptions and send billing-related communications (via Stripe).</li>
          </ul>
          <p className="text-slate-400">
            We do not sell personal data, and we do not use customer widget feedback for advertising.
          </p>

          <h2 className="text-lg font-semibold text-white">Data sharing</h2>
          <p className="text-slate-400">
            We share data only with the processors required to run the service: our hosting provider,
            the PostgreSQL database provider, Stripe (payments), our email provider (alert emails),
            Google (only if you connect your Business Profile), and our AI provider (only the text of a
            review, and only at the moment you request an AI reply draft — never in the background).
          </p>

          <h2 className="text-lg font-semibold text-white">Data retention & deletion</h2>
          <p className="text-slate-400">
            Your data is retained while your account is active. If you cancel or delete your account,
            your reviews, feedback, and profile data are deleted. You can request deletion at any time
            by contacting us.
          </p>

          <h2 className="text-lg font-semibold text-white">Security</h2>
          <p className="text-slate-400">
            Passwords are hashed with bcrypt, all traffic is encrypted in transit (TLS), the API is
            protected by JWT authentication and rate limiting, and database credentials are never
            exposed to clients.
          </p>

          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p className="text-slate-400">
            Questions about this policy: <a href="mailto:privacy@localproof.app" className="text-brand-500 hover:text-brand-400">privacy@localproof.app</a>
          </p>
        </div>
      </div>
    </div>
  );
}

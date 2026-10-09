import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-300 px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: October 2026</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <p>
            These terms govern your use of LocalProof. By creating an account or using the service,
            you agree to them.
          </p>

          <h2 className="text-lg font-semibold text-white">The service</h2>
          <p className="text-slate-400">
            LocalProof helps local businesses collect customer feedback through an embeddable widget,
            manage reviews, detect suspicious reviews, and draft replies. New accounts include a
            14-day free trial; after that, continued use requires a paid subscription ($49/month,
            billed through Stripe).
          </p>

          <h2 className="text-lg font-semibold text-white">Acceptable use — review integrity</h2>
          <p className="text-slate-400">
            LocalProof routes genuine customer sentiment: satisfied customers are invited to leave a
            public Google review; dissatisfied customers are invited to give private feedback first.
            You agree not to use the service to generate, purchase, or incentivize fake reviews, to
            suppress genuine negative reviews, or to misrepresent your business. The service is
            designed to comply with Google's review policies and FTC endorsement guidelines; misuse
            may result in suspension.
          </p>

          <h2 className="text-lg font-semibold text-white">Your account</h2>
          <p className="text-slate-400">
            You are responsible for keeping your credentials confidential and for all activity under
            your account. You must provide accurate information and keep it current.
          </p>

          <h2 className="text-lg font-semibold text-white">Billing & cancellation</h2>
          <p className="text-slate-400">
            Subscriptions are billed monthly in advance through Stripe and renew automatically until
            cancelled. You can cancel at any time from the Stripe customer portal; access continues
            until the end of the paid period. The free trial requires no payment method. Refunds are
            handled at our discretion, except where required by law.
          </p>

          <h2 className="text-lg font-semibold text-white">Availability & disclaimer</h2>
          <p className="text-slate-400">
            The service is provided "as is" without warranties of any kind. We aim for high availability
            but do not guarantee uninterrupted service, and features that depend on third parties (Google
            Business Profile, Stripe, email delivery, AI providers) are subject to those providers'
            own terms and availability.
          </p>

          <h2 className="text-lg font-semibold text-white">Limitation of liability</h2>
          <p className="text-slate-400">
            To the maximum extent permitted by law, LocalProof's liability arising out of or relating
            to the service is limited to the amount you paid us in the 12 months preceding the claim.
          </p>

          <h2 className="text-lg font-semibold text-white">Changes & contact</h2>
          <p className="text-slate-400">
            We may update these terms; material changes will be announced by email or in the app.
            Questions: <a href="mailto:legal@localproof.app" className="text-brand-500 hover:text-brand-400">legal@localproof.app</a>
          </p>
        </div>
      </div>
    </div>
  );
}

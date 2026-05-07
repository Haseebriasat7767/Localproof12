import { useState } from "react";
import { RocketLaunch, PlayCircle, Brain, ShieldCheck, ChartLineUp, CaretDown, Browser, Gauge, ArrowsClockwise } from "phosphor-react";
import LocalProofDemoWidget from "../components/LocalProofDemoWidget"; // your existing component

export default function LandingPage() {
  const [demoTab, setDemoTab] = useState("widget");
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  const tabContent = {
    widget: (
      <div className="text-center">
        <Browser className="text-blue-600 text-5xl mx-auto mb-4" weight="duotone" />
        <h3 className="text-xl font-semibold mb-2">Widget Preview</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Visitors get a one-click rating. Happy → Google. Unhappy → private feedback.
        </p>
        <div className="mt-6 mx-auto max-w-sm bg-white rounded-xl shadow p-4">
          <LocalProofDemoWidget /> {/* your existing widget component */}
        </div>
      </div>
    ),
    dashboard: (
      <div className="text-center">
        <Gauge className="text-blue-600 text-5xl mx-auto mb-4" weight="duotone" />
        <h3 className="text-xl font-semibold mb-2">Dashboard View</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          All feedback, AI‑drafted responses, and your reputation health in one place.
        </p>
        <div className="mt-6 p-4 bg-slate-50 rounded-lg text-sm text-slate-500 italic">
          [ Dashboard screenshot coming soon ]
        </div>
      </div>
    ),
    flow: (
      <div className="text-center">
        <ArrowsClockwise className="text-blue-600 text-5xl mx-auto mb-4" weight="duotone" />
        <h3 className="text-xl font-semibold mb-2">Customer Flow</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Visit site → widget pops up → rate → routed to Google Review or private form.
        </p>
      </div>
    ),
  };

  return (
    <div className="bg-white text-slate-800 antialiased">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-5">
        <div className="font-bold text-2xl text-slate-900">📍 LocalProof</div>
        <a
          href="#cta"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition"
        >
          Get started free
        </a>
      </nav>

      {/* Hero */}
      <section className="text-center pt-24 pb-16 px-6">
        <span className="inline-block bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">
          🎉 Free forever – no credit card required
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
          The 5‑second Google review machine
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto mt-4 mb-8">
          Turn happy customers into public praise. Catch unhappy ones privately before they hurt your rating.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="#cta"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg transition"
          >
            <RocketLaunch /> Start free in 30 seconds
          </a>
          <a
            href="#demo"
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-full font-semibold hover:bg-slate-50 transition"
          >
            <PlayCircle /> See how it works
          </a>
        </div>
        <div className="mt-10 mx-auto max-w-lg bg-slate-100 p-5 rounded-2xl shadow-sm">
          <p className="font-semibold text-slate-700 mb-2">⚡ One line of code. Install in under a minute.</p>
          <code className="block bg-slate-800 text-slate-200 p-3 rounded-lg text-sm break-all">
            {`<script src="https://localproof.app/widget.js" data-id="YOUR_ID"></script>`}
          </code>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">No fluff. Three jobs, done well.</h2>
          <p className="text-slate-600 max-w-xl mx-auto mb-12">
            Simple tools that protect your reputation and grow your Google reviews on autopilot.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "1. Smart routing", desc: "Happy visitors (4–5 stars) go straight to your Google review page. Unhappy ones see a private, internal feedback form – never a public complaint." },
              { icon: ShieldCheck, title: "2. Real reviews, zero fear", desc: "Every review comes from genuine customers. Nothing fake, nothing filtered. 100% compliant with Google’s guidelines built in." },
              { icon: ChartLineUp, title: "3. Dashboard that works", desc: "See all feedback in one place, get AI‑drafted review responses, and know exactly who’s being routed where. No noise." },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-white border border-slate-200 p-7 rounded-2xl hover:shadow-md transition">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Audience badges */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Built for businesses where Google ranking = revenue</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["🦷 Dentists", "🏠 Home Services", "💇 Salons", "🚗 Auto Shops", "⚖️ Lawyers", "🏥 Medical Practices"].map((badge) => (
              <span key={badge} className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-1.5 rounded-full">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-10">The numbers don’t lie</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { value: "+47%", desc: "more Google reviews within 30 days" },
              { value: "-82%", desc: "negative public reviews caught early" },
              { value: "12 min", desc: "average setup time (yes, really)" },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl font-extrabold text-blue-600">{stat.value}</div>
                <p className="text-slate-600 mt-2">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Demo (using your existing widget) */}
      <section id="demo" className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">See LocalProof in action</h2>
          <p className="text-slate-600 max-w-xl mx-auto mb-10">
            Everything you need – from the customer widget to your private dashboard.
          </p>
          <div className="flex justify-center gap-2 mb-8">
            {["widget", "dashboard", "flow"].map((tab) => (
              <button
                key={tab}
                onClick={() => setDemoTab(tab)}
                className={`px-5 py-2 rounded-full font-medium border transition ${
                  demoTab === tab
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {tab === "widget" ? "The Widget" : tab === "dashboard" ? "Dashboard" : "Customer Flow"}
              </button>
            ))}
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-dashed border-blue-300 rounded-2xl p-8 min-h-[280px] flex items-center justify-center">
            {tabContent[demoTab]}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-10">Trusted by reputation‑first businesses</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "LocalProof caught 3 complaints we turned into 5‑star customers. My rating went from 3.8 to 4.6 in a month.",
                author: "Maria K.",
                role: "Owner, Willow Creek Dental",
              },
              {
                quote: "The private feedback loop is brilliant – our team resolves issues before they ever see the light of Google.",
                author: "David L.",
                role: "Manager, Urban Plumb & HVAC",
              },
              {
                quote: "We went from 12 reviews to 53 in two weeks. Our new clients mention finding us on Google all the time.",
                author: "Jasmine R.",
                role: "Founder, The Glow Bar",
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-7 rounded-2xl text-left">
                <div className="text-yellow-500 mb-3">★★★★★</div>
                <p className="text-slate-700 mb-4">{testimonial.quote}</p>
                <div className="font-semibold text-slate-900">{testimonial.author}</div>
                <div className="text-sm text-slate-500">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">You ask. We answer.</h2>
          {[
            {
              question: "What exactly does my customer see?",
              answer: "They get a one‑click rating request after their visit. If happy (4–5 stars), they’re sent directly to your Google review page. If less satisfied, they land on a private, internal form that only you can see. Clean and frictionless.",
            },
            {
              question: "Is this allowed by Google?",
              answer: "Absolutely. We never post fake reviews, filter content, or offer incentives. We simply route genuine sentiment – public praise goes to Google, private feedback to your inbox. This is fully compliant with Google’s review policies.",
            },
            {
              question: "I’m not technical – will I break my website?",
              answer: "You won’t. LocalProof is designed for owners who don't know what 'code' means. You copy one line of pre‑built text into your site’s footer (we have visual guides for Squarespace, Wix, WordPress). And if you get stuck, a real human answers within hours.",
            },
          ].map((item, idx) => (
            <div key={idx} className="border-b border-slate-200 py-4">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex justify-between items-center text-left font-semibold text-lg text-slate-900 hover:text-blue-600 transition"
              >
                {item.question}
                <CaretDown
                  className={`transform transition ${openFaq === idx ? "rotate-180" : ""}`}
                  size={20}
                />
              </button>
              {openFaq === idx && (
                <p className="mt-2 text-slate-600 pr-4">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">
            🎁 Free forever tier
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Ready to turn happy customers into public reviews?
          </h2>
          <p className="text-slate-600 mb-8">
            Get 25 reviews/month, 5 AI drafts, and the smart routing widget – free, no credit card needed.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-full font-semibold text-lg hover:bg-blue-700 shadow-lg transition"
          >
            <RocketLaunch /> Start your free account
          </a>
          <p className="mt-4 text-sm text-slate-500">
            One‑line install · No credit card · Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        <div className="flex justify-center gap-6 mb-2">
          <a href="#" className="hover:text-blue-600">Privacy Policy</a>
          <a href="#" className="hover:text-blue-600">Terms of Service</a>
          <a href="#" className="hover:text-blue-600">Contact</a>
          <a href="#" className="hover:text-blue-600">Documentation</a>
        </div>
        <p>© 2026 LocalProof. Making reputation simple.</p>
      </footer>
    </div>
  );
      }

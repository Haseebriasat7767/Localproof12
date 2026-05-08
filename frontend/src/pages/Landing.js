import { useState, useEffect, useRef } from "react";
import {
  RocketLaunch, PlayCircle, Brain, ShieldCheck, ChartLineUp, CaretDown,
  Browser, Gauge, ArrowsClockwise, Star, Quote, CheckCircle
} from "phosphor-react";

function WidgetPlaceholder() {
  return (
    <div className="p-6 bg-white/10 rounded-xl text-center text-slate-300 text-sm">
      ⭐ Rate Us Widget – preview soon
    </div>
  );
}

function CountUp({ end, duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (end === 0) return;
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return <>{count}</>;
}

export default function LandingPage() {
  const [demoTab, setDemoTab] = useState("widget");
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const statsRef = useRef(null);
  const [animatedStats, setAnimatedStats] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimatedStats(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleFaq = (idx) => setOpenFaq(openFaq === idx ? null : idx);

  const tabContent = {
    widget: (
      <div className="text-center">
        <Browser className="text-blue-500 text-5xl mx-auto mb-4" weight="duotone" />
        <h3 className="text-xl font-semibold mb-2">Widget Preview</h3>
        <p className="text-slate-400 max-w-md mx-auto">Visitors get a one-click rating. Happy → Google. Unhappy → private feedback.</p>
        <div className="mt-6 mx-auto max-w-sm"><WidgetPlaceholder /></div>
      </div>
    ),
    dashboard: (
      <div className="text-center">
        <Gauge className="text-blue-500 text-5xl mx-auto mb-4" weight="duotone" />
        <h3 className="text-xl font-semibold mb-2">Dashboard View</h3>
        <p className="text-slate-400 max-w-md mx-auto">All feedback, AI‑drafted responses, and your reputation health in one place.</p>
        <div className="mt-6 p-6 bg-white/5 rounded-xl text-sm text-slate-400 italic">Dashboard screenshot – coming soon</div>
      </div>
    ),
    flow: (
      <div className="text-center">
        <ArrowsClockwise className="text-blue-500 text-5xl mx-auto mb-4" weight="duotone" />
        <h3 className="text-xl font-semibold mb-2">Customer Flow</h3>
        <p className="text-slate-400 max-w-md mx-auto">Visit site → widget pops up → rate → routed to Google Review or private form.</p>
      </div>
    ),
  };

  return (
    <div className="bg-slate-950 text-slate-200 antialiased overflow-x-hidden">
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 shadow-2xl" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2 text-2xl font-bold text-white">
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">📍 LocalProof</span>
          </div>
          <a href="#cta" className="relative group bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/50 transition-all duration-200 hover:-translate-y-0.5">Get started free</a>
        </div>
      </nav>

      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-0 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium backdrop-blur-sm">🎉 Free forever – no credit card required</div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">The <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-emerald-400 bg-clip-text text-transparent">5‑second</span> Google review machine</h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mt-6 mb-10 leading-relaxed">Turn happy customers into glowing public reviews. Catch unhappy ones <span className="text-white">privately</span> before they ever touch Google.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="#cta" className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-200 hover:-translate-y-0.5"><RocketLaunch className="text-white" size={20} weight="fill" /> Start free in 30 seconds</a>
            <a href="#demo" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-slate-300 border border-slate-700 hover:bg-slate-800 transition duration-200"><PlayCircle size={20} /> See how it works</a>
          </div>
          <div className="mt-12 mx-auto max-w-lg bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-5 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2 mb-3"><CheckCircle className="text-green-400" size={18} /><p className="text-sm font-medium text-slate-300">One line. No tech skills needed.</p></div>
            <code className="block bg-slate-950 text-slate-300 p-4 rounded-lg text-sm font-mono break-all border border-slate-800">{`<script src="https://backend-production-54fd.up.railway.app/api/widget/69f7ba5f92d4b9cd359e5267/embed.js" async></script>`}</code>
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Three jobs, <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">done brilliantly</span></h2>
            <p className="text-slate-400 max-w-xl mx-auto mt-3">Simple tools that protect your reputation and grow your Google reviews on autopilot.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:row-span-2 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 hover:bg-slate-900/80 transition duration-300 hover:border-slate-700 group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition"><Brain className="text-blue-400" size={28} /></div>
              <h3 className="text-xl font-semibold mb-3">1. Smart Routing</h3>
              <p className="text-slate-400 leading-relaxed">Happy visitors (4‑5 stars) are sent directly to your Google review page. Unhappy ones see a private feedback form — never a public complaint. <span className="text-white">Legally compliant, always.</span></p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 hover:bg-slate-900/80 transition duration-300 hover:border-slate-700 group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition"><ShieldCheck className="text-emerald-400" size={28} /></div>
              <h3 className="text-xl font-semibold mb-3">2. Real Reviews, No Fear</h3>
              <p className="text-slate-400 leading-relaxed">100% compliant with Google & FTC guidelines. We never gate or fake — we route genuine sentiment.</p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 hover:bg-slate-900/80 transition duration-300 hover:border-slate-700 group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition"><ChartLineUp className="text-purple-400" size={28} /></div>
              <h3 className="text-xl font-semibold mb-3">3. Dashboard That Works</h3>
              <p className="text-slate-400 leading-relaxed">See all feedback, AI‑drafted replies, and track your reputation health. No noise, just what matters.</p>
            </div>
            <div className="md:col-span-2 lg:col-span-1 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 hover:bg-slate-900/80 transition duration-300 hover:border-slate-700 group">
              <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition"><Star className="text-orange-400" size={28} /></div>
              <h3 className="text-xl font-semibold mb-3">Instant Embed</h3>
              <p className="text-slate-400 leading-relaxed">One line of code. Works with Squarespace, Wix, WordPress, and custom sites. Under 30 seconds.</p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 hover:bg-slate-900/80 transition duration-300 hover:border-slate-700 group">
              <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-500/20 transition"><Quote className="text-pink-400" size={28} /></div>
              <h3 className="text-xl font-semibold mb-3">AI Reply Drafts</h3>
              <p className="text-slate-400 leading-relaxed">Respond to reviews faster with AI-generated drafts matching your brand tone.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">Built for businesses where <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Google ranking = revenue</span></h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["🦷 Dentists", "🏠 Home Services", "💇 Salons", "🚗 Auto Shops", "⚖️ Lawyers", "🏥 Medical Practices"].map((badge) => (
              <span key={badge} className="px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium hover:border-slate-500 hover:bg-slate-700 transition cursor-default">{badge}</span>
            ))}
          </div>
        </div>
      </section>

      <section ref={statsRef} className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">The numbers don't lie</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[ { value: 47, suffix: "%", desc: "more Google reviews within 30 days", prefix: "+" }, { value: 82, suffix: "%", desc: "negative public reviews caught early", prefix: "-" }, { value: 12, suffix: " min", desc: "average setup time", prefix: "" } ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">{stat.prefix}<span className="tabular-nums">{animatedStats ? <CountUp end={stat.value} duration={2000} /> : 0}</span>{stat.suffix}</span>
                <p className="text-slate-400 mt-2">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">See LocalProof in action</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-10">Everything you need – from the customer widget to your private dashboard.</p>
          <div className="flex justify-center gap-2 mb-8">
            {["widget", "dashboard", "flow"].map((tab) => (
              <button key={tab} onClick={() => setDemoTab(tab)} className={`px-5 py-2 rounded-full font-medium text-sm transition border backdrop-blur-sm ${demoTab === tab ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-slate-700 text-slate-400 hover:border-slate-500"}`}>
                {tab === "widget" ? "The Widget" : tab === "dashboard" ? "Dashboard" : "Customer Flow"}
              </button>
            ))}
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 min-h-[300px] flex items-center justify-center shadow-xl">
            {tabContent[demoTab]}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Loved by local businesses</h2>
          <p className="text-slate-400 mb-12">Real results from owners just like you.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[ { quote: "Our Google rating went from 3.8 to 4.6 in one month.", author: "Maria K.", role: "Dentist" }, { quote: "I installed it during my lunch break. The free tier alone doubled our reviews.", author: "David L.", role: "Plumber" }, { quote: "The private feedback saved us from a bad public review.", author: "Jasmine R.", role: "Salon Owner" } ].map((t, i) => (
              <div key={i} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 text-left hover:border-slate-700 transition duration-300">
                <div className="flex gap-1 mb-4 text-yellow-400">{[...Array(5)].map((_, j) => <Star key={j} weight="fill" size={18} />)}</div>
                <p className="text-slate-300 mb-6 leading-relaxed italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-white">{t.author[0]}</div>
                  <div><div className="font-semibold text-white">{t.author}</div><div className="text-sm text-slate-400">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">You ask. We answer.</h2>
          {[ { question: "What exactly does my customer see?", answer: "They get a one‑click rating request. If happy (4–5 stars), they're sent to your Google review page. If less satisfied, they land on a private, internal form only you can see." }, { question: "Is this allowed by Google?", answer: "Absolutely. We never fake reviews or filter. We route genuine sentiment — public praise to Google, private feedback to your inbox. Fully compliant with Google & FTC rules." }, { question: "I'm not technical – will I break my website?", answer: "No. One line of code. We have step-by-step guides for Squarespace, Wix, WordPress. And a real human answers if you get stuck." } ].map((item, idx) => (
            <div key={idx} className="border-b border-slate-800 py-5">
              <button onClick={() => toggleFaq(idx)} className="w-full flex justify-between items-center text-left font-semibold text-lg text-white hover:text-blue-400 transition">{item.question}<CaretDown className={`transform transition duration-200 ${openFaq === idx ? "rotate-180" : ""}`} size={20} /></button>
              {openFaq === idx && <p className="mt-3 text-slate-400 pr-4">{item.answer}</p>}
            </div>
          ))}
        </div>
      </section>

      <section id="cta" className="py-24 px-6 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-950 to-blue-950/30"></div>
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium">🎁 Free forever tier</div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Ready to turn happy customers<br/>into <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">public reviews</span>?</h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">Get 25 reviews/month, 5 AI drafts, and the smart routing widget – free, no credit card needed. Setup takes 30 seconds.</p>
          <a href="#" className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/60 transition-all hover:-translate-y-0.5"><RocketLaunch weight="fill" size={22} /> Start your free account</a>
          <p className="mt-6 text-sm text-slate-500">One‑line install · No credit card · Cancel anytime</p>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-10 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-slate-500">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Contact</a>
            <a href="#" className="hover:text-white transition">Documentation</a>
          </div>
          <p>© 2026 LocalProof. Making reputation simple.</p>
        </div>
      </footer>
    </div>
  );
}
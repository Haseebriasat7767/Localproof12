import { useState, useEffect, useRef } from "react";
import {
  Rocket, Play, Brain, ShieldCheck, TrendingUp, ChevronDown,
  Globe, BarChart2, RefreshCw, Star, Quote, CheckCircle, ArrowRight,
  Zap, Shield, Award, AlertTriangle
} from "lucide-react";

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

function FadeIn({ children, delay = 0, className = "" }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-700 ${className} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [demoTab, setDemoTab] = useState("widget");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (idx) => setOpenFaq(openFaq === idx ? null : idx);

  const tabContent = {
    widget: (
      <div className="text-center">
        <Globe className="text-brand-500 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-2">Widget Preview</h3>
        <p className="text-slate-400 max-w-md mx-auto">Visitors get a one-click rating. Happy → Google. Unhappy → private feedback.</p>
        <div className="mt-6 mx-auto max-w-sm">
          <div className="p-6 bg-white/5 rounded-xl text-center text-slate-300 text-sm border border-white/10">
            <Star size={20} className="mx-auto mb-2 text-yellow-400" />
            <p className="font-medium">Rate Us Widget</p>
            <p className="text-xs mt-1 text-slate-400">Preview active in dashboard</p>
          </div>
        </div>
      </div>
    ),
    dashboard: (
      <div className="text-center">
        <BarChart2 className="text-brand-500 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-2">Dashboard View</h3>
        <p className="text-slate-400 max-w-md mx-auto">All feedback, AI-drafted responses, and your reputation health in one place.</p>
        <div className="mt-6 p-6 bg-white/5 rounded-xl text-sm text-slate-400 italic border border-white/10">
          Dashboard preview — available after signup
        </div>
      </div>
    ),
    flow: (
      <div className="text-center">
        <RefreshCw className="text-brand-500 mx-auto mb-4" size={48} />
        <h3 className="text-xl font-semibold mb-2">Customer Flow</h3>
        <p className="text-slate-400 max-w-md mx-auto">Visit site → widget pops up → rate → routed to Google Review or private form.</p>
      </div>
    ),
  };

  return (
    <div className="bg-[#0a0e1a] text-slate-300 antialiased overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="LocalProof" className="w-8 h-8" />
            <span className="text-xl font-bold text-white tracking-tight">LocalProof</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hidden sm:block text-sm text-slate-400 hover:text-white transition">Features</a>
            <a href="#pricing" className="hidden sm:block text-sm text-slate-400 hover:text-white transition">Pricing</a>
            <a href="#faq" className="hidden sm:block text-sm text-slate-400 hover:text-white transition">FAQ</a>
            <a href="/login" className="text-sm text-slate-400 hover:text-white transition">Sign in</a>
            <a href="/register" className="bg-white text-[#0a0e1a] px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-200 transition-all duration-200">
              Get started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-brand-500/10 rounded-full mix-blend-screen filter blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full mix-blend-screen filter blur-[150px]" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">Pro tools for local businesses</span>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white">
              Turn happy customers into<br />
              <span className="bg-gradient-to-r from-brand-500 via-brand-300 to-success-400 bg-clip-text text-transparent">5-star reviews</span>
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mt-8 mb-10 leading-relaxed">
              The smart review routing system that sends happy customers to Google and unhappy ones to a private feedback form — before they ever post publicly.
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="/register" className="group inline-flex items-center gap-2 bg-white text-[#0a0e1a] px-8 py-4 rounded-full font-semibold text-base hover:bg-slate-200 transition-all duration-200 shadow-xl shadow-white/10">
                Start free trial <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </a>
              <a href="#demo" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-slate-300 border border-white/10 hover:bg-white/5 transition duration-200">
                <Play size={18} /> See how it works
              </a>
            </div>
          </FadeIn>
          <FadeIn delay={400}>
            <div className="mt-12 mx-auto max-w-lg bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="text-emerald-400" size={18} />
                <p className="text-sm font-medium text-slate-300">One line of code. No tech skills needed.</p>
              </div>
              <code className="block bg-black/40 text-slate-300 p-4 rounded-lg text-sm font-mono break-all border border-white/10">
                {`<script src="https://localproof.io/api/widget/YOUR_ID/embed.js" async></script>`}
              </code>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Social Proof / Trust Bar */}
      <FadeIn>
        <section className="py-8 border-y border-white/5">
          <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm">
            <span className="flex items-center gap-2"><Shield size={16} className="text-slate-400" /> Google Compliant</span>
            <span className="flex items-center gap-2"><Award size={16} className="text-slate-400" /> FTC Verified</span>
            <span className="flex items-center gap-2"><Zap size={16} className="text-slate-400" /> 30-Second Setup</span>
            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-slate-400" /> Cancel Anytime</span>
          </div>
        </section>
      </FadeIn>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Everything you need to grow your reputation</h2>
              <p className="text-slate-400 max-w-xl mx-auto mt-4 text-lg">Simple tools that protect your reputation and grow your Google reviews on autopilot.</p>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FadeIn delay={0}>
              <div className="lg:row-span-2 bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/[0.05] transition duration-300 hover:border-white/20 group">
                <div className="w-11 h-11 bg-brand-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand-500/20 transition border border-brand-500/20">
                  <Brain className="text-brand-500" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">Smart Review Routing</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Happy visitors (4-5 stars) are sent directly to your Google review page. Unhappy ones see a private feedback form — never a public complaint.</p>
                <div className="mt-6 flex items-center gap-2 text-sm text-brand-500">
                  <CheckCircle size={14} /> <span>Google & FTC compliant</span>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/[0.05] transition duration-300 hover:border-white/20 group">
                <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition border border-emerald-500/20">
                  <ShieldCheck className="text-emerald-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">Real Reviews, No Fear</h3>
                <p className="text-slate-400 leading-relaxed text-sm">100% compliant with Google & FTC guidelines. We never gate or fake — we route genuine sentiment.</p>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/[0.05] transition duration-300 hover:border-white/20 group">
                <div className="w-11 h-11 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition border border-purple-500/20">
                  <TrendingUp className="text-purple-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">Reputation Dashboard</h3>
                <p className="text-slate-400 leading-relaxed text-sm">See all feedback, AI-drafted replies, and track your reputation health. No noise, just what matters.</p>
              </div>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/[0.05] transition duration-300 hover:border-white/20 group">
                <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition border border-orange-500/20">
                  <Star className="text-orange-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">Instant Embed</h3>
                <p className="text-slate-400 leading-relaxed text-sm">One line of code. Works with Squarespace, Wix, WordPress, and custom sites. Under 30 seconds.</p>
              </div>
            </FadeIn>
            <FadeIn delay={400}>
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/[0.05] transition duration-300 hover:border-white/20 group">
                <div className="w-11 h-11 bg-pink-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-pink-500/20 transition border border-pink-500/20">
                  <Quote className="text-pink-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">AI Reply Drafts</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Respond to reviews faster with AI-generated drafts matching your brand tone. Powered by Claude.</p>
              </div>
            </FadeIn>
            <FadeIn delay={500}>
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/[0.05] transition duration-300 hover:border-white/20 group">
                <div className="w-11 h-11 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition border border-cyan-500/20">
                  <AlertTriangle className="text-cyan-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">Fake Detection</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Automatically flag suspicious reviews. Protect your reputation from competitors and bots.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <FadeIn>
        <section className="py-20 px-6 border-y border-white/5">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-12 tracking-tight">Results that speak for themselves</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { value: 47, suffix: "%", desc: "more Google reviews in 30 days", prefix: "+" },
                { value: 82, suffix: "%", desc: "negative reviews caught privately", prefix: "−" },
                { value: 12, suffix: " min", desc: "average setup time", prefix: "" }
              ].map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
                    {stat.prefix}<CountUp end={stat.value} />{stat.suffix}
                  </span>
                  <p className="text-slate-500 mt-3 text-sm">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Demo Section */}
      <section id="demo" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">See LocalProof in action</h2>
            <p className="text-slate-400 max-w-xl mx-auto mb-10">Everything you need — from the customer widget to your private dashboard.</p>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="flex justify-center gap-2 mb-8">
              {["widget", "dashboard", "flow"].map((tab) => (
                <button key={tab} onClick={() => setDemoTab(tab)}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm transition border ${demoTab === tab ? "bg-white/10 border-white/20 text-white" : "bg-transparent border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"}`}>
                  {tab === "widget" ? "The Widget" : tab === "dashboard" ? "Dashboard" : "Customer Flow"}
                </button>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 min-h-[300px] flex items-center justify-center shadow-2xl">
              {tabContent[demoTab]}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <FadeIn>
        <section className="py-24 px-6 border-y border-white/5">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Loved by local businesses</h2>
            <p className="text-slate-400 mb-12">Real results from owners just like you.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { quote: "Our Google rating went from 3.8 to 4.6 in one month. The routing widget is genius.", author: "Maria K.", role: "Dentist", stars: 5 },
                { quote: "I installed it during my lunch break. It doubled our reviews in two weeks.", author: "David L.", role: "Plumber", stars: 5 },
                { quote: "The private feedback saved us from a bad public review. Game changer.", author: "Jasmine R.", role: "Salon Owner", stars: 5 }
              ].map((t, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-left hover:border-white/20 transition duration-300">
                  <div className="flex gap-1 mb-4 text-yellow-500">
                    {[...Array(t.stars)].map((_, j) => <Star key={j} fill="currentColor" size={16} />)}
                  </div>
                  <p className="text-slate-300 mb-6 leading-relaxed text-sm italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                      {t.author[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{t.author}</div>
                      <div className="text-xs text-slate-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-bold text-white text-center mb-12 tracking-tight">Frequently asked questions</h2>
          </FadeIn>
          {[
            { question: "What exactly does my customer see?", answer: "They get a one-click rating request. If happy (4-5 stars), they're sent to your Google review page. If less satisfied, they land on a private, internal form only you can see." },
            { question: "Is this allowed by Google?", answer: "Absolutely. We never fake reviews or filter. We route genuine sentiment — public praise to Google, private feedback to your inbox. Fully compliant with Google & FTC rules." },
            { question: "I'm not technical — will I break my website?", answer: "No. One line of code. We have step-by-step guides for Squarespace, Wix, WordPress. And a real human answers if you get stuck." }
          ].map((item, idx) => (
            <FadeIn key={idx} delay={idx * 100}>
              <div className="border-b border-white/10 py-5">
                <button onClick={() => toggleFaq(idx)} className="w-full flex justify-between items-center text-left font-semibold text-base text-white hover:text-brand-500 transition">
                  {item.question}
                  <ChevronDown className={`transform transition duration-300 ${openFaq === idx ? "rotate-180 text-brand-500" : "text-slate-500"}`} size={20} />
                </button>
                {openFaq === idx && (
                  <p className="mt-3 text-slate-400 text-sm leading-relaxed pr-8">{item.answer}</p>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0a0e1a] via-[#0a0e1a] to-brand-900/20" />
        <div className="max-w-3xl mx-auto text-center relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium">
              <span className="text-brand-500">Simple pricing</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              Ready to grow your<br />
              <span className="bg-gradient-to-r from-brand-500 to-success-400 bg-clip-text text-transparent">Google reviews?</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
              Unlimited AI drafts, review tracking, and smart routing widget — $49/month. Setup takes 30 seconds.
            </p>
            <a href="/register" className="inline-flex items-center gap-2 bg-white text-[#0a0e1a] px-10 py-4 rounded-full font-semibold text-lg hover:bg-slate-200 transition-all shadow-xl shadow-white/10">
              Start free trial <ArrowRight size={20} />
            </a>
            <p className="mt-6 text-sm text-slate-500">14-day free trial · $49/month after trial ends · Cancel anytime</p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="LocalProof" className="w-6 h-6" />
              <span className="text-lg font-bold text-white">LocalProof</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Contact</a>
              <a href="#" className="hover:text-white transition">Docs</a>
            </div>
            <p className="text-sm text-slate-600">© 2026 LocalProof</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

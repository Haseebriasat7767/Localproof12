"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  Clock,
  FileWarning,
  FolderCheck,
  HelpCircle,
  Layers,
  MailCheck,
  MessageSquareText,
  Repeat,
  ShieldCheck,
  Sparkles,
  UserSquare2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/primitives";
import { Logo } from "@/components/brand/logo";
import { FAQS, PLANS } from "@/data/mock";
import { cn } from "@/lib/utils";

/* ---------- helpers ---------- */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && (
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-teal-600">
          {eyebrow}
        </p>
      )}
      <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[36px]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">{description}</p>
      )}
    </div>
  );
}

/* ---------- social proof ---------- */

const FIRMS = [
  "Northstar Bookkeeping",
  "Harborline CPA",
  "Ledgerwood Advisors",
  "Bright Meridian Tax",
  "Cascade Financial Group",
  "Ironwood Accounting",
];

export function SocialProof() {
  return (
    <section className="border-y border-border bg-canvas py-10">
      <div className="container-page">
        <p className="text-center text-[13px] font-medium text-ink-muted">
          Built for the firms closing hundreds of books every month
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {FIRMS.map((f, i) => (
            <Reveal key={f} delay={i * 0.05}>
              <span className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-tight text-ink-muted">
                <span className="h-5 w-5 rounded-md bg-slate-300/70" />
                {f}
              </span>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-[12px] text-ink-muted">
          Illustrative firm names shown for demonstration.
        </p>
      </div>
    </section>
  );
}

/* ---------- problem ---------- */

const PROBLEMS = [
  {
    icon: Repeat,
    title: "Endless Follow-ups",
    body: "Your team writes the same three emails every month to the same twelve clients — then follows up on the follow-ups. It is the single biggest time sink in the close.",
    stat: "6.2 emails per client, per month",
  },
  {
    icon: FileWarning,
    title: "Missing Documents",
    body: "One missing bank statement holds up an entire month. Receipts arrive as blurry photos, statements arrive late, and nobody can tell you what is actually outstanding.",
    stat: "31 items outstanding on an average day",
  },
  {
    icon: Clock,
    title: "Slow Month-End Close",
    body: "Books that should close in five days stretch to eighteen because you are waiting on clients. Revenue is capped by how fast people answer their email.",
    stat: "18 days average close, vs. 5 target",
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="The problem"
          title="The close isn't slow because of the accounting."
          description="It's slow because of the chasing. Every firm we talk to loses the same week each month to the same conversations."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="card h-full p-6 transition-shadow duration-200 hover:shadow-lift">
                <span className="inline-flex rounded-lg bg-canvas p-2.5 text-ink-soft">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-ink">
                  {p.title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">{p.body}</p>
                <p className="mt-5 border-t border-border pt-4 text-[13px] font-medium text-ink-muted">
                  {p.stat}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- how it works ---------- */

const STEPS = [
  {
    n: "01",
    title: "Connect your clients",
    body: "Import your client list from QuickBooks, Xero or a spreadsheet, then pick a workflow template for each client type. Checklists build themselves.",
  },
  {
    n: "02",
    title: "Let ChaseAI chase missing information",
    body: "ChaseAI drafts personalized reminders, sends them on your cadence across email and SMS, answers portal uploads, and escalates when a client goes quiet.",
  },
  {
    n: "03",
    title: "Close the books faster",
    body: "Watch a live checklist per client instead of a mailbox. When everything is in, your team closes — days earlier, without the follow-up tax.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-canvas py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps to a quieter month-end"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="relative h-full rounded-xl border border-border bg-white p-6">
                <span className="text-[13px] font-semibold tracking-[0.14em] text-teal-600">
                  {s.n}
                </span>
                <h3 className="mt-3 text-[18px] font-semibold tracking-tight text-ink">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">{s.body}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="absolute -right-[18px] top-1/2 hidden h-5 w-5 -translate-y-1/2 text-ink-muted md:block" />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- features ---------- */

const FEATURES = [
  {
    icon: Bot,
    title: "AI Client Chaser",
    body: "Reads each client's open checklist and writes a short, specific follow-up in your firm's voice. You approve, edit or let it send on schedule.",
  },
  {
    icon: FolderCheck,
    title: "Automated Document Collection",
    body: "Per-client checklists with due dates and owners. Uploads are auto-matched to the right line item and marked received instantly.",
  },
  {
    icon: MessageSquareText,
    title: "Smart Transaction Questions",
    body: "Flags uncategorized transactions, drafts a plain-English question for the client, and files the answer back against the transaction.",
  },
  {
    icon: UserSquare2,
    title: "Client Portal",
    body: "A branded, password-free page where clients see exactly what's outstanding and drag files in. No app, no login friction.",
  },
  {
    icon: MailCheck,
    title: "Email + SMS Automation",
    body: "Multi-step sequences with waits, channel switching and escalation to the assigned accountant when a client stops responding.",
  },
  {
    icon: BarChart3,
    title: "Bookkeeping Analytics",
    body: "Collection rate, response times, overdue clients and hours saved — per client, per team member, per month.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Platform"
          title="Everything you need to stop chasing"
          description="Purpose-built for bookkeeping workflows — not a generic CRM bent into shape."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.07}>
              <div className="group card h-full p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
                <span className="inline-flex rounded-lg bg-teal-50 p-2.5 text-teal-600 transition-colors group-hover:bg-teal-500 group-hover:text-white">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-[16px] font-semibold tracking-tight text-ink">
                  {f.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- ROI ---------- */

const BEFORE = [
  "18-day average month-end close",
  "6+ manual follow-up emails per client",
  "No visibility into what's outstanding",
  "Uncategorized transactions sit for weeks",
  "Client capacity capped by admin time",
];

const AFTER = [
  "7-day average month-end close",
  "Reminders drafted and sent automatically",
  "Live checklist and status per client",
  "Transaction questions answered in the portal",
  "Same team, 40% more clients",
];

export function RoiSection() {
  return (
    <section className="bg-navy-900 py-20 text-white sm:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-teal-400">
            The return
          </p>
          <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[36px]">
            Give your team back a week every month
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-slate-300">
            Firms running ChaseAI cut their close time roughly in half and take on more
            clients without adding headcount.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-slate-400">
                Before ChaseAI
              </p>
              <ul className="mt-5 space-y-3.5">
                {BEFORE.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-[14px] text-slate-300">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full rounded-xl border border-teal-400/25 bg-teal-400/[0.07] p-6">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-teal-400">
                After ChaseAI
              </p>
              <ul className="mt-5 space-y-3.5">
                {AFTER.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-[14px] text-white">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" strokeWidth={2.5} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 border-t border-white/10 pt-10 sm:grid-cols-4">
          {[
            { v: "61h", l: "Saved per month" },
            { v: "93%", l: "Document collection rate" },
            { v: "2.4d", l: "Average client response" },
            { v: "11d", l: "Faster close" },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 0.06}>
              <div className="text-center">
                <p className="text-[30px] font-semibold tracking-tight text-teal-400">{s.v}</p>
                <p className="mt-1 text-[13px] text-slate-400">{s.l}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- pricing ---------- */

export function PricingGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "grid gap-5",
        compact ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {PLANS.map((p, i) => (
        <Reveal key={p.name} delay={i * 0.07} className="h-full">
          <div
            className={cn(
              "relative flex h-full flex-col rounded-xl border bg-white p-6 transition-shadow duration-200 hover:shadow-lift",
              p.popular ? "border-teal-500 shadow-lift" : "border-border shadow-card"
            )}
          >
            {p.popular && (
              <span className="absolute -top-3 left-6 rounded-full bg-teal-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                Most Popular
              </span>
            )}
            <h3 className="text-[16px] font-semibold tracking-tight text-ink">{p.name}</h3>
            <p className="mt-1 text-[13px] text-ink-soft">{p.clients}</p>
            <div className="mt-4 flex items-baseline gap-1">
              {p.price === null ? (
                <span className="text-[30px] font-semibold tracking-tight text-ink">Custom</span>
              ) : (
                <>
                  <span className="text-[34px] font-semibold tracking-tight text-ink">
                    ${p.price}
                  </span>
                  <span className="text-[14px] text-ink-soft">/mo</span>
                </>
              )}
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{p.blurb}</p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full"
              variant={p.popular ? "default" : "outline"}
              asChild
            >
              <Link href={p.price === null ? "/app/settings" : "/app/billing"}>
                {p.price === null ? "Contact Sales" : "Start Free Trial"}
              </Link>
            </Button>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="border-y border-border bg-canvas py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Pricing"
          title="Priced per client, not per headache"
          description="Every plan includes the AI chaser, client portal and automation builder. Upgrade when your client list grows."
        />
        <div className="mt-14">
          <PricingGrid />
        </div>
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="inline-flex items-center gap-2 text-[13px] text-ink-soft">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            14-day free trial on every plan · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */

export function Faq() {
  return (
    <section id="faq" className="py-20 sm:py-24">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[380px_1fr]">
          <div>
            <SectionHeading
              center={false}
              eyebrow="FAQ"
              title="Questions, answered"
              description="Everything firms ask before they switch their month-end over to ChaseAI."
            />
            <Button variant="outline" className="mt-6" asChild>
              <Link href="/app">
                <HelpCircle className="h-4 w-4" /> Talk to our team
              </Link>
            </Button>
          </div>
          <Accordion type="single" collapsible className="w-full border-t border-border">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA + footer ---------- */

export function FinalCta() {
  return (
    <section className="border-t border-border bg-canvas py-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-2xl bg-navy-900 px-6 py-14 text-center sm:px-12">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[680px] -translate-x-1/2 rounded-full bg-teal-500/15 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3.5 py-1.5 text-[13px] font-medium text-teal-300">
              <Sparkles className="h-3.5 w-3.5" />
              Close July on time
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl text-[30px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[38px]">
              Your next close could be a week shorter
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] text-slate-300">
              Start a free 14-day trial and let ChaseAI handle the follow-ups on your ten
              slowest clients.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/app">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/app/clients">Book a Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "Client portal", href: "/portal/abc-dental" },
      { label: "Integrations", href: "/app/integrations" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Customers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help center", href: "/app/help" },
      { label: "Month-end checklist", href: "#" },
      { label: "Blog", href: "#" },
      { label: "API docs", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
      { label: "DPA", href: "#" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-white py-14">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-ink-soft">
              AI-powered client follow-up and document collection for bookkeeping and
              accounting firms.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 text-[13px] text-ink-muted">
              <Layers className="h-4 w-4" /> Demo product — illustrative data only
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[13px] font-semibold text-ink">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-[13.5px] text-ink-soft transition-colors hover:text-teal-600"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-[13px] text-ink-muted">
            © {new Date().getFullYear()} ChaseAI. All rights reserved.
          </p>
          <p className="text-[13px] text-ink-muted">Made for firms that hate follow-ups.</p>
        </div>
      </div>
    </footer>
  );
}

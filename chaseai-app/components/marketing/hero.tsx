"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Clock, FileWarning, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Counter, StatusBadge } from "@/components/app/shared";

const HERO_STATS = [
  { label: "Clients", value: 47, icon: Users, tone: "text-ink" },
  { label: "Missing docs", value: 31, icon: FileWarning, tone: "text-ink" },
  { label: "Overdue", value: 8, icon: Clock, tone: "text-rose-600" },
  { label: "Hours saved", value: 61, suffix: "h", icon: Sparkles, tone: "text-teal-600" },
];

const HERO_ROWS = [
  { client: "ABC Dental", missing: "3 items", tone: "attention" as const, status: "Needs Attention", progress: 72 },
  { client: "Smith & Co LLC", missing: "—", tone: "complete" as const, status: "Complete", progress: 100 },
  { client: "Johnson Realty", missing: "6 items", tone: "overdue" as const, status: "Overdue", progress: 45 },
  { client: "Miller Construction", missing: "1 item", tone: "waiting" as const, status: "Waiting", progress: 88 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* subtle background wash */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-canvas to-white" />
      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-teal-500/[0.07] blur-3xl" />

      <div className="container-page relative pb-20 pt-16 sm:pt-20 lg:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-50 px-3.5 py-1.5 text-[13px] font-medium text-teal-700">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered client follow-up
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-balance text-[38px] font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-[52px] lg:text-[60px]"
          >
            Stop Chasing Clients.
            <br className="hidden sm:block" /> Start Closing the Books.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-soft"
          >
            ChaseAI follows up with your bookkeeping clients for you — collecting missing
            statements, receipts and transaction answers automatically, so your team closes
            the month instead of writing the same email for the fourth time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/app">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/app/clients">Book a Demo</Link>
            </Button>
          </motion.div>

          <p className="mt-4 text-[13px] text-ink-muted">
            14-day free trial · No credit card required · Set up in an afternoon
          </p>
        </div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-14 max-w-5xl"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-lift">
            {/* window chrome */}
            <div className="flex items-center gap-2 border-b border-border bg-canvas px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="ml-3 text-[12px] font-medium text-ink-muted">
                Northstar Bookkeeping · July close
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {HERO_STATS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.07 }}
                    className="rounded-xl border border-border bg-white p-4"
                  >
                    <div className="flex items-center gap-2 text-ink-muted">
                      <s.icon className="h-3.5 w-3.5" />
                      <span className="text-[12px] font-medium">{s.label}</span>
                    </div>
                    <p className={`mt-2 text-[24px] font-semibold tracking-tight ${s.tone}`}>
                      <Counter value={s.value} suffix={s.suffix} />
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 overflow-hidden rounded-xl border border-border">
                <div className="flex items-center justify-between border-b border-border bg-canvas/60 px-4 py-2.5">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
                    Client follow-ups
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-teal-600">
                    <motion.span
                      animate={{ opacity: [1, 0.35, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity }}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                    </motion.span>
                    AI chasing 14 clients
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {HERO_ROWS.map((r, i) => (
                    <motion.div
                      key={r.client}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.65 + i * 0.08 }}
                      className="flex items-center gap-4 px-4 py-3"
                    >
                      <span className="w-40 shrink-0 truncate text-[13px] font-medium text-ink">
                        {r.client}
                      </span>
                      <div className="hidden flex-1 sm:block">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <motion.div
                            className={
                              "h-full rounded-full " +
                              (r.progress === 100 ? "bg-teal-500" : "bg-teal-400")
                            }
                            initial={{ width: 0 }}
                            animate={{ width: `${r.progress}%` }}
                            transition={{ duration: 0.9, delay: 0.8 + i * 0.08 }}
                          />
                        </div>
                      </div>
                      <span className="hidden w-20 text-[12px] text-ink-soft sm:block">
                        {r.missing}
                      </span>
                      <StatusBadge tone={r.tone}>{r.status}</StatusBadge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* floating accent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.05 }}
            className="absolute -bottom-5 left-4 hidden items-center gap-2.5 rounded-xl border border-border bg-white px-3.5 py-2.5 shadow-lift sm:flex lg:-left-8"
          >
            <span className="rounded-lg bg-teal-50 p-1.5 text-teal-600">
              <Check className="h-4 w-4" strokeWidth={3} />
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-medium text-ink">Payroll report received</p>
              <p className="text-[11px] text-ink-muted">Smith &amp; Co · auto-matched</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.2 }}
            className="absolute -top-5 right-4 hidden items-center gap-2.5 rounded-xl border border-border bg-navy-900 px-3.5 py-2.5 shadow-lift sm:flex lg:-right-6"
          >
            <Sparkles className="h-4 w-4 text-teal-400" />
            <p className="text-[13px] font-medium text-white">
              3 reminders drafted &amp; scheduled
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

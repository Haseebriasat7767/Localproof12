"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock,
  FileWarning,
  MessageSquareText,
  Sparkles,
  Timer,
  Upload,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import {
  Avatar,
  Column,
  DataTable,
  KpiCard,
  PageHeader,
  StatusBadge,
  TableSkeleton,
} from "@/components/app/shared";
import { useStore } from "@/components/app/store";
import { ACTIVITY, statusTone, type Client } from "@/data/mock";
import { cn } from "@/lib/utils";

const ACTIVITY_ICON = {
  ai: { icon: Sparkles, tone: "bg-teal-50 text-teal-600" },
  upload: { icon: Upload, tone: "bg-indigo-50 text-indigo-600" },
  answer: { icon: MessageSquareText, tone: "bg-slate-100 text-slate-600" },
  escalate: { icon: AlertTriangle, tone: "bg-rose-50 text-rose-600" },
  complete: { icon: Check, tone: "bg-teal-50 text-teal-600" },
};

export default function DashboardPage() {
  const { clients, toast } = useStore();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const columns: Column<Client>[] = [
    {
      key: "client",
      header: "Client",
      cell: (c) => (
        <Link
          href={`/app/clients/${c.id}`}
          className="flex items-center gap-3 focus-ring rounded-lg"
        >
          <Avatar name={c.name} size="sm" />
          <span>
            <span className="block text-[13.5px] font-medium text-ink hover:text-teal-600">
              {c.name}
            </span>
            <span className="block text-[12px] text-ink-muted">{c.contact}</span>
          </span>
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => <StatusBadge tone={statusTone[c.status]}>{c.status}</StatusBadge>,
    },
    {
      key: "missing",
      header: "Missing items",
      cell: (c) => (
        <span className={cn("text-[13.5px]", c.missing > 0 ? "text-ink" : "text-ink-muted")}>
          {c.missing > 0 ? `${c.missing} item${c.missing > 1 ? "s" : ""}` : "None"}
        </span>
      ),
    },
    {
      key: "last",
      header: "Last contact",
      cell: (c) => <span className="text-[13.5px] text-ink-soft">{c.lastContact}</span>,
    },
    {
      key: "next",
      header: "Next reminder",
      cell: (c) => <span className="text-[13.5px] text-ink-soft">{c.nextReminder}</span>,
    },
    {
      key: "owner",
      header: "Owner",
      cell: (c) => (
        <span className="inline-flex items-center gap-2 text-[13.5px] text-ink">
          <Avatar name={c.owner} size="sm" />
          <span className="hidden xl:inline">{c.owner}</span>
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            disabled={c.missing === 0}
            onClick={() =>
              toast(`Chasing ${c.name}`, "AI reminder drafted and queued for sending.")
            }
          >
            <Sparkles className="h-3.5 w-3.5" /> Chase
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/app/clients/${c.id}`}>View</Link>
          </Button>
        </div>
      ),
    },
  ];

  const overdue = clients.filter((c) => c.status === "Overdue");

  return (
    <div>
      <PageHeader
        title="Good morning, Rachel"
        description="Here's where the July close stands across your book of clients."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => toast("Report exported", "July close summary sent to your email.")}
            >
              Export summary
            </Button>
            <Button asChild>
              <Link href="/app/clients">
                <Users className="h-4 w-4" /> Manage clients
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Clients" value={47} delta={8.4} icon={Users} index={0} />
        <KpiCard
          label="Missing Documents"
          value={31}
          sub="8 overdue"
          icon={FileWarning}
          index={1}
        />
        <KpiCard label="Awaiting Response" value={14} delta={-12} icon={Clock} index={2} />
        <KpiCard label="Hours Saved" value={61} suffix="h" delta={18} icon={Timer} index={3} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-4">
            <div>
              <CardTitle>Client follow-ups</CardTitle>
              <p className="mt-1 text-[13px] text-ink-soft">
                {clients.filter((c) => c.missing > 0).length} clients still owe you documents
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/clients">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <div className="border-t border-border">
            {loading ? (
              <TableSkeleton cols={6} rows={6} />
            ) : (
              <DataTable columns={columns} rows={clients} />
            )}
          </div>
        </Card>

        <div className="space-y-5">
          {/* AI insight */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="relative overflow-hidden rounded-xl bg-navy-900 p-5 text-white"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-500/20 blur-2xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-2.5 py-1 text-[12px] font-medium text-teal-300">
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  className="inline-flex"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </motion.span>
                AI insight
              </span>
              <p className="mt-3.5 text-[14px] font-medium leading-relaxed">
                {overdue.length} clients have gone quiet for more than a week —{" "}
                {overdue.map((c) => c.name).join(" and ")}. They account for 11 of your 31
                outstanding documents.
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                Escalating to their account owners now typically recovers documents 3 days
                faster than another email reminder.
              </p>
              <Button className="mt-4 w-full" asChild>
                <Link href="/app/clients?status=Overdue">
                  Review Clients <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ol className="space-y-4">
                {ACTIVITY.map((a, i) => {
                  const meta = ACTIVITY_ICON[a.kind];
                  return (
                    <motion.li
                      key={a.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * i }}
                      className="flex gap-3"
                    >
                      <span className={cn("mt-0.5 h-7 w-7 shrink-0 rounded-lg p-1.5", meta.tone)}>
                        <meta.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] leading-snug text-ink">{a.text}</span>
                        <span className="mt-0.5 block text-[12px] text-ink-muted">{a.time}</span>
                      </span>
                    </motion.li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

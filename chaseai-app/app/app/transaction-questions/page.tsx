"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, RefreshCw, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import {
  Avatar,
  Column,
  DataTable,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/app/shared";
import { useStore } from "@/components/app/store";
import { formatCurrency } from "@/lib/utils";
import type { TxQuestion } from "@/data/mock";

function GeneratorPanel() {
  const { questions, toast } = useStore();
  const pending = questions.filter((q) => q.status === "Pending");
  const [idx, setIdx] = React.useState(0);
  const tx = pending[Math.min(idx, Math.max(0, pending.length - 1))];
  const [generated, setGenerated] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => setGenerated(null), [idx, pending.length]);

  if (!tx)
    return (
      <Card className="h-fit">
        <CardContent>
          <EmptyState
            title="No transactions need clarification"
            description="Every flagged transaction has an answer from the client."
            icon={Check}
          />
        </CardContent>
      </Card>
    );

  const generate = () => {
    setBusy(true);
    setTimeout(() => {
      setGenerated(tx.question);
      setBusy(false);
      toast("Question generated", "Review it, then send to the client.");
    }, 1000);
  };

  return (
    <Card className="h-fit overflow-hidden border-teal-500/25">
      <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-teal-50 to-white px-5 py-4">
        <motion.span
          animate={busy ? { rotate: 360 } : { opacity: [1, 0.5, 1] }}
          transition={
            busy ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 2.4, repeat: Infinity }
          }
          className="inline-flex rounded-lg bg-teal-500 p-2 text-white"
        >
          <Sparkles className="h-4 w-4" />
        </motion.span>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-ink">
            AI Transaction Question Generator
          </p>
          <p className="text-[12.5px] text-ink-soft">
            {pending.length} uncategorized transaction{pending.length === 1 ? "" : "s"} in the queue
          </p>
        </div>
      </div>

      <CardContent className="space-y-5">
        {pending.length > 1 && (
          <Select value={String(idx)} onChange={(e) => setIdx(Number(e.target.value))}>
            {pending.map((q, i) => (
              <option key={q.id} value={i}>
                {q.client} — {formatCurrency(q.amount)} on {q.date}
              </option>
            ))}
          </Select>
        )}

        <div className="rounded-xl border border-border bg-canvas/60 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
                Transaction
              </p>
              <p className="mt-1.5 text-[26px] font-semibold tracking-tight text-ink">
                {formatCurrency(tx.amount)}
              </p>
              <p className="mt-1 text-[13px] text-ink-soft">
                {tx.date} · {tx.client}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
                Merchant
              </p>
              <p className="mt-1.5 text-[14px] font-medium text-ink">{tx.merchant}</p>
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="font-medium text-ink-soft">AI confidence</span>
              <span className="font-semibold text-ink">{tx.confidence}%</span>
            </div>
            <Progress
              value={tx.confidence}
              className="mt-2"
              barClassName={tx.confidence < 50 ? "bg-amber-500" : "bg-teal-500"}
            />
          </div>
        </div>

        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
            AI recommendation
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{tx.recommendation}</p>
        </div>

        {generated && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
              Generated question
            </p>
            <Textarea
              className="mt-2"
              rows={4}
              value={generated}
              onChange={(e) => setGenerated(e.target.value)}
            />
          </motion.div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={generate} disabled={busy}>
            {busy ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {busy ? "Generating…" : generated ? "Regenerate Question" : "Generate Question"}
          </Button>
          {generated && (
            <Button
              variant="outline"
              onClick={() => toast(`Question sent to ${tx.client}`, "It'll appear in their portal.")}
            >
              <Send className="h-4 w-4" /> Send to client
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TransactionQuestionsPage() {
  const { questions, answerQuestion, toast } = useStore();
  const [filter, setFilter] = React.useState("All");

  const rows = questions.filter((q) => filter === "All" || q.status === filter);

  const columns: Column<TxQuestion>[] = [
    {
      key: "amount",
      header: "Amount",
      cell: (q) => (
        <div>
          <p className="text-[13.5px] font-semibold text-ink">{formatCurrency(q.amount)}</p>
          <p className="text-[12px] text-ink-muted">{q.date}</p>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      cell: (q) => (
        <span className="inline-flex items-center gap-2.5 text-[13.5px] text-ink">
          <Avatar name={q.client} size="sm" />
          {q.client}
        </span>
      ),
    },
    {
      key: "question",
      header: "Question",
      className: "max-w-[320px]",
      cell: (q) => (
        <p className="line-clamp-2 text-[13px] leading-snug text-ink-soft">{q.question}</p>
      ),
    },
    {
      key: "answer",
      header: "Client answer",
      className: "max-w-[240px]",
      cell: (q) =>
        q.answer ? (
          <p className="line-clamp-2 text-[13px] leading-snug text-ink">{q.answer}</p>
        ) : (
          <span className="text-[13px] text-ink-muted">Awaiting reply</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (q) => (
        <StatusBadge tone={q.status === "Answered" ? "answered" : "pending"}>
          {q.status === "Answered" ? "Answered ✓" : "Pending"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (q) => (
        <Button
          size="sm"
          variant="outline"
          disabled={q.status === "Answered"}
          onClick={() => {
            answerQuestion(q.id, "Confirmed by client in the portal.");
            toast("Answer recorded", `${q.client} transaction resolved.`);
          }}
        >
          Mark answered
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Transaction Questions"
        description={`${questions.filter((q) => q.status === "Pending").length} pending · ${questions.filter((q) => q.status === "Answered").length} answered this period`}
        actions={
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-44">
            {["All", "Pending", "Answered"].map((f) => (
              <option key={f}>{f}</option>
            ))}
          </Select>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle>Flagged transactions</CardTitle>
          </CardHeader>
          <div className="border-t border-border">
            <DataTable
              columns={columns}
              rows={rows}
              empty={<EmptyState title="No transactions in this view" icon={Check} />}
            />
          </div>
        </Card>

        <GeneratorPanel />
      </div>
    </div>
  );
}

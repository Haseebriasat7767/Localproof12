"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  ExternalLink,
  FileWarning,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Send,
  Sparkles,
  Timer,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Progress,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, ConfirmDialog, StatusBadge } from "@/components/app/shared";
import { useStore } from "@/components/app/store";
import { statusTone, type Client } from "@/data/mock";
import { cn } from "@/lib/utils";

function draftMessage(client: Client, variant: number) {
  const missing = client.documents.filter((d) => !d.received).map((d) => d.name);
  const list = missing.length
    ? missing.map((m) => `• ${m}`).join("\n")
    : "• Nothing outstanding — you're all set!";

  const openers = [
    `Hi ${client.contact.split(" ")[0]},`,
    `Hi ${client.contact.split(" ")[0]} — quick one,`,
    `Hey ${client.contact.split(" ")[0]},`,
  ];
  const bodies = [
    `We're closing out ${client.monthlyClose} for ${client.company} and we're ${client.progress}% of the way there. To wrap it up we just need:`,
    `${client.monthlyClose} is nearly done for ${client.company} — thanks for what you've sent already. The last few items we need are:`,
    `Checking in on ${client.monthlyClose}. Everything is in except these ${missing.length} item${missing.length === 1 ? "" : "s"}:`,
  ];
  const closers = [
    `You can drop them straight into your portal — no login needed. If anything is tricky to find, reply here and I'll help track it down.`,
    `The portal link below takes about two minutes. Once these land we can close the month and get your financials over to you.`,
    `Easiest path is the upload link below. Let me know if any of these don't apply this period and I'll take them off the list.`,
  ];

  return `${openers[variant % 3]}

${bodies[variant % 3]}

${list}

${closers[variant % 3]}

Thanks,
Rachel Kim
Northstar Bookkeeping`;
}

function AiChaserPanel({ client }: { client: Client }) {
  const { toast } = useStore();
  const [variant, setVariant] = React.useState(0);
  const [message, setMessage] = React.useState(() => draftMessage(client, 0));
  const [regenerating, setRegenerating] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [when, setWhen] = React.useState("Tomorrow, 9:00 AM");
  const [channel, setChannel] = React.useState("Email");

  const missing = client.documents.filter((d) => !d.received);

  const regenerate = () => {
    setRegenerating(true);
    setTimeout(() => {
      const next = variant + 1;
      setVariant(next);
      setMessage(draftMessage(client, next));
      setRegenerating(false);
      toast("New draft generated", "ChaseAI rewrote the reminder in a different tone.");
    }, 1100);
  };

  return (
    <Card className="overflow-hidden border-teal-500/25">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-gradient-to-r from-teal-50 to-white px-5 py-4">
        <div className="flex items-center gap-3">
          <motion.span
            animate={regenerating ? { rotate: 360 } : { opacity: [1, 0.5, 1] }}
            transition={
              regenerating
                ? { duration: 1, repeat: Infinity, ease: "linear" }
                : { duration: 2.4, repeat: Infinity }
            }
            className="inline-flex rounded-lg bg-teal-500 p-2 text-white"
          >
            <Sparkles className="h-4 w-4" />
          </motion.span>
          <div>
            <p className="text-[15px] font-semibold tracking-tight text-ink">AI Client Chaser</p>
            <p className="text-[12.5px] text-ink-soft">
              Drafted from {client.name}&apos;s open checklist · {client.frequency} cadence
            </p>
          </div>
        </div>
        <Select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="hidden w-32 sm:block"
        >
          <option>Email</option>
          <option>SMS</option>
        </Select>
      </div>

      <CardContent className="space-y-5">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
            Missing items ChaseAI will reference
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {missing.length ? (
              missing.map((d) => (
                <span
                  key={d.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-canvas px-2.5 py-1.5 text-[12.5px] text-ink"
                >
                  <FileWarning className="h-3.5 w-3.5 text-amber-500" />
                  {d.name}
                  <span className="text-ink-muted">· due {d.dueDate}</span>
                </span>
              ))
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1.5 text-[12.5px] text-teal-700">
                <Check className="h-3.5 w-3.5" /> Nothing outstanding
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
              Generated message
            </p>
            <span className="text-[12px] text-ink-muted">
              {editing ? "Editing" : `Draft v${variant + 1}`}
            </span>
          </div>

          {regenerating && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/75 backdrop-blur-[1px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-white px-3.5 py-2 text-[13px] font-medium text-teal-700 shadow-card">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Regenerating…
              </span>
            </div>
          )}

          {editing ? (
            <Textarea
              rows={13}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="font-normal"
            />
          ) : (
            <pre className="whitespace-pre-wrap rounded-lg border border-border bg-canvas/60 p-4 font-sans text-[13.5px] leading-relaxed text-ink">
              {message}
            </pre>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setEditing(false);
              toast(`${channel} sent to ${client.contact}`, "Message logged on the client timeline.");
            }}
          >
            <Send className="h-4 w-4" /> Send Now
          </Button>
          <Button variant="outline" onClick={() => setEditing((e) => !e)}>
            <Pencil className="h-4 w-4" /> {editing ? "Done editing" : "Edit Message"}
          </Button>
          <Button variant="outline" onClick={() => setScheduleOpen(true)}>
            <CalendarClock className="h-4 w-4" /> Schedule
          </Button>
          <Button variant="ghost" onClick={regenerate} disabled={regenerating}>
            <RefreshCw className={cn("h-4 w-4", regenerating && "animate-spin")} /> Regenerate
          </Button>
        </div>
      </CardContent>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule this reminder</DialogTitle>
            <DialogDescription>
              ChaseAI will send the draft to {client.email} at the time you pick.
            </DialogDescription>
          </DialogHeader>
          <Select value={when} onChange={(e) => setWhen(e.target.value)}>
            <option>In 2 hours</option>
            <option>Tomorrow, 9:00 AM</option>
            <option>Monday, 8:00 AM</option>
            <option>In 3 days</option>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setScheduleOpen(false);
                toast("Reminder scheduled", `${channel} to ${client.name} · ${when}`);
              }}
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  progress,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
  progress?: number;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-ink-soft">{label}</p>
        <span className="rounded-lg bg-canvas p-2 text-ink-muted">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-[26px] font-semibold tracking-tight text-ink">{value}</p>
      {progress !== undefined && <Progress value={progress} className="mt-3" />}
      {sub && <p className="mt-2 text-[12px] text-ink-muted">{sub}</p>}
    </div>
  );
}

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const { clients, toggleDoc, removeClient, toast } = useStore();
  const [confirmRemove, setConfirmRemove] = React.useState(false);

  const client = clients.find((c) => c.id === params.id);
  if (!client) return notFound();

  return (
    <div>
      <Link
        href="/app/clients"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All clients
      </Link>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={client.name} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[22px] font-semibold tracking-tight text-ink">{client.name}</h1>
              <StatusBadge tone={statusTone[client.status]}>{client.status}</StatusBadge>
            </div>
            <p className="mt-1 text-[13.5px] text-ink-soft">
              {client.company} · {client.email} · {client.frequency} close · Owner {client.owner}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => toast(`Reminder sent to ${client.name}`, "AI-personalized email queued.")}
          >
            <Send className="h-4 w-4" /> Send Reminder
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/portal/${client.id}`} target="_blank">
              <ExternalLink className="h-4 w-4" /> View Client Portal
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast("Checklist duplicated to August")}>
                <RefreshCw /> Roll checklist forward
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/transaction-questions">
                  <MessageSquareText /> Transaction questions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Automation paused for this client")}>
                <Timer /> Pause automation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onClick={() => setConfirmRemove(true)}>
                <Trash2 /> Remove client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Bookkeeping Progress"
          value={`${client.progress}%`}
          icon={TrendingUp}
          progress={client.progress}
          sub={`${client.documents.filter((d) => d.received).length} of ${client.documents.length} items received`}
        />
        <StatCard
          label="Missing Documents"
          value={String(client.missing)}
          icon={FileWarning}
          sub={client.missing ? "Chaser is active" : "Nothing outstanding"}
        />
        <StatCard
          label="Open Questions"
          value={String(client.openQuestions)}
          icon={MessageSquareText}
          sub="Transaction clarifications"
        />
        <StatCard label="Last Response" value={client.lastResponse} icon={Timer} sub={`Next reminder: ${client.nextReminder}`} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="h-fit overflow-hidden">
          <CardHeader className="pb-4">
            <div>
              <CardTitle>Document checklist</CardTitle>
              <p className="mt-1 text-[13px] text-ink-soft">{client.monthlyClose}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast("Request sent", "Checklist link emailed to the client.")}
            >
              Send checklist
            </Button>
          </CardHeader>
          <div className="border-t border-border">
            <ul className="divide-y divide-border">
              {client.documents.map((d) => (
                <li key={d.id} className="flex items-start gap-3 px-5 py-3.5">
                  <Checkbox
                    className="mt-0.5"
                    checked={d.received}
                    onCheckedChange={() => {
                      toggleDoc(client.id, d.id);
                      toast(
                        d.received ? `${d.name} marked outstanding` : `${d.name} marked received`
                      );
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-[13.5px] font-medium",
                        d.received ? "text-ink-muted line-through" : "text-ink"
                      )}
                    >
                      {d.name}
                    </p>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      Due {d.dueDate} · {d.assignee}
                    </p>
                  </div>
                  <span className="shrink-0 text-right">
                    {d.received ? (
                      <StatusBadge tone="complete">Received</StatusBadge>
                    ) : (
                      <span className="text-[12px] text-ink-soft">{d.reminder}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <AiChaserPanel client={client} />
      </div>

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title={`Remove ${client.name}?`}
        description="This removes the client, their checklist and all scheduled reminders. This cannot be undone."
        confirmLabel="Remove client"
        onConfirm={() => {
          removeClient(client.id);
          toast(`${client.name} removed`);
          window.location.href = "/app/clients";
        }}
      />
    </div>
  );
}

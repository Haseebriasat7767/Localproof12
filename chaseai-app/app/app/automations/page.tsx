"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  GitBranch,
  Mail,
  MessageSquare,
  Plus,
  Sparkles,
  Timer,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Label,
  Select,
  Switch,
} from "@/components/ui/primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/app/shared";
import { useStore } from "@/components/app/store";
import { cn } from "@/lib/utils";

type StepType = "Trigger" | "Email" | "SMS" | "Notification" | "Wait" | "Condition" | "AI Message" | "Escalate";

type Step = { id: string; type: StepType; title: string; detail: string };

const STEP_META: Record<StepType, { icon: React.ElementType; tone: string }> = {
  Trigger: { icon: GitBranch, tone: "bg-navy-900 text-teal-400" },
  Email: { icon: Mail, tone: "bg-teal-50 text-teal-600" },
  SMS: { icon: MessageSquare, tone: "bg-indigo-50 text-indigo-600" },
  Notification: { icon: Bell, tone: "bg-amber-50 text-amber-600" },
  Wait: { icon: Timer, tone: "bg-slate-100 text-slate-600" },
  Condition: { icon: GitBranch, tone: "bg-slate-100 text-slate-600" },
  "AI Message": { icon: Sparkles, tone: "bg-teal-50 text-teal-600" },
  Escalate: { icon: AlertTriangle, tone: "bg-rose-50 text-rose-600" },
};

const ADDABLE: { type: StepType; label: string; detail: string }[] = [
  { type: "Email", label: "Send Email", detail: "Send a templated email to the client" },
  { type: "SMS", label: "Send SMS", detail: "Text the client's mobile number" },
  { type: "Notification", label: "Notify Accountant", detail: "Alert the assigned team member" },
  { type: "Wait", label: "Wait", detail: "Pause 2 days before the next step" },
  { type: "Condition", label: "Condition", detail: "Branch on whether documents arrived" },
  { type: "AI Message", label: "AI Message", detail: "Let ChaseAI draft a personalized nudge" },
  { type: "Escalate", label: "Escalate", detail: "Escalate to the account owner" },
];

const INITIAL: Step[] = [
  { id: "s0", type: "Trigger", title: "Client missing document", detail: "Runs when a checklist item passes its due date" },
  { id: "s1", type: "Wait", title: "Wait 2 days", detail: "Give the client a grace period" },
  { id: "s2", type: "Email", title: "Send Email", detail: "AI-personalized reminder listing missing items" },
  { id: "s3", type: "Wait", title: "Wait 3 days", detail: "No response yet" },
  { id: "s4", type: "SMS", title: "Send SMS", detail: "Short text with the portal upload link" },
  { id: "s5", type: "Wait", title: "Wait 2 days", detail: "Final grace period" },
  { id: "s6", type: "Email", title: "Send Email", detail: "Firmer reminder, CCs the account owner" },
  { id: "s7", type: "Notification", title: "Notify Accountant", detail: "Escalate to the assigned team member" },
];

function StepCard({
  step,
  index,
  onRemove,
}: {
  step: Step;
  index: number;
  onRemove?: () => void;
}) {
  const meta = STEP_META[step.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex items-start gap-4 rounded-xl border bg-white p-4 shadow-card transition-shadow hover:shadow-lift",
        step.type === "Trigger" ? "border-navy-900/20" : "border-border"
      )}
    >
      <span className={cn("shrink-0 rounded-lg p-2.5", meta.tone)}>
        <meta.icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-semibold tracking-tight text-ink">{step.title}</p>
          <span className="rounded-full bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink-muted">
            {step.type === "Trigger" ? "Trigger" : `Step ${index}`}
          </span>
        </div>
        <p className="mt-1 text-[13px] text-ink-soft">{step.detail}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${step.title}`}
          className="rounded-lg p-1.5 text-ink-muted opacity-0 transition hover:bg-rose-50 hover:text-rose-600 focus-ring group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}

export default function AutomationsPage() {
  const { toast } = useStore();
  const [steps, setSteps] = React.useState<Step[]>(INITIAL);
  const [addOpen, setAddOpen] = React.useState(false);

  const [enabled, setEnabled] = React.useState(true);
  const [frequency, setFrequency] = React.useState("Every 2 days");
  const [maxReminders, setMaxReminders] = React.useState("4");
  const [escalateAfter, setEscalateAfter] = React.useState("7");
  const [channels, setChannels] = React.useState<string[]>(["Email", "SMS"]);
  const [aiPersonalization, setAiPersonalization] = React.useState(true);

  const addStep = (t: (typeof ADDABLE)[number]) => {
    setSteps((s) => [
      ...s,
      { id: `s${Date.now()}`, type: t.type, title: t.label, detail: t.detail },
    ]);
    setAddOpen(false);
    toast(`${t.label} added`, "Step appended to the sequence.");
  };

  return (
    <div>
      <PageHeader
        title="Automations"
        description="The follow-up sequence ChaseAI runs whenever a document goes past due."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setSteps(INITIAL);
                toast("Sequence reset to the default template");
              }}
            >
              Reset
            </Button>
            <Button onClick={() => toast("Automation saved", `${steps.length - 1} steps active.`)}>
              Save automation
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div>
              <CardTitle>Missing document sequence</CardTitle>
              <p className="mt-1 text-[13px] text-ink-soft">
                {steps.length - 1} steps · applies to {enabled ? "all active clients" : "no clients (paused)"}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset",
                enabled
                  ? "bg-teal-50 text-teal-700 ring-teal-500/20"
                  : "bg-slate-100 text-slate-600 ring-slate-400/20"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {enabled ? "Live" : "Paused"}
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="relative">
              <span className="absolute left-[26px] top-4 bottom-16 w-px bg-border" aria-hidden />
              <div className="relative space-y-3">
                <AnimatePresence initial={false}>
                  {steps.map((s, i) => (
                    <StepCard
                      key={s.id}
                      step={s}
                      index={i}
                      onRemove={
                        s.type === "Trigger"
                          ? undefined
                          : () => {
                              setSteps((prev) => prev.filter((p) => p.id !== s.id));
                              toast(`${s.title} removed`);
                            }
                      }
                    />
                  ))}
                </AnimatePresence>

                <motion.button
                  layout
                  onClick={() => setAddOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-canvas/50 py-4 text-[13.5px] font-medium text-ink-soft transition-colors hover:border-teal-500/50 hover:bg-teal-50/40 hover:text-teal-700 focus-ring"
                >
                  <Plus className="h-4 w-4" /> Add Step
                </motion.button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle>Automation settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
              <div>
                <p className="text-[13.5px] font-medium text-ink">Automation</p>
                <p className="text-[12px] text-ink-muted">{enabled ? "ON — chasing clients" : "OFF — nothing sends"}</p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(v) => {
                  setEnabled(v);
                  toast(v ? "Automation turned on" : "Automation paused");
                }}
              />
            </div>

            <div>
              <Label>Reminder frequency</Label>
              <Select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                {["Daily", "Every 2 days", "Every 3 days", "Weekly"].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Max reminders</Label>
                <Select value={maxReminders} onChange={(e) => setMaxReminders(e.target.value)}>
                  {["2", "3", "4", "5", "6"].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Escalate after</Label>
                <Select value={escalateAfter} onChange={(e) => setEscalateAfter(e.target.value)}>
                  {["3", "5", "7", "10", "14"].map((n) => (
                    <option key={n} value={n}>
                      {n} days
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label>Channels</Label>
              <div className="space-y-2">
                {["Email", "SMS"].map((c) => (
                  <label
                    key={c}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-[13.5px] text-ink hover:bg-canvas"
                  >
                    <Checkbox
                      checked={channels.includes(c)}
                      onCheckedChange={(v) =>
                        setChannels((p) => (v ? [...p, c] : p.filter((x) => x !== c)))
                      }
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-start justify-between gap-3 rounded-lg border border-teal-500/25 bg-teal-50/60 p-3.5">
              <div>
                <p className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-ink">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" /> AI personalization
                </p>
                <p className="mt-0.5 text-[12px] text-ink-soft">
                  Rewrite each reminder using the client&apos;s history and tone.
                </p>
              </div>
              <Switch checked={aiPersonalization} onCheckedChange={setAiPersonalization} />
            </div>

            <Button
              className="w-full"
              onClick={() =>
                toast("Settings saved", `${frequency} · max ${maxReminders} · escalate after ${escalateAfter} days`)
              }
            >
              Save settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a step</DialogTitle>
            <DialogDescription>Pick what happens next in the sequence.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 sm:grid-cols-2">
            {ADDABLE.map((t) => {
              const meta = STEP_META[t.type];
              return (
                <button
                  key={t.label}
                  onClick={() => addStep(t)}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 text-left transition-all hover:border-teal-500/40 hover:bg-teal-50/40 focus-ring"
                >
                  <span className={cn("shrink-0 rounded-lg p-2", meta.tone)}>
                    <meta.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[13.5px] font-medium text-ink">{t.label}</span>
                    <span className="mt-0.5 block text-[12px] text-ink-soft">{t.detail}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

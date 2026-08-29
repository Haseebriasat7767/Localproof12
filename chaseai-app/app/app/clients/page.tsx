"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, MoreHorizontal, Plus, Search, Sparkles, Trash2, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import {
  Checkbox,
  Input,
  Label,
  Select,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Progress,
} from "@/components/ui/primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Avatar,
  Column,
  ConfirmDialog,
  DataTable,
  EmptyState,
  PageHeader,
  StatusBadge,
} from "@/components/app/shared";
import { useStore } from "@/components/app/store";
import { DOC_TEMPLATES, statusTone, type Client, type ClientStatus } from "@/data/mock";

const STATUSES: (ClientStatus | "All")[] = [
  "All",
  "Complete",
  "Waiting",
  "Needs Attention",
  "Overdue",
];

function AddClientDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { addClient, team, toast } = useStore();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [form, setForm] = React.useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    frequency: "Monthly",
    owner: "Rachel Kim",
  });
  const [templates, setTemplates] = React.useState<string[]>([
    "Bank Statement",
    "Credit Card Statement",
    "Receipts",
  ]);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(1);
        setForm({ name: "", company: "", email: "", phone: "", frequency: "Monthly", owner: "Rachel Kim" });
        setTemplates(["Bank Statement", "Credit Card Statement", "Receipts"]);
      }, 200);
    }
  }, [open]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const createWorkflow = () => {
    setCreating(true);
    setTimeout(() => {
      const id = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `client-${Date.now()}`;
      const documents = templates.map((t, i) => ({
        id: `nd${i}`,
        name: t,
        received: false,
        dueDate: "Aug 5",
        assignee: form.name,
        reminder: "Not sent",
      }));
      const client: Client = {
        id,
        name: form.name,
        contact: form.name,
        company: form.company || form.name,
        email: form.email,
        phone: form.phone,
        frequency: form.frequency as Client["frequency"],
        owner: form.owner,
        monthlyClose: "August 2025",
        progress: 0,
        missing: documents.length,
        lastContact: "Never",
        nextReminder: "Tomorrow, 9:00 AM",
        status: "Waiting",
        openQuestions: 0,
        lastResponse: "—",
        documents,
      };
      addClient(client);
      setCreating(false);
      onOpenChange(false);
      toast(`${form.name} added`, `Workflow created with ${documents.length} checklist items.`);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Add client" : "Set up client workflow"}</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Add the contact ChaseAI will follow up with each period."
              : `Choose what ChaseAI should collect from ${form.name || "this client"} every period.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 pb-5">
          {[1, 2].map((s) => (
            <span
              key={s}
              className={
                "h-1 flex-1 rounded-full transition-colors " +
                (step >= s ? "bg-teal-500" : "bg-slate-200")
              }
            />
          ))}
        </div>

        {step === 1 ? (
          <form
            id="add-client-form"
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Client name</Label>
                <Input id="name" required value={form.name} onChange={set("name")} placeholder="Dana Whitfield" />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input id="company" required value={form.company} onChange={set("company")} placeholder="ABC Dental Group PC" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={set("email")} placeholder="dana@abcdental.com" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="(415) 555-0182" />
              </div>
              <div>
                <Label htmlFor="frequency">Bookkeeping frequency</Label>
                <Select id="frequency" value={form.frequency} onChange={set("frequency")}>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Weekly</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="owner">Assigned team member</Label>
                <Select id="owner" value={form.owner} onChange={set("owner")}>
                  {team.map((m) => (
                    <option key={m.id}>{m.name}</option>
                  ))}
                </Select>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            {DOC_TEMPLATES.map((t) => {
              const checked = templates.includes(t);
              return (
                <label
                  key={t}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-canvas"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) =>
                      setTemplates((prev) => (v ? [...prev, t] : prev.filter((x) => x !== t)))
                    }
                  />
                  <span className="text-[13.5px] font-medium text-ink">{t}</span>
                  {checked && <Check className="ml-auto h-4 w-4 text-teal-500" />}
                </label>
              );
            })}
            <p className="pt-1 text-[12.5px] text-ink-muted">
              {templates.length} items will be added to the recurring checklist.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          )}
          {step === 1 ? (
            <Button type="submit" form="add-client-form">
              Continue
            </Button>
          ) : (
            <Button onClick={createWorkflow} disabled={!templates.length || creating}>
              {creating ? "Creating…" : "Create Workflow"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ClientsInner() {
  const { clients, removeClient, toast } = useStore();
  const params = useSearchParams();
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<ClientStatus | "All">(
    (params.get("status") as ClientStatus) ?? "All"
  );
  const [frequency, setFrequency] = React.useState("All");
  const [addOpen, setAddOpen] = React.useState(false);
  const [toRemove, setToRemove] = React.useState<Client | null>(null);

  const rows = clients.filter((c) => {
    const matchQ =
      !q ||
      [c.name, c.company, c.contact, c.owner].some((v) =>
        v.toLowerCase().includes(q.toLowerCase())
      );
    const matchStatus = status === "All" || c.status === status;
    const matchFreq = frequency === "All" || c.frequency === frequency;
    return matchQ && matchStatus && matchFreq;
  });

  const columns: Column<Client>[] = [
    {
      key: "client",
      header: "Client",
      cell: (c) => (
        <Link href={`/app/clients/${c.id}`} className="flex items-center gap-3 focus-ring rounded-lg">
          <Avatar name={c.name} />
          <span>
            <span className="block text-[13.5px] font-medium text-ink hover:text-teal-600">{c.name}</span>
            <span className="block text-[12px] text-ink-muted">{c.email}</span>
          </span>
        </Link>
      ),
    },
    { key: "company", header: "Company", cell: (c) => <span className="text-[13.5px] text-ink-soft">{c.company}</span> },
    { key: "close", header: "Monthly close", cell: (c) => <span className="text-[13.5px] text-ink-soft">{c.monthlyClose}</span> },
    {
      key: "progress",
      header: "Progress",
      cell: (c) => (
        <div className="w-32">
          <div className="mb-1.5 flex items-center justify-between text-[12px] text-ink-soft">
            <span>{c.progress}%</span>
          </div>
          <Progress value={c.progress} />
        </div>
      ),
    },
    {
      key: "missing",
      header: "Missing",
      cell: (c) => (
        <span className="text-[13.5px] text-ink">{c.missing > 0 ? c.missing : "—"}</span>
      ),
    },
    { key: "last", header: "Last contact", cell: (c) => <span className="text-[13.5px] text-ink-soft">{c.lastContact}</span> },
    { key: "status", header: "Status", cell: (c) => <StatusBadge tone={statusTone[c.status]}>{c.status}</StatusBadge> },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (c) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-lg p-1.5 text-ink-muted hover:bg-canvas hover:text-ink focus-ring">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/app/clients/${c.id}`}>
                <Eye /> View client
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast(`Reminder sent to ${c.name}`, "AI-personalized email queued.")}
            >
              <Send /> Send reminder
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/portal/${c.id}`}>
                <Sparkles /> Open client portal
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={() => setToRemove(c)}>
              <Trash2 /> Remove client
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${clients.length} clients in your workspace · ${clients.reduce((a, c) => a + c.missing, 0)} documents outstanding`}
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Client
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search clients…"
              className="pl-9"
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus | "All")}
              className="sm:w-44"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All statuses" : s}
                </option>
              ))}
            </Select>
            <Select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="sm:w-40"
            >
              {["All", "Monthly", "Quarterly", "Weekly"].map((f) => (
                <option key={f} value={f}>
                  {f === "All" ? "All frequencies" : f}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="border-t border-border">
          <DataTable
            columns={columns}
            rows={rows}
            empty={
              <EmptyState
                title="No clients match those filters"
                description="Try clearing the search or switching the status filter."
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQ("");
                      setStatus("All");
                      setFrequency("All");
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            }
          />
        </div>
      </Card>

      <AddClientDialog open={addOpen} onOpenChange={setAddOpen} />
      <ConfirmDialog
        open={!!toRemove}
        onOpenChange={(v) => !v && setToRemove(null)}
        title={`Remove ${toRemove?.name}?`}
        description="This removes the client, their checklist and all scheduled reminders from your workspace. This cannot be undone."
        confirmLabel="Remove client"
        onConfirm={() => {
          if (toRemove) {
            removeClient(toRemove.id);
            toast(`${toRemove.name} removed`);
          }
        }}
      />
    </div>
  );
}

export default function ClientsPage() {
  return (
    <React.Suspense fallback={null}>
      <ClientsInner />
    </React.Suspense>
  );
}

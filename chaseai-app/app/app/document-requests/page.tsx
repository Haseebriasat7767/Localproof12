"use client";

import * as React from "react";
import Link from "next/link";
import { Filter, Plus, Search, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Checkbox, Input, Label, Select } from "@/components/ui/primitives";
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
  DataTable,
  EmptyState,
  PageHeader,
  StatusBadge,
  type StatusTone,
} from "@/components/app/shared";
import { useStore } from "@/components/app/store";
import { DOC_TEMPLATES } from "@/data/mock";

type Row = {
  id: string;
  clientId: string;
  client: string;
  doc: string;
  dueDate: string;
  assignee: string;
  reminder: string;
  received: boolean;
};

function reqStatus(r: Row): { label: string; tone: StatusTone } {
  if (r.received) return { label: "Received", tone: "complete" };
  if (r.reminder.toLowerCase().includes("escalat")) return { label: "Escalated", tone: "overdue" };
  const n = parseInt(r.reminder, 10);
  if (!Number.isNaN(n) && n >= 3) return { label: "Overdue", tone: "overdue" };
  if (r.reminder.toLowerCase().includes("schedul")) return { label: "Scheduled", tone: "info" };
  if (!Number.isNaN(n)) return { label: "Chasing", tone: "attention" };
  return { label: "Requested", tone: "waiting" };
}

function NewRequestDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { clients, toast } = useStore();
  const [client, setClient] = React.useState(clients[0]?.name ?? "");
  const [items, setItems] = React.useState<string[]>(["Bank Statement"]);
  const [due, setDue] = React.useState("2025-08-05");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New document request</DialogTitle>
          <DialogDescription>
            ChaseAI will add these to the client checklist and start the reminder sequence.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Client</Label>
            <Select value={client} onChange={(e) => setClient(e.target.value)}>
              {clients.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Due date</Label>
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div>
            <Label>Documents</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {DOC_TEMPLATES.map((t) => (
                <label
                  key={t}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border p-2.5 text-[13px] hover:bg-canvas"
                >
                  <Checkbox
                    checked={items.includes(t)}
                    onCheckedChange={(v) =>
                      setItems((p) => (v ? [...p, t] : p.filter((x) => x !== t)))
                    }
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!items.length}
            onClick={() => {
              onOpenChange(false);
              toast("Request sent", `${items.length} items requested from ${client}.`);
            }}
          >
            <Send className="h-4 w-4" /> Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DocumentRequestsPage() {
  const { clients, toggleDoc, toast } = useStore();
  const [q, setQ] = React.useState("");
  const [state, setState] = React.useState("Outstanding");
  const [newOpen, setNewOpen] = React.useState(false);

  const all: Row[] = clients.flatMap((c) =>
    c.documents.map((d) => ({
      id: `${c.id}-${d.id}`,
      clientId: c.id,
      client: c.name,
      doc: d.name,
      dueDate: d.dueDate,
      assignee: d.assignee,
      reminder: d.reminder,
      received: d.received,
    }))
  );

  const rows = all.filter((r) => {
    const matchQ = !q || `${r.client} ${r.doc}`.toLowerCase().includes(q.toLowerCase());
    const s = reqStatus(r).label;
    const matchState =
      state === "All" ||
      (state === "Outstanding" && !r.received) ||
      (state === "Received" && r.received) ||
      state === s;
    return matchQ && matchState;
  });

  const columns: Column<Row>[] = [
    {
      key: "doc",
      header: "Document",
      cell: (r) => (
        <div>
          <p className="text-[13.5px] font-medium text-ink">{r.doc}</p>
          <p className="text-[12px] text-ink-muted">Assigned to {r.assignee}</p>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      cell: (r) => (
        <Link
          href={`/app/clients/${r.clientId}`}
          className="inline-flex items-center gap-2.5 text-[13.5px] text-ink hover:text-teal-600 focus-ring rounded-lg"
        >
          <Avatar name={r.client} size="sm" />
          {r.client}
        </Link>
      ),
    },
    { key: "due", header: "Due date", cell: (r) => <span className="text-[13.5px] text-ink-soft">{r.dueDate}</span> },
    { key: "reminder", header: "Reminders", cell: (r) => <span className="text-[13.5px] text-ink-soft">{r.reminder}</span> },
    {
      key: "status",
      header: "Status",
      cell: (r) => {
        const s = reqStatus(r);
        return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              toggleDoc(r.clientId, r.id.split("-").pop()!);
              toast(r.received ? `${r.doc} reopened` : `${r.doc} marked received`);
            }}
          >
            {r.received ? "Reopen" : "Mark received"}
          </Button>
          <Button
            size="sm"
            disabled={r.received}
            onClick={() => toast(`Chasing ${r.client}`, `Reminder queued for ${r.doc}.`)}
          >
            <Sparkles className="h-3.5 w-3.5" /> Chase
          </Button>
        </div>
      ),
    },
  ];

  const outstanding = all.filter((r) => !r.received).length;

  return (
    <div>
      <PageHeader
        title="Document Requests"
        description={`${outstanding} outstanding across ${clients.length} clients · ${all.length - outstanding} received this period`}
        actions={
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4" /> New request
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
              placeholder="Search documents or clients…"
              className="pl-9"
            />
          </div>
          <div className="relative sm:w-52">
            <Filter className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Select value={state} onChange={(e) => setState(e.target.value)} className="pl-9">
              {["Outstanding", "Received", "Chasing", "Overdue", "Escalated", "Scheduled", "All"].map(
                (s) => (
                  <option key={s}>{s}</option>
                )
              )}
            </Select>
          </div>
        </div>
        <div className="border-t border-border">
          <DataTable
            columns={columns}
            rows={rows}
            empty={
              <EmptyState
                title="No document requests match"
                description="Everything in this view is collected — try another filter."
                action={
                  <Button variant="outline" onClick={() => { setQ(""); setState("All"); }}>
                    Clear filters
                  </Button>
                }
              />
            }
          />
        </div>
      </Card>

      <NewRequestDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}

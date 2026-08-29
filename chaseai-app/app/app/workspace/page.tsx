"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, CalendarDays, FileStack, Layers, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Progress,
  Select,
} from "@/components/ui/primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, KpiCard, PageHeader, StatusBadge } from "@/components/app/shared";
import { useStore } from "@/components/app/store";
import { DOC_TEMPLATES, statusTone } from "@/data/mock";

const TEMPLATES = [
  { name: "Monthly bookkeeping — Standard", items: 5, clients: 21 },
  { name: "Dental practice close", items: 6, clients: 8 },
  { name: "Construction job costing", items: 7, clients: 5 },
  { name: "Real estate / property", items: 8, clients: 6 },
  { name: "Quarterly consulting close", items: 6, clients: 7 },
];

export default function WorkspacePage() {
  const { clients, team, toast } = useStore();
  const [newTemplate, setNewTemplate] = React.useState(false);
  const [templateName, setTemplateName] = React.useState("");

  const closeProgress = Math.round(
    clients.reduce((a, c) => a + c.progress, 0) / Math.max(1, clients.length)
  );

  return (
    <div>
      <PageHeader
        title="Workspace"
        description="Northstar Bookkeeping · July 2025 close period"
        actions={
          <Button onClick={() => setNewTemplate(true)}>
            <Plus className="h-4 w-4" /> New workflow template
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active clients" value={clients.length} icon={Users} index={0} sub="In this workspace" />
        <KpiCard
          label="Close progress"
          value={closeProgress}
          suffix="%"
          icon={CalendarDays}
          index={1}
          sub="Average across clients"
        />
        <KpiCard
          label="Workflow templates"
          value={TEMPLATES.length}
          icon={Layers}
          index={2}
          sub="Reusable checklists"
        />
        <KpiCard label="Team members" value={team.length} icon={Building2} index={3} sub="With workspace access" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="pb-2">
            <div>
              <CardTitle>Close period progress</CardTitle>
              <p className="mt-1 text-[13px] text-ink-soft">
                Where each client stands in the July close
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/clients">View clients</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {clients.map((c) => (
              <div key={c.id} className="flex items-center gap-4">
                <Avatar name={c.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <Link
                      href={`/app/clients/${c.id}`}
                      className="truncate text-[13.5px] font-medium text-ink hover:text-teal-600"
                    >
                      {c.name}
                    </Link>
                    <span className="shrink-0 text-[12.5px] text-ink-soft">{c.progress}%</span>
                  </div>
                  <Progress value={c.progress} />
                </div>
                <StatusBadge tone={statusTone[c.status]} dot={false} className="hidden shrink-0 sm:inline-flex">
                  {c.status}
                </StatusBadge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle>Workflow templates</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="divide-y divide-border">
              {TEMPLATES.map((t) => (
                <li key={t.name} className="flex items-start gap-3 py-3.5 first:pt-0">
                  <span className="mt-0.5 rounded-lg bg-canvas p-2 text-ink-muted">
                    <FileStack className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium text-ink">{t.name}</p>
                    <p className="mt-0.5 text-[12px] text-ink-muted">
                      {t.items} items · used by {t.clients} clients
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast(`${t.name}`, "Template editor is illustrative in this demo.")}
                  >
                    Edit
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Dialog open={newTemplate} onOpenChange={setNewTemplate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New workflow template</DialogTitle>
            <DialogDescription>
              Templates become the recurring checklist for every client assigned to them.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template name</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Nonprofit monthly close"
              />
            </div>
            <div>
              <Label>Base it on</Label>
              <Select defaultValue={DOC_TEMPLATES[0]}>
                {TEMPLATES.map((t) => (
                  <option key={t.name}>{t.name}</option>
                ))}
                <option>Start from scratch</option>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTemplate(false)}>
              Cancel
            </Button>
            <Button
              disabled={!templateName.trim()}
              onClick={() => {
                toast(`${templateName} created`, "Assign it to clients from the Clients page.");
                setTemplateName("");
                setNewTemplate(false);
              }}
            >
              Create template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

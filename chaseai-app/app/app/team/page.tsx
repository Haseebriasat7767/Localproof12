"use client";

import * as React from "react";
import { MoreHorizontal, Trash2, UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
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
import {
  Avatar,
  Column,
  ConfirmDialog,
  DataTable,
  PageHeader,
  StatusBadge,
} from "@/components/app/shared";
import { useStore } from "@/components/app/store";
import type { TeamMember } from "@/data/mock";

const ROLES: TeamMember["role"][] = ["Admin", "Manager", "Bookkeeper", "Staff"];

export default function TeamPage() {
  const { team, addMember, removeMember, toast } = useStore();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [toRemove, setToRemove] = React.useState<TeamMember | null>(null);
  const [form, setForm] = React.useState({ name: "", email: "", role: "Bookkeeper" });

  const columns: Column<TeamMember>[] = [
    {
      key: "name",
      header: "Name",
      cell: (m) => (
        <span className="flex items-center gap-3">
          <Avatar name={m.name} />
          <span>
            <span className="block text-[13.5px] font-medium text-ink">{m.name}</span>
            <span className="block text-[12px] text-ink-muted">{m.email}</span>
          </span>
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (m) => (
        <span className="rounded-full bg-canvas px-2.5 py-1 text-[12.5px] font-medium text-ink-soft">
          {m.role}
        </span>
      ),
    },
    { key: "clients", header: "Clients", cell: (m) => <span className="text-[13.5px] text-ink">{m.clients}</span> },
    { key: "tasks", header: "Open tasks", cell: (m) => <span className="text-[13.5px] text-ink">{m.tasks}</span> },
    {
      key: "status",
      header: "Status",
      cell: (m) => (
        <StatusBadge
          tone={m.status === "Active" ? "complete" : m.status === "Invited" ? "info" : "waiting"}
        >
          {m.status}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (m) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-lg p-1.5 text-ink-muted hover:bg-canvas hover:text-ink focus-ring">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast(`Invite resent to ${m.email}`)}>
              <Mail /> Resend invite
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast(`Clients reassigned from ${m.name}`)}>
              <UserPlus /> Reassign clients
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={() => setToRemove(m)}>
              <Trash2 /> Remove member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Team"
        description={`${team.length} members · ${team.reduce((a, m) => a + m.tasks, 0)} open tasks across the firm`}
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" /> Invite Team Member
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <DataTable columns={columns} rows={team} />
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
            <DialogDescription>
              They&apos;ll get an email invite and can start picking up client work immediately.
            </DialogDescription>
          </DialogHeader>
          <form
            id="invite-form"
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              addMember({
                id: `u${Date.now()}`,
                name: form.name,
                email: form.email,
                role: form.role as TeamMember["role"],
                clients: 0,
                tasks: 0,
                status: "Invited",
              });
              setInviteOpen(false);
              setForm({ name: "", email: "", role: "Bookkeeper" });
              toast(`Invite sent to ${form.email}`);
            }}
          >
            <div>
              <Label>Full name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jordan Ellis"
              />
            </div>
            <div>
              <Label>Work email</Label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jordan@northstarbooks.com"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="invite-form">
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toRemove}
        onOpenChange={(v) => !v && setToRemove(null)}
        title={`Remove ${toRemove?.name}?`}
        description={`They will lose access immediately and their ${toRemove?.clients ?? 0} clients will need reassigning.`}
        confirmLabel="Remove member"
        onConfirm={() => {
          if (toRemove) {
            removeMember(toRemove.id);
            toast(`${toRemove.name} removed from the workspace`);
          }
        }}
      />
    </div>
  );
}

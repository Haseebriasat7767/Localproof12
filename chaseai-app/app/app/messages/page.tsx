"use client";

import * as React from "react";
import { CalendarClock, Mail, MessageSquare, Pencil, Plus, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  Label,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
import { Avatar, EmptyState, PageHeader, StatusBadge } from "@/components/app/shared";
import { useStore } from "@/components/app/store";
import type { Message } from "@/data/mock";

const TABS = ["All", "Email", "SMS", "AI Generated", "Scheduled"] as const;

function MessageCard({
  m,
  onEdit,
}: {
  m: Message;
  onEdit: (m: Message) => void;
}) {
  const { sendMessage, toast } = useStore();
  const ChannelIcon = m.channel === "Email" ? Mail : MessageSquare;

  return (
    <div className="card p-5 transition-shadow duration-200 hover:shadow-lift">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={m.client} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[14px] font-semibold tracking-tight text-ink">{m.client}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-0.5 text-[11.5px] font-medium text-ink-soft">
                <ChannelIcon className="h-3 w-3" /> {m.channel}
              </span>
              {m.aiGenerated && (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[11.5px] font-medium text-teal-700 ring-1 ring-inset ring-teal-500/20">
                  <Sparkles className="h-3 w-3" /> AI Reminder
                </span>
              )}
            </div>
            <p className="mt-1 text-[13.5px] font-medium text-ink">{m.subject}</p>
          </div>
        </div>
        <StatusBadge tone={m.status === "Sent" ? "complete" : m.status === "Scheduled" ? "info" : "neutral"}>
          {m.status}
        </StatusBadge>
      </div>

      <p className="mt-3.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-soft">{m.preview}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted">
          <CalendarClock className="h-3.5 w-3.5" />
          {m.status === "Scheduled" ? `Scheduled · ${m.scheduled}` : `Sent · ${m.sentAt}`}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(m)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            size="sm"
            disabled={m.status === "Sent"}
            onClick={() => {
              sendMessage(m.id);
              toast(`Sent to ${m.client}`, `${m.channel} delivered.`);
            }}
          >
            <Send className="h-3.5 w-3.5" /> Send Now
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const { messages, clients, addMessage, toast } = useStore();
  const [editing, setEditing] = React.useState<Message | null>(null);
  const [draft, setDraft] = React.useState("");
  const [composeOpen, setComposeOpen] = React.useState(false);
  const [composeClient, setComposeClient] = React.useState(clients[0]?.name ?? "");
  const [composeChannel, setComposeChannel] = React.useState<"Email" | "SMS">("Email");
  const [composeBody, setComposeBody] = React.useState("");
  const [generating, setGenerating] = React.useState(false);

  const filtered = (tab: (typeof TABS)[number]) =>
    messages.filter((m) => {
      if (tab === "All") return true;
      if (tab === "AI Generated") return m.aiGenerated;
      if (tab === "Scheduled") return m.status === "Scheduled";
      return m.channel === tab;
    });

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setComposeBody(
        `Hi ${composeClient.split(" ")[0]},\n\nWe're finishing up your July close and there are still a couple of items outstanding. Whenever you get a moment, you can upload them straight to your portal — it takes about two minutes and there's no login.\n\nThanks,\nRachel Kim\nNorthstar Bookkeeping`
      );
      setGenerating(false);
      toast("Draft generated", "Edit it before sending if you'd like.");
    }, 900);
  };

  return (
    <div>
      <PageHeader
        title="Messages"
        description={`${messages.filter((m) => m.status === "Scheduled").length} scheduled · ${messages.filter((m) => m.aiGenerated).length} AI-generated this period`}
        actions={
          <Button onClick={() => setComposeOpen(true)}>
            <Plus className="h-4 w-4" /> Compose
          </Button>
        }
      />

      <Tabs defaultValue="All">
        <TabsList className="mb-5 flex-wrap">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t}
              <span className="ml-1.5 text-ink-muted">{filtered(t).length}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => (
          <TabsContent key={t} value={t} className="space-y-3.5 focus-visible:outline-none">
            {filtered(t).length ? (
              filtered(t).map((m) => (
                <MessageCard
                  key={m.id}
                  m={m}
                  onEdit={(msg) => {
                    setEditing(msg);
                    setDraft(msg.preview);
                  }}
                />
              ))
            ) : (
              <Card className="p-6">
                <EmptyState
                  title={`No ${t.toLowerCase()} messages`}
                  description="Messages ChaseAI drafts or schedules will appear here."
                  action={<Button onClick={() => setComposeOpen(true)}>Compose a message</Button>}
                />
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit message</DialogTitle>
            <DialogDescription>
              {editing?.channel} to {editing?.client} — {editing?.subject}
            </DialogDescription>
          </DialogHeader>
          <Textarea rows={9} value={draft} onChange={(e) => setDraft(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast("Draft saved", `${editing?.client} message updated.`);
                setEditing(null);
              }}
            >
              Save draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compose dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compose message</DialogTitle>
            <DialogDescription>Write it yourself, or let ChaseAI draft it for you.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Client</Label>
                <Select value={composeClient} onChange={(e) => setComposeClient(e.target.value)}>
                  {clients.map((c) => (
                    <option key={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Channel</Label>
                <Select
                  value={composeChannel}
                  onChange={(e) => setComposeChannel(e.target.value as "Email" | "SMS")}
                >
                  <option>Email</option>
                  <option>SMS</option>
                </Select>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>Message</Label>
                <Button size="sm" variant="ghost" onClick={generate} disabled={generating}>
                  <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                  {generating ? "Generating…" : "Generate with AI"}
                </Button>
              </div>
              <Textarea
                rows={8}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Write your message, or generate a draft…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!composeBody.trim()}
              onClick={() => {
                addMessage({
                  id: `m${Date.now()}`,
                  client: composeClient,
                  channel: composeChannel,
                  aiGenerated: false,
                  subject: "Follow-up from Northstar Bookkeeping",
                  preview: composeBody,
                  sentAt: "Just now",
                  status: "Sent",
                });
                setComposeOpen(false);
                setComposeBody("");
                toast(`Sent to ${composeClient}`);
              }}
            >
              <Send className="h-4 w-4" /> Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

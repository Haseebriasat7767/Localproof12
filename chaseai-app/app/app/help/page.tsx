"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, LifeBuoy, MessagesSquare, PlayCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from "@/components/ui/primitives";
import { PageHeader } from "@/components/app/shared";
import { useStore } from "@/components/app/store";
import { FAQS } from "@/data/mock";

const RESOURCES = [
  {
    icon: PlayCircle,
    title: "Getting started",
    body: "Import clients, pick a workflow template and switch the chaser on.",
    href: "/app/clients",
  },
  {
    icon: BookOpen,
    title: "Automation recipes",
    body: "Reminder cadences that work for monthly, quarterly and messy clients.",
    href: "/app/automations",
  },
  {
    icon: MessagesSquare,
    title: "Writing better chasers",
    body: "How tone and specificity change client response rates.",
    href: "/app/messages",
  },
];

export default function HelpPage() {
  const { toast } = useStore();
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");

  return (
    <div>
      <PageHeader
        title="Help"
        description="Guides, answers and a direct line to the ChaseAI team."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {RESOURCES.map((r) => (
          <Link
            key={r.title}
            href={r.href}
            className="card group p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift focus-ring"
          >
            <span className="inline-flex rounded-lg bg-teal-50 p-2.5 text-teal-600 transition-colors group-hover:bg-teal-500 group-hover:text-white">
              <r.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-ink">{r.title}</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{r.body}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Frequently asked questions</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <Accordion type="single" collapsible>
              {FAQS.map((f, i) => (
                <AccordionItem key={f.q} value={`h-${i}`}>
                  <AccordionTrigger className="text-[14px]">{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="pb-2">
            <div>
              <CardTitle>Contact support</CardTitle>
              <p className="mt-1 text-[13px] text-ink-soft">
                Typical first reply: under 2 hours on weekdays.
              </p>
            </div>
            <span className="rounded-lg bg-canvas p-2 text-ink-muted">
              <LifeBuoy className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                toast("Message sent", "Support will reply to rachel@northstarbooks.com.");
                setSubject("");
                setBody("");
              }}
            >
              <div>
                <Label>Subject</Label>
                <Input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Question about SMS reminders"
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  required
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Tell us what you're trying to do…"
                />
              </div>
              <Button type="submit" className="w-full">
                <Send className="h-4 w-4" /> Send message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

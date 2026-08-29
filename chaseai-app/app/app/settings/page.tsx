"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CreditCard, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@/components/ui/primitives";
import { Avatar, PageHeader } from "@/components/app/shared";
import { useStore } from "@/components/app/store";

function Section({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <p className="mt-1 text-[13px] text-ink-soft">{description}</p>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">{children}</CardContent>
      {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
    </Card>
  );
}

function ToggleRow({
  label,
  description,
  defaultChecked = true,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = React.useState(defaultChecked);
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3.5">
      <div>
        <p className="text-[13.5px] font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-[12.5px] text-ink-soft">{description}</p>
      </div>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}

export default function SettingsPage() {
  const { toast } = useStore();

  return (
    <div>
      <PageHeader title="Settings" description="Manage your profile, firm, notifications and security." />

      <Tabs defaultValue="profile">
        <TabsList className="mb-5 flex-wrap">
          {["profile", "firm", "notifications", "security", "billing"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="focus-visible:outline-none">
          <Section
            title="Profile"
            description="How you appear to your team and in client-facing messages."
            footer={
              <div className="flex justify-end">
                <Button onClick={() => toast("Profile saved")}>Save changes</Button>
              </div>
            }
          >
            <div className="flex items-center gap-4">
              <Avatar name="Rachel Kim" size="lg" />
              <Button variant="outline" onClick={() => toast("Avatar upload is disabled in the demo")}>
                Change photo
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Full name</Label>
                <Input defaultValue="Rachel Kim" />
              </div>
              <div>
                <Label>Email</Label>
                <Input defaultValue="rachel@northstarbooks.com" type="email" />
              </div>
              <div>
                <Label>Job title</Label>
                <Input defaultValue="Managing Partner" />
              </div>
              <div>
                <Label>Time zone</Label>
                <Select defaultValue="America/Los_Angeles">
                  <option>America/Los_Angeles</option>
                  <option>America/Denver</option>
                  <option>America/Chicago</option>
                  <option>America/New_York</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Email signature</Label>
              <Textarea rows={3} defaultValue={"Rachel Kim\nNorthstar Bookkeeping\n(415) 555-0110"} />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="firm" className="focus-visible:outline-none">
          <Section
            title="Firm"
            description="Branding your clients see in emails and on the client portal."
            footer={
              <div className="flex justify-end">
                <Button onClick={() => toast("Firm settings saved")}>Save changes</Button>
              </div>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Firm name</Label>
                <Input defaultValue="Northstar Bookkeeping" />
              </div>
              <div>
                <Label>Portal display name</Label>
                <Input defaultValue="ABC Accounting" />
              </div>
              <div>
                <Label>Reply-to address</Label>
                <Input defaultValue="close@northstarbooks.com" />
              </div>
              <div>
                <Label>Default close frequency</Label>
                <Select defaultValue="Monthly">
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Weekly</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Client-facing tone</Label>
              <Select defaultValue="Warm and professional">
                <option>Warm and professional</option>
                <option>Direct and brief</option>
                <option>Formal</option>
              </Select>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-5 focus-visible:outline-none">
          <Section title="Email notifications" description="What lands in your inbox.">
            <ToggleRow label="Client uploads a document" description="Get notified as soon as a checklist item is satisfied." />
            <ToggleRow label="Daily close digest" description="A morning summary of what's outstanding across your clients." />
            <ToggleRow label="Escalations" description="When a client passes your escalation threshold." />
          </Section>
          <Section title="SMS notifications" description="Text alerts for time-critical events.">
            <ToggleRow label="Overdue escalations" description="Text the account owner when a client goes 7+ days silent." defaultChecked={false} />
            <ToggleRow label="Client replies by SMS" description="Forward inbound client texts to your mobile." />
          </Section>
          <Section title="AI notifications" description="How ChaseAI checks in with you.">
            <ToggleRow label="Draft ready for review" description="Notify me when a batch of AI reminders is ready to approve." />
            <ToggleRow label="Weekly AI insights" description="Patterns ChaseAI noticed across your client base." />
            <ToggleRow label="Auto-send without review" description="Let ChaseAI send drafted reminders without approval." defaultChecked={false} />
          </Section>
        </TabsContent>

        <TabsContent value="security" className="focus-visible:outline-none">
          <Section
            title="Security"
            description="Access controls for your workspace."
            footer={
              <div className="flex justify-end">
                <Button onClick={() => toast("Security settings saved")}>Save changes</Button>
              </div>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Current password</Label>
                <Input type="password" defaultValue="demo-password" />
              </div>
              <div>
                <Label>New password</Label>
                <Input type="password" placeholder="••••••••••" />
              </div>
            </div>
            <ToggleRow label="Two-factor authentication" description="Require a one-time code on every new sign-in." />
            <ToggleRow label="Portal link expiry" description="Client upload links expire after 14 days." />
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" onClick={() => toast("Active sessions revoked")}>
                <KeyRound className="h-4 w-4" /> Sign out other sessions
              </Button>
              <Button variant="outline" onClick={() => toast("Audit log export queued")}>
                <ShieldCheck className="h-4 w-4" /> Export audit log
              </Button>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="billing" className="focus-visible:outline-none">
          <Section title="Billing" description="Your plan, usage and invoices live on the billing page.">
            <div className="flex flex-col items-start gap-4 rounded-lg border border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-[15px] font-semibold text-ink">
                  <Sparkles className="h-4 w-4 text-teal-500" /> Professional — $249/mo
                </p>
                <p className="mt-1 text-[13px] text-ink-soft">32 of 50 client seats in use</p>
              </div>
              <Button asChild>
                <Link href="/app/billing">
                  <CreditCard className="h-4 w-4" /> Go to billing <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

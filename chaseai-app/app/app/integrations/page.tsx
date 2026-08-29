"use client";

import * as React from "react";
import {
  Bell,
  Check,
  CreditCard,
  Mail,
  MessageSquare,
  BookOpen,
  Calculator,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/primitives";
import { ConfirmDialog, PageHeader, StatusBadge } from "@/components/app/shared";
import { useStore } from "@/components/app/store";

const ICONS: Record<string, React.ElementType> = {
  quickbooks: Calculator,
  xero: BookOpen,
  gmail: Mail,
  outlook: Mail,
  stripe: CreditCard,
  twilio: MessageSquare,
  slack: Bell,
};

export default function IntegrationsPage() {
  const { integrations, toggleIntegration, toast } = useStore();
  const [disconnecting, setDisconnecting] = React.useState<string | null>(null);

  const target = integrations.find((i) => i.id === disconnecting);

  return (
    <div>
      <PageHeader
        title="Integrations"
        description={`${integrations.filter((i) => i.connected).length} of ${integrations.length} connected`}
      />

      <div className="mb-5 flex items-start gap-3 rounded-xl border border-border bg-white p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
        <p className="text-[13px] leading-relaxed text-ink-soft">
          This is a demo workspace — connection states are simulated locally and no external
          service is contacted. Connecting or disconnecting only updates what you see here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {integrations.map((i) => {
          const Icon = ICONS[i.id] ?? Check;
          return (
            <Card key={i.id} className="flex flex-col transition-shadow hover:shadow-lift">
              <CardContent className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-lg bg-canvas p-2.5 text-ink-soft">
                    <Icon className="h-5 w-5" />
                  </span>
                  {i.connected ? (
                    <StatusBadge tone="complete">Connected</StatusBadge>
                  ) : (
                    <StatusBadge tone="neutral">Not connected</StatusBadge>
                  )}
                </div>
                <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-ink">{i.name}</h3>
                <p className="mt-0.5 text-[12px] font-medium uppercase tracking-wider text-ink-muted">
                  {i.category}
                </p>
                <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-ink-soft">
                  {i.description}
                </p>
                <Button
                  className="mt-5 w-full"
                  variant={i.connected ? "outline" : "default"}
                  onClick={() => {
                    if (i.connected) setDisconnecting(i.id);
                    else {
                      toggleIntegration(i.id);
                      toast(`${i.name} connected`, "Demo connection — no data was exchanged.");
                    }
                  }}
                >
                  {i.connected ? "Disconnect" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog
        open={!!disconnecting}
        onOpenChange={(v) => !v && setDisconnecting(null)}
        title={`Disconnect ${target?.name}?`}
        description="Any automations relying on this integration will pause until it is reconnected."
        confirmLabel="Disconnect"
        onConfirm={() => {
          if (target) {
            toggleIntegration(target.id);
            toast(`${target.name} disconnected`);
          }
        }}
      />
    </div>
  );
}

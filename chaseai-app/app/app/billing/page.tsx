"use client";

import * as React from "react";
import { Check, CreditCard, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Progress } from "@/components/ui/primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader, StatusBadge } from "@/components/app/shared";
import { useStore } from "@/components/app/store";
import { PLANS } from "@/data/mock";
import { cn } from "@/lib/utils";

const CURRENT = "Professional";

const INVOICES = [
  { id: "INV-2025-07", date: "Jul 1, 2025", amount: "$249.00", status: "Paid" },
  { id: "INV-2025-06", date: "Jun 1, 2025", amount: "$249.00", status: "Paid" },
  { id: "INV-2025-05", date: "May 1, 2025", amount: "$249.00", status: "Paid" },
  { id: "INV-2025-04", date: "Apr 1, 2025", amount: "$79.00", status: "Paid" },
];

export default function BillingPage() {
  const { toast } = useStore();
  const [upgrade, setUpgrade] = React.useState<string | null>(null);
  const current = PLANS.find((p) => p.name === CURRENT)!;

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Your plan, seat usage and invoices."
        actions={
          <Button
            variant="outline"
            onClick={() => toast("Billing portal", "Demo mode — no payment provider is connected.")}
          >
            <CreditCard className="h-4 w-4" /> Manage Billing
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader className="pb-2">
            <div>
              <CardTitle>Current plan</CardTitle>
              <p className="mt-1 text-[13px] text-ink-soft">Renews Aug 1, 2025</p>
            </div>
            <StatusBadge tone="complete">Active</StatusBadge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[24px] font-semibold tracking-tight text-ink">
                {current.name}
              </span>
              <span className="text-[16px] text-ink-soft">${current.price}/mo</span>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[13px]">
                <span className="text-ink-soft">Client seats used</span>
                <span className="font-medium text-ink">32 of 50</span>
              </div>
              <Progress value={64} />
              <p className="mt-2 text-[12.5px] text-ink-muted">
                18 seats remaining · upgrade to Agency for 150 clients
              </p>
            </div>

            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {current.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => setUpgrade("Agency")}>
                <Sparkles className="h-4 w-4" /> Upgrade plan
              </Button>
              <Button
                variant="outline"
                onClick={() => toast("Billing portal", "Demo mode — no payment provider is connected.")}
              >
                Manage Billing
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="divide-y divide-border">
              {INVOICES.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                  <div>
                    <p className="text-[13.5px] font-medium text-ink">{inv.id}</p>
                    <p className="text-[12px] text-ink-muted">
                      {inv.date} · {inv.amount}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Download ${inv.id}`}
                    onClick={() => toast(`${inv.id} download`, "Demo invoice — nothing was downloaded.")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-[18px] font-semibold tracking-tight text-ink">All plans</h2>
        <p className="mt-1 text-[13.5px] text-ink-soft">
          Change plan at any time — seats are prorated to your billing date.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((p) => {
            const isCurrent = p.name === CURRENT;
            return (
              <div
                key={p.name}
                className={cn(
                  "flex flex-col rounded-xl border bg-white p-5 shadow-card transition-shadow hover:shadow-lift",
                  isCurrent ? "border-teal-500" : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold tracking-tight text-ink">{p.name}</h3>
                  {isCurrent && <StatusBadge tone="complete">Current</StatusBadge>}
                </div>
                <p className="mt-1 text-[12.5px] text-ink-soft">{p.clients}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  {p.price === null ? (
                    <span className="text-[24px] font-semibold tracking-tight text-ink">Custom</span>
                  ) : (
                    <>
                      <span className="text-[28px] font-semibold tracking-tight text-ink">
                        ${p.price}
                      </span>
                      <span className="text-[13px] text-ink-soft">/mo</span>
                    </>
                  )}
                </div>
                <ul className="mt-4 flex-1 space-y-2">
                  {p.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-ink-soft">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-500" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-5 w-full"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent}
                  onClick={() => setUpgrade(p.name)}
                >
                  {isCurrent ? "Current plan" : p.price === null ? "Contact sales" : "Switch plan"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!upgrade} onOpenChange={(v) => !v && setUpgrade(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Switch to {upgrade}?</DialogTitle>
            <DialogDescription>
              This is a demo workspace — no payment provider is connected and nothing will be
              charged.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgrade(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast(`Plan change to ${upgrade} requested`, "Demo only — plan unchanged.");
                setUpgrade(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

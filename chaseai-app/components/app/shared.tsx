"use client";

import * as React from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Inbox, Loader2 } from "lucide-react";
import { cn, avatarTone, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ---------------- StatusBadge ---------------- */
export type StatusTone =
  | "complete"
  | "waiting"
  | "attention"
  | "overdue"
  | "neutral"
  | "info"
  | "answered"
  | "pending";

const TONES: Record<StatusTone, string> = {
  complete: "bg-teal-50 text-teal-700 ring-teal-500/20",
  answered: "bg-teal-50 text-teal-700 ring-teal-500/20",
  waiting: "bg-amber-50 text-amber-700 ring-amber-500/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-500/20",
  attention: "bg-orange-50 text-orange-700 ring-orange-500/20",
  overdue: "bg-rose-50 text-rose-700 ring-rose-500/20",
  info: "bg-indigo-50 text-indigo-700 ring-indigo-500/20",
  neutral: "bg-slate-100 text-slate-600 ring-slate-400/20",
};

export function StatusBadge({
  tone = "neutral",
  children,
  className,
  dot = true,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset",
        TONES[tone],
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

/* ---------------- Counter ---------------- */
export function Counter({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 900, bounce: 0 });
  const [display, setDisplay] = React.useState("0");

  React.useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  React.useEffect(
    () =>
      spring.on("change", (v) =>
        setDisplay(v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ","))
      ),
    [spring, decimals]
  );

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/* ---------------- KpiCard ---------------- */
export function KpiCard({
  label,
  value,
  suffix,
  decimals,
  delta,
  deltaLabel,
  sub,
  icon: Icon,
  index = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  delta?: number;
  deltaLabel?: string;
  sub?: string;
  icon?: React.ElementType;
  index?: number;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="card group p-5 transition-shadow duration-200 hover:shadow-lift"
    >
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-ink-soft">{label}</p>
        {Icon && (
          <span className="rounded-lg bg-canvas p-2 text-ink-muted transition-colors group-hover:bg-teal-50 group-hover:text-teal-600">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[28px] font-semibold tracking-tight text-ink">
          <Counter value={value} suffix={suffix} decimals={decimals} />
        </span>
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[12px] font-medium",
              positive ? "text-teal-600" : "text-rose-600"
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[12px] text-ink-muted">{sub ?? deltaLabel ?? "vs. last month"}</p>
    </motion.div>
  );
}

/* ---------------- Avatar ---------------- */
export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-[12px]",
    lg: "h-12 w-12 text-[15px]",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizes[size],
        avatarTone(name),
        className
      )}
    >
      {initials(name)}
    </span>
  );
}

/* ---------------- DataTable ---------------- */
export type Column<T> = {
  key: string;
  header: string;
  className?: string;
  cell: (row: T) => React.ReactNode;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  empty,
  loading,
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: React.ReactNode;
  loading?: boolean;
}) {
  if (loading) return <TableSkeleton cols={columns.length} />;
  if (!rows.length)
    return (
      <div className="p-10">{empty ?? <EmptyState title="Nothing here yet" />}</div>
    );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "whitespace-nowrap px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted",
                  c.className
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr
              key={row.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: Math.min(i, 12) * 0.02 }}
              className="border-b border-border/70 last:border-0 transition-colors hover:bg-canvas/70"
            >
              {columns.map((c) => (
                <td key={c.key} className={cn("px-5 py-3.5 align-middle", c.className)}>
                  {c.cell(row)}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TableSkeleton({ cols = 5, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-4">
          {Array.from({ length: cols }).map((__, c) => (
            <div
              key={c}
              className="relative h-3.5 flex-1 overflow-hidden rounded bg-slate-100"
            >
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------------- EmptyState ---------------- */
export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="mb-4 rounded-xl bg-canvas p-3 text-ink-muted">
        <Icon className="h-6 w-6" />
      </span>
      <p className="text-[15px] font-medium text-ink">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] text-ink-soft">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------------- ConfirmDialog ---------------- */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  const [busy, setBusy] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              setTimeout(() => {
                onConfirm();
                setBusy(false);
                onOpenChange(false);
              }, 350);
            }}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- PageHeader ---------------- */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

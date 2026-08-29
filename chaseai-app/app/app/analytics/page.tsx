"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock, FileCheck2, FileText, MailCheck, Percent, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Select } from "@/components/ui/primitives";
import { KpiCard, PageHeader } from "@/components/app/shared";
import {
  AUTOMATION_PERFORMANCE,
  COLLECTION_RATE,
  OVERDUE_CLIENTS,
  RESPONSE_TIME,
} from "@/data/mock";

/* Validated categorical palette (dataviz six-checks: all PASS on light surface) */
const C_PRIMARY = "#0D9488";
const C_SECOND = "#4F46E5";
const C_ALERT = "#C2410C";
const GRID = "#E2E8F0";
const AXIS = "#94A3B8";

const axisProps = {
  stroke: AXIS,
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 12, fill: AXIS },
};

function ChartTooltip({
  active,
  payload,
  label,
  unit = "",
}: {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string }[];
  label?: string | number;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lift">
      <p className="text-[12px] font-semibold text-ink">{label}</p>
      <ul className="mt-1 space-y-0.5">
        {payload.map((p, i) => (
          <li key={i} className="flex items-center gap-2 text-[12.5px] text-ink-soft">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: p.color }}
              aria-hidden
            />
            <span>{p.name}</span>
            <span className="ml-auto font-medium text-ink">
              {p.value}
              {unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const legendStyle = { fontSize: 12, color: "#64748B" };

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-[13px] text-ink-soft">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[240px] w-full">{children}</div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = React.useState("Last 6 months");

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="How fast documents come in, and how much of the chasing ChaseAI is doing for you."
        actions={
          <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-48">
            {["Last 3 months", "Last 6 months", "Last 12 months", "Year to date"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Documents Requested" value={342} icon={FileText} delta={11} index={0} />
        <KpiCard label="Documents Received" value={319} icon={FileCheck2} delta={14} index={1} />
        <KpiCard
          label="Collection Rate"
          value={93.3}
          suffix="%"
          decimals={1}
          icon={Percent}
          delta={2.6}
          index={2}
        />
        <KpiCard
          label="Avg Response Time"
          value={2.4}
          suffix=" days"
          decimals={1}
          icon={Clock}
          delta={-17}
          index={3}
        />
        <KpiCard label="Automated Messages" value={327} icon={MailCheck} delta={22} index={4} />
        <KpiCard label="Hours Saved" value={61} suffix="h" icon={Timer} delta={18} index={5} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartCard
          title="Document collection rate"
          description="Share of requested documents received, against your 90% target."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={COLLECTION_RATE} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C_PRIMARY} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={C_PRIMARY} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis domain={[60, 100]} {...axisProps} />
              <Tooltip content={<ChartTooltip unit="%" />} cursor={{ stroke: GRID }} />
              <Legend wrapperStyle={legendStyle} iconType="plainline" />
              <Area
                type="monotone"
                dataKey="rate"
                name="Collection rate"
                stroke={C_PRIMARY}
                strokeWidth={2}
                fill="url(#rateFill)"
                dot={{ r: 3, strokeWidth: 0, fill: C_PRIMARY }}
                activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke={AXIS}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Average client response time"
          description="Days between a request going out and the document arriving."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={RESPONSE_TIME} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis domain={[0, 7]} {...axisProps} />
              <Tooltip content={<ChartTooltip unit=" days" />} cursor={{ stroke: GRID }} />
              <Legend wrapperStyle={legendStyle} iconType="plainline" />
              <Line
                type="monotone"
                dataKey="days"
                name="Response time"
                stroke={C_SECOND}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: C_SECOND }}
                activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Overdue clients"
          description="Clients with at least one document past its due date."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={OVERDUE_CLIENTS} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F1F5F9" }} />
              <Legend wrapperStyle={legendStyle} />
              <Bar dataKey="overdue" name="Overdue clients" radius={[4, 4, 0, 0]} maxBarSize={34}>
                {OVERDUE_CLIENTS.map((d, i) => (
                  <Cell
                    key={d.month}
                    fill={i === OVERDUE_CLIENTS.length - 1 ? C_PRIMARY : C_ALERT}
                    fillOpacity={i === OVERDUE_CLIENTS.length - 1 ? 1 : 0.75}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Automation performance"
          description="Messages sent by channel and how many earned a client response."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={AUTOMATION_PERFORMANCE}
              margin={{ top: 6, right: 8, left: -18, bottom: 0 }}
              barGap={2}
            >
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="channel" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F1F5F9" }} />
              <Legend wrapperStyle={legendStyle} />
              <Bar dataKey="sent" name="Sent" fill={C_SECOND} radius={[4, 4, 0, 0]} maxBarSize={26} />
              <Bar
                dataKey="responded"
                name="Responded"
                fill={C_PRIMARY}
                radius={[4, 4, 0, 0]}
                maxBarSize={26}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="mt-5">
        <CardHeader className="pb-2">
          <CardTitle>Automation performance — data view</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-ink-muted">
                  <th className="py-2 pr-4 font-semibold">Channel</th>
                  <th className="py-2 pr-4 font-semibold">Sent</th>
                  <th className="py-2 pr-4 font-semibold">Responded</th>
                  <th className="py-2 font-semibold">Response rate</th>
                </tr>
              </thead>
              <tbody>
                {AUTOMATION_PERFORMANCE.map((r) => (
                  <tr key={r.channel} className="border-b border-border/70 last:border-0">
                    <td className="py-2.5 pr-4 text-ink">{r.channel}</td>
                    <td className="py-2.5 pr-4 text-ink-soft">{r.sent}</td>
                    <td className="py-2.5 pr-4 text-ink-soft">{r.responded}</td>
                    <td className="py-2.5 font-medium text-ink">
                      {Math.round((r.responded / r.sent) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

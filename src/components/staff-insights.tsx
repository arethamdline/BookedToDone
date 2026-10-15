import { Sparkles, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "./ui/card";
import { money, type Job } from "@/data/mock-data";

/**
 * The owner dashboard's "what happened this week" layer.
 *
 * The dashboard used to be a row of flat counters, which tells an owner
 * nothing they can act on. These read the demo's own job records — no invented
 * figures — and the summary is assembled from those same numbers.
 */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function lastSevenDays(jobs: Job[]) {
  const out = DAYS.map((d) => ({ day: d, jobs: 0, revenue: 0 }));
  const now = new Date();
  jobs.forEach((j) => {
    if (!j.date) return;
    const d = new Date(`${j.date}T00:00:00`);
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff < 0 || diff > 6) return;
    const idx = (d.getDay() + 6) % 7; // Monday-first
    const row = out[idx]!;
    row.jobs += 1;
    row.revenue += j.finalCharge ?? j.quotedAmount ?? j.estimate ?? 0;
  });
  return out;
}

function bySource(jobs: Job[]) {
  const counts = new Map<string, number>();
  jobs.forEach((j) => counts.set(j.source, (counts.get(j.source) ?? 0) + 1));
  return [...counts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

const SOURCE_COLORS = ["#176344", "#0F4A32", "#16A34A", "#94A3B8"];

export function StaffInsights({ jobs }: { jobs: Job[] }) {
  const week = lastSevenDays(jobs);
  const sources = bySource(jobs);

  const weekJobs = week.reduce((s, d) => s + d.jobs, 0);
  const weekRevenue = week.reduce((s, d) => s + d.revenue, 0);
  const unpaid = jobs.filter((j) => j.payment === "Unpaid" && j.status === "Completed");
  const unpaidTotal = unpaid.reduce((s, j) => s + (j.finalCharge ?? j.estimate ?? 0), 0);
  const topSource = sources[0];
  const busiest = [...week].sort((a, b) => b.jobs - a.jobs)[0];

  return (
    <div className="space-y-4">
      {/* AI weekly summary — written from the numbers below, not invented */}
      <Card data-tour="ai-summary" className="overflow-hidden">
        <div className="bd-ai-gradient px-5 py-2">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-white">
            <Sparkles className="size-3.5" /> AI summary · this week
          </p>
        </div>
        <CardContent className="space-y-2 p-5 text-sm">
          <p>
            <strong>{weekJobs}</strong> job{weekJobs === 1 ? "" : "s"} booked this week, worth{" "}
            <strong>{money(weekRevenue)}</strong>.
            {busiest && busiest.jobs > 0 && (
              <>
                {" "}
                <strong>{busiest.day}</strong> was your busiest day.
              </>
            )}
          </p>
          {topSource && (
            <p className="text-muted-foreground">
              Most work came in through <strong>{topSource.source}</strong> ({topSource.count} of{" "}
              {jobs.length}).
            </p>
          )}
          <p
            className={unpaid.length ? "font-medium text-warning-strong" : "text-muted-foreground"}
          >
            {unpaid.length
              ? `${unpaid.length} completed job${unpaid.length === 1 ? "" : "s"} still unpaid — ${money(unpaidTotal)} outstanding.`
              : "Nothing completed is sitting unpaid."}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <TrendingUp className="size-4 text-primary" /> Booked value, last 7 days
            </p>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={week} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bdRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#176344" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#176344" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} width={48} />
                  <Tooltip
                    formatter={(v: number) => money(v)}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#176344"
                    strokeWidth={2}
                    fill="url(#bdRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold">Where the jobs came from</p>
            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sources}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 8, bottom: 0 }}
                >
                  <CartesianGrid stroke="#E2E8F0" horizontal={false} />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="source"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    width={64}
                  />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {sources.map((_, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

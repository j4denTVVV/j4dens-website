import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ExternalLink, Plus } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchAll } from "@/lib/api";
import { ANALYTICS_PLATFORMS, formatNumber } from "@/lib/hub";
import {
  RANGES, avgOrNull, inRange, latestFollowers, maxOrNull, pctChange, rangeStart, sumOrNull,
  type Entry, type RangeKey,
} from "@/lib/analytics";
import { PageHeader } from "@/components/hub/common";
import { AnalyticsDialog } from "@/components/hub/dialogs";
import { PlatformLogo } from "@/components/hub/platforms";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — J4DENTV Creator HQ" },
      { name: "description", content: "See how J4denTV is performing across Twitch, YouTube, TikTok, Instagram and Facebook." },
      { property: "og:title", content: "Analytics — J4DENTV Creator HQ" },
      { property: "og:description", content: "See how J4denTV is performing." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnalyticsPage,
});

type Tab = "All" | (typeof ANALYTICS_PLATFORMS)[number];
const NA = "DATA NOT AVAILABLE";

const PLATFORM_METRICS: Record<Exclude<Tab, "All">, Array<[string, (r: Entry[]) => number | null]>> = {
  Twitch: [
    ["Followers", latestFollowers], ["Follower Growth", (r) => sumOrNull(r, "followers_gained")],
    ["Average Viewers", (r) => avgOrNull(r, "avg_viewers")], ["Peak Viewers", (r) => maxOrNull(r, "avg_viewers")],
    ["Streams Completed", (r) => sumOrNull(r, "posts")], ["Watch Hours", (r) => sumOrNull(r, "watch_time")],
  ],
  YouTube: [
    ["Subscribers", latestFollowers], ["Subscribers Gained", (r) => sumOrNull(r, "subs_gained") ?? sumOrNull(r, "followers_gained")],
    ["Views", (r) => sumOrNull(r, "views")], ["Watch Time", (r) => sumOrNull(r, "watch_time")],
    ["Videos Uploaded", (r) => sumOrNull(r, "posts")],
    ["Average Views", (r) => { const v = sumOrNull(r, "views"), p = sumOrNull(r, "posts"); return v != null && p ? Math.round(v / p) : null; }],
  ],
  TikTok: [
    ["Followers", latestFollowers], ["Views", (r) => sumOrNull(r, "views")], ["Likes", (r) => sumOrNull(r, "likes")],
    ["Comments", (r) => sumOrNull(r, "comments")], ["Shares", (r) => sumOrNull(r, "shares")],
    ["Posts", (r) => sumOrNull(r, "posts")], ["Follower Growth", (r) => sumOrNull(r, "followers_gained")],
  ],
  Instagram: [
    ["Followers", latestFollowers], ["Views / Reach", (r) => sumOrNull(r, "views")], ["Likes", (r) => sumOrNull(r, "likes")],
    ["Comments", (r) => sumOrNull(r, "comments")], ["Shares", (r) => sumOrNull(r, "shares")],
    ["Posts", (r) => sumOrNull(r, "posts")], ["Follower Growth", (r) => sumOrNull(r, "followers_gained")],
  ],
  Facebook: [
    ["Followers", latestFollowers], ["Views", (r) => sumOrNull(r, "views")], ["Posts", (r) => sumOrNull(r, "posts")],
  ],
};

function Metric({ label, value, big }: { label: string; value: number | null; big?: boolean }) {
  return (
    <div className={`${big ? "card-secondary" : "card-minimal"} lift p-5`}>
      <p className="eyebrow">{label}</p>
      {value == null ? (
        <p className="mt-3 text-[0.65rem] font-semibold tracking-[0.22em] text-muted-foreground">{NA}</p>
      ) : (
        <p className="section-title mt-2 text-4xl">{formatNumber(value)}</p>
      )}
    </div>
  );
}

function ChartCard({ title, data, dataKey, kind }: { title: string; data: any[]; dataKey: string; kind: "area" | "bar" }) {
  const has = data.some((d) => typeof d[dataKey] === "number");
  return (
    <div className="card-secondary p-5">
      <h3 className="section-title text-2xl">{title}</h3>
      {has ? (
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            {kind === "area" ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey={dataKey} stroke="var(--foreground)" strokeWidth={2} fill={`url(#g-${dataKey})`} animationDuration={900} connectNulls />
              </AreaChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey={dataKey} fill="var(--foreground)" radius={[6, 6, 0, 0]} animationDuration={900} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-6 text-[0.65rem] font-semibold tracking-[0.22em] text-muted-foreground">{NA}</p>
      )}
    </div>
  );
}

function AnalyticsPage() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("All");
  const [range, setRange] = useState<RangeKey>("30d");
  const { data: rows = [] } = useQuery({
    queryKey: ["analytics_entries"],
    queryFn: () => fetchAll<Entry>("analytics_entries", { orderBy: "period_start", ascending: true }),
  });
  const { data: streams = [] } = useQuery({ queryKey: ["streams"], queryFn: () => fetchAll("streams") });
  const { data: videos = [] } = useQuery({ queryKey: ["youtube_videos"], queryFn: () => fetchAll("youtube_videos") });

  const platformRows = rows.filter((r) => tab === "All" || r.platform === tab);
  const list = inRange(platformRows, range);

  const chartData = useMemo(() => {
    const by = new Map<string, any>();
    list.forEach((r) => {
      const cur = by.get(r.period_start) ?? { label: new Date(r.period_start).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) };
      cur.views = (cur.views ?? 0) + (r.views ?? 0);
      cur.followers = (cur.followers ?? 0) + (r.followers_gained ?? 0);
      if (r.avg_viewers != null) cur.live = Math.max(cur.live ?? 0, r.avg_viewers);
      by.set(r.period_start, cur);
    });
    return [...by.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  }, [list]);

  // Improvement hints built only from saved data.
  const hints = useMemo(() => {
    const out: string[] = [];
    const today = new Date();
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
    const twoWeeks = new Date(today); twoWeeks.setDate(today.getDate() - 14);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const done = streams.filter((s: any) => s.status === "Live Completed" && s.stream_date);
    const thisWeek = done.filter((s: any) => s.stream_date >= iso(weekAgo)).length;
    const lastWeek = done.filter((s: any) => s.stream_date >= iso(twoWeeks) && s.stream_date < iso(weekAgo)).length;
    if (thisWeek || lastWeek) out.push(`You streamed ${thisWeek} time${thisWeek === 1 ? "" : "s"} this week compared with ${lastWeek} last week.`);
    const tw = rows.filter((r) => r.platform === "Twitch" && r.avg_viewers != null).sort((a, b) => a.period_start.localeCompare(b.period_start));
    if (tw.length >= 2) {
      const ch = pctChange(tw.at(-1)!.avg_viewers, tw.at(-2)!.avg_viewers);
      if (ch != null) out.push(`Twitch average viewers ${ch >= 0 ? "increased" : "dropped"} ${Math.abs(ch)}% since your last entry.`);
    }
    const m = new Date().toISOString().slice(0, 7);
    const prevM = new Date(today.getFullYear(), today.getMonth() - 1, 15).toISOString().slice(0, 7);
    const up = (k: string) => videos.filter((v: any) => v.status === "Uploaded" && String(v.actual_upload_date ?? v.planned_upload_date ?? "").startsWith(k)).length;
    if (up(prevM) > up(m)) out.push(`YouTube uploads are down this month (${up(m)} vs ${up(prevM)} last month).`);
    return out.slice(0, 3);
  }, [rows, streams, videos]);

  const all = list;
  const top: Array<[string, number | null]> = [
    ["Views", sumOrNull(all, "views")],
    ["Followers Gained", sumOrNull(all, "followers_gained")],
    ["Average Live Viewers", avgOrNull(all, "avg_viewers")],
    ["Peak Viewers", maxOrNull(all, "avg_viewers")],
    ["Content Posted", sumOrNull(all, "posts")],
  ];

  return (
    <div className="animate-page space-y-8">
      <PageHeader
        title="Analytics"
        subtitle="See how J4denTV is performing."
        action={<Button variant="outline" onClick={() => setOpen(true)}><Plus /> LOG NUMBERS</Button>}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Platform">
          {(["All", ...ANALYTICS_PLATFORMS] as Tab[]).map((p) => (
            <button key={p} role="tab" aria-selected={tab === p} aria-label={p} onClick={() => setTab(p)}
              className={`flex h-12 min-w-12 items-center justify-center gap-2 rounded-full border px-4 text-[0.65rem] font-semibold tracking-[0.2em] transition ${tab === p ? "border-foreground bg-foreground/10" : "border-border text-muted-foreground hover:border-foreground/40"}`}>
              {p === "All" ? "ALL" : <PlatformLogo p={p} size={20} />}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 rounded-full border border-border p-1">
          {RANGES.map((r) => (
            <button key={r.key} onClick={() => setRange(r.key)}
              className={`rounded-full px-3 py-1.5 text-[0.62rem] font-semibold tracking-[0.18em] transition ${range === r.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div key={`${tab}-${range}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {top.map(([l, v], i) => <Metric key={l} label={l} value={v} big={i < 2} />)}
        </div>

        {tab !== "All" ? (
          <section>
            <h2 className="section-title mb-4 flex items-center gap-3 text-3xl"><PlatformLogo p={tab} size={22} /> {tab.toUpperCase()} INSIGHTS</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PLATFORM_METRICS[tab].map(([l, fn]) => <Metric key={l} label={l} value={fn(list)} />)}
            </div>
          </section>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <ChartCard title="Views Over Time" data={chartData} dataKey="views" kind="area" />
          <ChartCard title="Follower Growth" data={chartData} dataKey="followers" kind="bar" />
          <ChartCard title="Live Performance" data={chartData} dataKey="live" kind="area" />
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card-primary p-6 lg:col-span-1">
          <h2 className="section-title text-3xl">What To Improve</h2>
          {hints.length ? (
            <ul className="mt-4 space-y-2">{hints.map((h) => <li key={h} className="card-minimal p-4 text-sm">{h}</li>)}</ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Not enough saved activity yet to compare.</p>
          )}
        </section>
        <section className="card-secondary flex flex-col gap-3 p-6">
          <p className="eyebrow">METRICOOL · NOT CONNECTED</p>
          <h2 className="section-title text-3xl">Detailed analytics available in Metricool</h2>
          <Button asChild className="mt-auto self-start"><a href="https://app.metricool.com" target="_blank" rel="noreferrer">OPEN METRICOOL <ExternalLink /></a></Button>
        </section>
        <section className="card-secondary flex flex-col gap-3 p-6">
          <p className="eyebrow flex items-center gap-2"><PlatformLogo p="Twitch" /> STREAMCHARTS · LINK ONLY</p>
          <h2 className="section-title text-3xl">Twitch stats on StreamCharts</h2>
          <div className="mt-auto flex flex-wrap gap-2">
            <Button asChild><a href="https://streamscharts.com/channels/j4dentv" target="_blank" rel="noreferrer">VIEW J4DENTV <ExternalLink /></a></Button>
            <Button asChild variant="outline"><a href="https://streamscharts.com" target="_blank" rel="noreferrer">OPEN STREAMCHARTS</a></Button>
          </div>
        </section>
      </div>
      <p className="text-xs text-muted-foreground">
        Numbers come from what you log here (since {rangeStart(range).toLocaleDateString("en-GB")}). Platform accounts aren't connected yet, so nothing syncs automatically.
      </p>
      {open ? <AnalyticsDialog open onOpenChange={() => setOpen(false)} /> : null}
    </div>
  );
}

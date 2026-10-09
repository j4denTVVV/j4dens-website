import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ExternalLink } from "lucide-react";
import { fetchAll, fetchSettings } from "@/lib/api";
import { formatNumber, percentChange } from "@/lib/hub";
import { Delta } from "@/components/hub/common";
import { QuickAdd } from "@/components/hub/AppShell";
import { CountUp, GoldBar, ProfileAvatar, Rise, Stagger, countdown } from "@/components/hub/studio";
import { TYPE_META } from "@/components/hub/LiveCard";
import { PlatformLogo } from "@/components/hub/platforms";
import { Button } from "@/components/ui/button";
import { SubGoalsCompact } from "@/components/hub/SubGoals";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview — J4denTV Creator Hub" },
      { name: "description", content: "What's next, Road to 1K, live insights and this month's progress." },
      { property: "og:title", content: "Overview — J4denTV Creator Hub" },
      { property: "og:description", content: "What's next, Road to 1K, live insights and this month's progress." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Overview,
});

const DEADLINE = new Date("2026-12-31T23:59:59");
const ROAD_TARGET = 1000;

function inMonth(value: string | null | undefined, offset: number) {
  if (!value) return false;
  const now = new Date();
  const t = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const d = new Date(value);
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth();
}

function toDate(date?: string | null, time?: string | null) {
  if (!date) return null;
  const d = new Date(`${date}T${time && /^\d{1,2}:\d{2}/.test(time) ? time.slice(0, 5) : "12:00"}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const SHORTCUTS = [
  { name: "Notion", url: "https://www.notion.so" },
  { name: "Metricool", url: "https://app.metricool.com" },
  { name: "StreamCharts", url: "https://streamscharts.com/channels/j4dentv" },
  { name: "StreamElements", url: "https://streamelements.com/dashboard" },
];

function Overview() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: videos = [] } = useQuery({ queryKey: ["youtube_videos"], queryFn: () => fetchAll("youtube_videos") });
  const { data: streams = [] } = useQuery({ queryKey: ["streams"], queryFn: () => fetchAll("streams") });
  const { data: items = [] } = useQuery({ queryKey: ["hub_items"], queryFn: () => fetchAll("hub_items") });
  const { data: ideas = [] } = useQuery({ queryKey: ["ideas"], queryFn: () => fetchAll("ideas") });
  const { data: analytics = [] } = useQuery({ queryKey: ["analytics_entries"], queryFn: () => fetchAll("analytics_entries") });

  const next = useMemo(() => {
    const list = [
      ...streams.filter((s: any) => s.status !== "Cancelled").map((s: any) => ({ kind: "stream" as const, title: s.title, at: toDate(s.stream_date, s.stream_time) })),
      ...items.filter((i: any) => ["challenge", "marathon", "subathon", "irl", "collab"].includes(i.kind)).map((i: any) => ({ kind: i.kind as keyof typeof TYPE_META, title: i.title, at: toDate(i.start_date, i.start_time) })),
      ...videos.map((v: any) => ({ kind: "stream" as const, title: `Upload: ${v.working_title}`, at: toDate(v.planned_upload_date, null) })),
    ].filter((x) => x.at && x.at.getTime() > Date.now() - 3600_000);
    return list.sort((a, b) => a.at!.getTime() - b.at!.getTime())[0] ?? null;
  }, [streams, items, videos]);

  // Latest follower count per platform from your saved analytics
  const latestByPlatform = useMemo(() => {
    const map = new Map<string, any>();
    [...analytics].sort((a: any, b: any) => String(a.period_start).localeCompare(String(b.period_start))).forEach((a: any) => map.set(a.platform, a));
    return map;
  }, [analytics]);
  const followerTotal = [...latestByPlatform.values()].reduce((acc, a) => acc + (Number(a.followers_end) || 0), 0);
  const hasFollowers = [...latestByPlatform.values()].some((a) => a.followers_end != null);
  const daysLeft = Math.max(0, Math.ceil((DEADLINE.getTime() - now.getTime()) / 86400000));
  const pct = Math.min(100, Math.round((followerTotal / ROAD_TARGET) * 100));

  const platforms = [...latestByPlatform.keys()];
  const [tab, setTab] = useState<string | null>(null);
  const activePlatform = tab ?? platforms[0] ?? null;
  const insight = activePlatform ? latestByPlatform.get(activePlatform) : null;

  const monthly = analytics.filter((a: any) => a.period === "monthly");
  const sum = (o: number, k: string) => monthly.filter((a: any) => inMonth(a.period_start, o)).reduce((acc: number, a: any) => acc + (Number(a[k]) || 0), 0);
  const month = [
    { label: "Videos", a: videos.filter((v: any) => inMonth(v.actual_upload_date, 0)).length, b: videos.filter((v: any) => inMonth(v.actual_upload_date, -1)).length },
    { label: "Streams", a: streams.filter((s: any) => s.status === "Live Completed" && inMonth(s.stream_date, 0)).length, b: streams.filter((s: any) => s.status === "Live Completed" && inMonth(s.stream_date, -1)).length },
    { label: "Posts", a: sum(0, "posts"), b: sum(-1, "posts") },
    { label: "Views", a: sum(0, "views"), b: sum(-1, "views") },
  ];

  const tips: string[] = [];
  if (!monthly.some((a: any) => inMonth(a.period_start, 0))) tips.push("Log this month's analytics so the Hub can track your growth.");
  if (month[1]!.a < (settings?.target_streams ?? 8) / 2) tips.push(`You've completed ${month[1]!.a} of ${settings?.target_streams ?? 8} streams this month — plan your next few in the Live Planner.`);
  if (month[0]!.a === 0) tips.push("No YouTube uploads yet this month — pick a video from your board to finish.");
  if (ideas.filter((i: any) => i.status === "Unused").length > 10) tips.push("You have lots of unused ideas — turn one into a plan this week.");
  if (!next) tips.push("Nothing is scheduled — add a date to your next plan so you have a countdown.");

  return (
    <div className="space-y-6">
      <Rise>
        <section className="card-primary grain relative overflow-hidden rounded-3xl p-6 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <ProfileAvatar size={88} />
              <div>
                <p className="eyebrow text-xs uppercase tracking-[0.3em] text-muted-foreground">Creator HQ</p>
                <h1 className="section-title text-shine text-5xl leading-none sm:text-7xl">
                  WELCOME BACK, {(settings?.greeting_name ?? "Jaden").toUpperCase()}.
                </h1>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild size="lg"><Link to="/live">PLAN CONTENT <ArrowRight className="size-4" /></Link></Button>
                  <Button asChild size="lg" variant="outline"><Link to="/analytics">VIEW ANALYTICS</Link></Button>
                </div>
              </div>
            </div>
            <div className="card-secondary min-w-64 rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Next up</p>
              {next ? (
                <>
                  <p className="mt-2 font-medium">{TYPE_META[next.kind]?.label ?? "Plan"} · {next.title}</p>
                  <p className="section-title mt-1 text-4xl">{countdown(next.at!, now)}</p>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Nothing scheduled yet.</p>
              )}
            </div>
          </div>
        </section>
      </Rise>

      <Stagger className="grid gap-6 lg:grid-cols-3">
        <section className="card-primary rounded-3xl p-6 lg:col-span-2">
          <div className="flex items-end justify-between">
            <h2 className="section-title text-4xl">ROAD TO 1K</h2>
            <p className="text-sm text-muted-foreground">{daysLeft} days left · 31 Dec 2026</p>
          </div>
          {hasFollowers ? (
            <>
              <p className="section-title mt-4 text-6xl"><CountUp value={followerTotal} /> <span className="text-2xl text-muted-foreground">/ 1,000</span></p>
              <div className="mt-4"><GoldBar pct={pct} /></div>
              <p className="mt-2 text-xs text-muted-foreground">{pct}% · total followers from your latest saved analytics</p>
            </>
          ) : (
            <p className="mt-6 text-sm uppercase tracking-[0.2em] text-muted-foreground">DATA NOT AVAILABLE — add follower counts in Analytics</p>
          )}
        </section>

        <Rise><SubGoalsCompact /></Rise>

        <section className="card-primary rounded-3xl p-6 lg:col-span-3">
          <h2 className="section-title text-4xl">THIS MONTH</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {month.map((m) => (
              <div key={m.label} className="card-secondary rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{m.label}</p>
                <p className="section-title text-4xl"><CountUp value={m.a} /></p>
                <Delta value={percentChange(m.a, m.b)} />
              </div>
            ))}
          </div>
        </section>

        <section className="card-primary rounded-3xl p-6 lg:col-span-2">
          <h2 className="section-title text-4xl">LIVE INSIGHTS</h2>
          {platforms.length ? (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <button key={p} type="button" onClick={() => setTab(p)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${p === activePlatform ? "border-foreground bg-foreground/10" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    <PlatformLogo p={p} /> {p}
                  </button>
                ))}
              </div>
              {insight ? (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[["Followers", insight.followers_end], ["Gained", insight.followers_gained], ["Views", insight.views], ["Likes", insight.likes]].map(([l, v]) => (
                    <div key={l as string} className="card-secondary rounded-2xl p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{l}</p>
                      <p className="section-title text-3xl">{v == null ? "—" : formatNumber(Number(v))}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              <p className="mt-3 text-xs text-muted-foreground">From your latest saved entry. Live channel stats: Not connected.</p>
            </>
          ) : (
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">DATA NOT AVAILABLE — live stats not connected</p>
          )}
        </section>

        <section className="card-primary rounded-3xl p-6">
          <h2 className="section-title text-4xl">WHAT TO IMPROVE</h2>
          {tips.length ? (
            <ul className="mt-4 space-y-3">
              {tips.slice(0, 3).map((t) => <li key={t} className="card-secondary rounded-xl px-4 py-3 text-sm">{t}</li>)}
            </ul>
          ) : <p className="mt-4 text-sm text-muted-foreground">You're on track. Keep going.</p>}
        </section>

        <section className="card-primary rounded-3xl p-6 lg:col-span-2">
          <h2 className="section-title text-4xl">WORKSPACE</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SHORTCUTS.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="card-secondary lift flex items-center gap-3 rounded-2xl p-4 text-sm font-medium">
                <img src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(s.url)}`} alt="" className="size-6 rounded" />
                {s.name} <ExternalLink className="ml-auto size-3.5 text-muted-foreground" />
              </a>
            ))}
          </div>
        </section>

        <section className="card-primary flex flex-col justify-between rounded-3xl p-6">
          <h2 className="section-title text-4xl">QUICK ADD</h2>
          <p className="mt-2 text-sm text-muted-foreground">Stream, challenge, video, idea, goal and more.</p>
          <div className="mt-4"><QuickAdd label="Add something" /></div>
        </section>
      </Stagger>
    </div>
  );
}

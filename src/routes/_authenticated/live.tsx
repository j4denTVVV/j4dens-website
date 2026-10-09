import { SubGoalsLadder } from "@/components/hub/SubGoals";
import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Plus, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/hub/common";
import { StreamDialog } from "@/components/hub/dialogs";
import { ItemDialog, emptyItem, type HubItem, type HubKind } from "@/components/hub/HubItemsPage";
import { LiveCard, TYPE_META } from "@/components/hub/LiveCard";
import { StudioEmpty, TabBar } from "@/components/hub/studio";
import { fetchAll } from "@/lib/api";

const TABS = ["all", "stream", "challenge", "marathon", "subathon", "irl"] as const;
type Tab = (typeof TABS)[number];
const LIVE_KINDS: HubKind[] = ["challenge", "marathon", "subathon", "irl"];

export const Route = createFileRoute("/_authenticated/live")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } =>
    TABS.includes(s["tab"] as Tab) ? { tab: s["tab"] as Tab } : {},
  head: () => ({
    meta: [
      { title: "Live Planner — J4DENTV Creator HQ" },
      { name: "description", content: "Streams, challenges, marathons, subathons and IRLs in one place." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LivePlanner,
});

function detailFor(h: HubItem) {
  const d = h.details ?? {};
  if (h.kind === "subathon" && d["max_duration"]) return `Max ${d["max_duration"]}`;
  if (h.kind === "marathon") {
    const segs = (d["segments"] ?? "").split("\n").filter(Boolean).length;
    if (segs) return `${segs} segment${segs === 1 ? "" : "s"}`;
    if (d["duration"]) return d["duration"];
  }
  if (h.kind === "irl" && h.location) return h.location;
  if (h.checklist?.length) return `Checklist ${h.checklist.filter((c) => c.done).length}/${h.checklist.length}`;
  return null;
}

export function PlanChooser({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (t: Exclude<Tab, "all">) => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="section-title text-3xl">What are you planning?</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          {TABS.filter((t) => t !== "all").map((t) => {
            const m = TYPE_META[t];
            const Icon = m.icon;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onPick(t as Exclude<Tab, "all">)}
                className="card-secondary lift flex items-center gap-3 p-4 text-left"
              >
                <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="size-4" /></span>
                <span className="section-title text-xl">{t === "stream" ? "Normal Stream" : m.label}</span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LivePlanner() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { tab = "all" } = Route.useSearch();
  const [choosing, setChoosing] = useState(false);
  const [streamOpen, setStreamOpen] = useState(false);
  const [editing, setEditing] = useState<(Omit<HubItem, "id"> & { id?: string }) | null>(null);
  const { data: streams = [] } = useQuery({ queryKey: ["streams"], queryFn: () => fetchAll("streams") });
  const { data: hub = [] } = useQuery({ queryKey: ["hub_items", "all"], queryFn: () => fetchAll<HubItem>("hub_items") });

  const start = (t: Exclude<Tab, "all">) => {
    setChoosing(false);
    if (t === "stream") setStreamOpen(true);
    else setEditing(emptyItem(t as HubKind));
  };

  const cards = [
    ...streams
      .filter((s: any) => s.status !== "Cancelled")
      .map((s: any) => ({
        id: s.id, type: "stream", title: s.title, date: s.stream_date, time: s.stream_time, status: s.status,
        detail: s.platform, open: () => navigate({ to: "/streams/$streamId", params: { streamId: s.id } }),
      })),
    ...hub
      .filter((h) => LIVE_KINDS.includes(h.kind) && h.status !== "Archived")
      .map((h) => ({
        id: h.id, type: h.kind, title: h.title, date: h.start_date, time: h.start_time ?? null, status: h.status,
        detail: detailFor(h), open: () => setEditing(h),
      })),
  ]
    .filter((c) => tab === "all" || c.type === tab)
    .sort((a, b) => String(a.date ?? "9999").localeCompare(String(b.date ?? "9999")));

  const label = tab === "all" ? "" : TYPE_META[tab].label;

  return (
    <div>
      <PageHeader
        title="Live Planner"
        subtitle="Every stream, challenge, marathon, subathon and IRL — together."
        action={<Button onClick={() => (tab === "all" ? setChoosing(true) : start(tab))}><Plus className="size-4" /> Plan {label || "Live"}</Button>}
      />
      <TabBar
        id="live"
        value={tab}
        onChange={(t) => navigate({ to: "/live", search: t === "all" ? {} : { tab: t } })}
        tabs={TABS.map((t) => ({ value: t, label: t === "all" ? "All" : `${TYPE_META[t].label}s` }))}
      />
      {tab === "subathon" ? <div className="mb-8"><SubGoalsLadder /></div> : null}
      {cards.length === 0 ? (
        tab === "all" ? (
          <StudioEmpty icon={<Radio className="size-5" />} title="Nothing planned yet." text="Choose what you want to create:">
            {TABS.filter((t) => t !== "all").map((t) => (
              <Button key={t} variant="outline" onClick={() => start(t as Exclude<Tab, "all">)}>{TYPE_META[t].label}</Button>
            ))}
          </StudioEmpty>
        ) : (
          <StudioEmpty
            icon={(() => { const I = TYPE_META[tab].icon; return <I className="size-5" />; })()}
            title={`No ${label.toLowerCase()}s planned`}
            text={tab === "subathon" ? "Create your first timed stream event." : `Plan your first ${label.toLowerCase()}.`}
          >
            <Button onClick={() => start(tab)}>Plan {label}</Button>
          </StudioEmpty>
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {cards.map((c) => (
              <LiveCard key={`${c.type}-${c.id}`} type={c.type} title={c.title} date={c.date} time={c.time} status={c.status} detail={c.detail} onOpen={c.open} />
            ))}
          </AnimatePresence>
        </div>
      )}
      <PlanChooser open={choosing} onClose={() => setChoosing(false)} onPick={start} />
      {streamOpen ? <StreamDialog open onOpenChange={() => setStreamOpen(false)} /> : null}
      {editing ? (
        <ItemDialog value={editing} onClose={() => setEditing(null)} onSaved={() => qc.invalidateQueries({ queryKey: ["hub_items"] })} />
      ) : null}
    </div>
  );
}

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { fetchSettings, saveSettings } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type Milestone = { subs: number; text: string };
type SubGoalsData = { current: number; updated_at: string | null; milestones: Milestone[] };

const DEFAULTS: Milestone[] = [
  [10, "Chat choose my pfp for 24h"], [20, "Choose any photo to post"], [30, "Call any person on my phone"],
  [40, "Any horror game with lights off"], [50, "Bring girl on stream"], [60, "Extreme Truth or Dare"],
  [70, "Punishment wheel"], [80, "Chat controls stream"], [90, "Public karaoke"], [100, "24 hour stream"],
  [125, "IRL challenge stream"], [150, "Stream in another city"], [175, "Costume stream"],
  [200, "48 hour BIG 4TV event"], [250, "Throw an IRL Party"],
].map(([subs, text]) => ({ subs: subs as number, text: text as string }));
const MAJOR = new Set([100, 200, 250]);

function useSubGoals() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const prefs = ((settings as any)?.preferences ?? {}) as Record<string, any>;
  const raw = prefs["subgoals"] as Partial<SubGoalsData> | undefined;
  const data: SubGoalsData = {
    current: raw?.current ?? 0,
    updated_at: raw?.updated_at ?? null,
    milestones: raw?.milestones ?? DEFAULTS,
  };
  const save = useMutation({
    mutationFn: (next: Partial<SubGoalsData>) =>
      saveSettings({ preferences: { ...prefs, subgoals: { ...data, ...next } } } as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const ms = [...data.milestones].sort((a, b) => a.subs - b.subs);
  const nextIdx = ms.findIndex((m) => m.subs > data.current);
  const next = nextIdx >= 0 ? ms[nextIdx] : null;
  const prev = nextIdx > 0 ? ms[nextIdx - 1]!.subs : nextIdx === -1 ? (ms.at(-1)?.subs ?? 0) : 0;
  const pct = next ? ((data.current - prev) / (next.subs - prev)) * 100 : 100;
  return { data, ms, next, prev, pct: Math.max(0, Math.min(100, pct)), save, loaded: !!settings };
}

function Bar({ pct, big }: { pct: number; big?: boolean }) {
  return (
    <div className={`${big ? "h-4" : "h-2"} w-full overflow-hidden rounded-full bg-muted`}>
      <motion.div className="h-full rounded-full bg-foreground" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }} />
    </div>
  );
}

export function SubGoalsCompact() {
  const { data, next, pct } = useSubGoals();
  return (
    <div className="card-primary flex h-full flex-col gap-3 p-5">
      <p className="eyebrow">SUB GOALS</p>
      <p className="section-title text-5xl">{data.current} / {next?.subs ?? "✓"}</p>
      <p className="text-sm text-muted-foreground">Next: <span className="text-foreground">{next?.text ?? "All milestones done"}</span></p>
      <Bar pct={pct} />
      <p className="text-xs text-muted-foreground">{next ? `${next.subs - data.current} subs remaining` : "Add a new milestone"}</p>
      <Button asChild variant="outline" size="sm" className="mt-auto self-start"><Link to="/goals">VIEW GOALS</Link></Button>
    </div>
  );
}

export function SubGoalsLadder() {
  const { data, ms, next, prev, pct, save } = useSubGoals();
  const [count, setCount] = useState<string>("");
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Milestone>({ subs: 0, text: "" });

  const setMs = (list: Milestone[]) => save.mutate({ milestones: list });
  const updateCount = () => {
    const n = parseInt(count, 10);
    if (Number.isNaN(n) || n < 0) return;
    save.mutate({ current: n, updated_at: new Date().toISOString() }, { onSuccess: () => { setCount(""); toast.success("Sub count updated"); } });
  };
  const swap = (i: number, j: number) => {
    if (j < 0 || j >= ms.length) return;
    const list = [...ms];
    const a = list[i]!, b = list[j]!;
    // Reorder keeps numbers ascending: swap the rewards between the two slots.
    list[i] = { subs: a.subs, text: b.text };
    list[j] = { subs: b.subs, text: a.text };
    setMs(list);
  };

  return (
    <section className="card-primary p-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">SUB GOALS</p>
          <p className="section-title text-shine text-6xl sm:text-7xl">{data.current} / {next?.subs ?? "✓"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            MANUAL COUNT · Last updated {data.updated_at ? new Date(data.updated_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "never"}
          </p>
        </div>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); updateCount(); }}>
          <Input type="number" min={0} value={count} onChange={(e) => setCount(e.target.value)} placeholder="Current subs" className="w-36" />
          <Button type="submit" size="sm" disabled={!count}>Update</Button>
        </form>
      </div>

      <div className="mt-6">
        <p className="eyebrow">NEXT MILESTONE</p>
        <p className="section-title mt-1 text-2xl">{next ? `${next.subs} — ${next.text}` : "All milestones unlocked"}</p>
        <div className="mt-3"><Bar pct={pct} big /></div>
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
          <span>{prev}</span>
          <span>{data.current} SUBS · {next ? `${next.subs - data.current} REMAINING · ${Math.round(pct)}% TO NEXT MILESTONE` : "COMPLETE"}</span>
          <span>{next?.subs ?? ""}</span>
        </div>
      </div>

      <ol className="mt-8 space-y-2">
        {ms.map((m, i) => {
          const done = m.subs <= data.current;
          const isNext = next?.subs === m.subs;
          const major = MAJOR.has(m.subs);
          return (
            <li key={`${m.subs}-${i}`}
              className={`group flex items-center gap-3 rounded-xl border px-4 transition ${major ? "py-5" : "py-3"} ${
                isNext ? "border-foreground/60 bg-foreground/5 shadow-[0_0_30px_-10px] shadow-foreground/40" : done ? "border-border opacity-50" : "border-border/60 text-muted-foreground"
              }`}>
              <span className="w-6 text-center">{done ? <Check className="size-4" /> : isNext ? "→" : ""}</span>
              {editing === i ? (
                <form className="flex flex-1 flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); const list = [...ms]; list[i] = draft; setMs(list); setEditing(null); }}>
                  <Input type="number" className="w-24" value={draft.subs} onChange={(e) => setDraft({ ...draft, subs: Number(e.target.value) })} />
                  <Input className="flex-1" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
                  <Button size="sm" type="submit">Save</Button>
                </form>
              ) : (
                <div className="flex-1">
                  {major ? <p className="eyebrow text-[10px]">MAJOR GOAL</p> : null}
                  <p className={`${major ? "section-title text-3xl" : isNext ? "text-lg font-semibold" : ""} ${done ? "line-through" : ""} ${major && !done ? "text-shine" : ""}`}>
                    {m.subs} — {major ? m.text.toUpperCase() : m.text}
                  </p>
                </div>
              )}
              {isNext ? <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">NEXT</span> : null}
              {editing !== i ? (
                <div className="flex opacity-60 group-hover:opacity-100">
                  <Button size="icon" variant="ghost" aria-label="Move up" onClick={() => swap(i, i - 1)}><ArrowUp className="size-4" /></Button>
                  <Button size="icon" variant="ghost" aria-label="Move down" onClick={() => swap(i, i + 1)}><ArrowDown className="size-4" /></Button>
                  <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => { setEditing(i); setDraft(m); }}><Pencil className="size-4" /></Button>
                  <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => setMs(ms.filter((_, k) => k !== i))}><Trash2 className="size-4" /></Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      <Button variant="outline" className="mt-4" onClick={() => {
        const subs = (ms.at(-1)?.subs ?? 0) + 25;
        setMs([...ms, { subs, text: "New milestone" }]);
        setEditing(ms.length); setDraft({ subs, text: "New milestone" });
      }}><Plus className="size-4" /> ADD MILESTONE</Button>
    </section>
  );
}

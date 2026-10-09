import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { deleteRow, fetchAll } from "@/lib/api";
import { daysUntil, formatNumber, shortDate } from "@/lib/hub";
import { SubGoalsLadder } from "@/components/hub/SubGoals";
import { ConfirmDelete, EmptyState, PageHeader } from "@/components/hub/common";
import { GoalDialog } from "@/components/hub/dialogs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({
    meta: [
      { title: "Goals — J4DENTV Creator HQ" },
      { name: "description", content: "Road to 1K, sub goals and every J4denTV target." },
      { property: "og:title", content: "Goals — J4DENTV Creator HQ" },
      { property: "og:description", content: "Road to 1K, sub goals and every J4denTV target." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GoalsPage,
});

const TARGET = 1000;
const DEADLINE = "2026-12-31";

function Bar({ pct, h = "h-3" }: { pct: number; h?: string }) {
  return (
    <div className={`${h} w-full overflow-hidden rounded-full bg-muted`}>
      <motion.div className="h-full rounded-full bg-foreground" initial={{ width: 0 }} animate={{ width: `${Math.min(100, pct)}%` }} transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }} />
    </div>
  );
}

function RoadTo1K() {
  const { data: rows = [] } = useQuery({ queryKey: ["analytics_entries"], queryFn: () => fetchAll("analytics_entries", { orderBy: "period_start" }) });
  const latest = new Map<string, any>();
  rows.forEach((r: any) => { if (r.followers_end != null && !latest.has(r.platform)) latest.set(r.platform, r); });
  const has = latest.size > 0;
  const current = [...latest.values()].reduce((a, r) => a + Number(r.followers_end), 0);
  const pct = (current / TARGET) * 100;
  const days = daysUntil(DEADLINE) ?? 0;
  return (
    <section className="card-primary p-6 sm:p-8">
      <p className="eyebrow">MAIN GOAL · DEADLINE 31 DECEMBER 2026</p>
      <h2 className="section-title text-shine mt-1 text-6xl sm:text-7xl">Road to 1K</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-5">
        {[
          ["Current followers", has ? formatNumber(current) : "DATA NOT AVAILABLE"],
          ["Target", formatNumber(TARGET)],
          ["Percentage", has ? `${Math.round(pct)}%` : "—"],
          ["Remaining", has ? formatNumber(Math.max(0, TARGET - current)) : "—"],
          ["Days left", String(Math.max(0, days))],
        ].map(([l, v]) => (
          <div key={l} className="card-minimal p-4">
            <p className="eyebrow">{l}</p>
            <p className={v === "DATA NOT AVAILABLE" ? "mt-2 text-[0.6rem] font-semibold tracking-[0.2em] text-muted-foreground" : "section-title mt-1 text-3xl"}>{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-6"><Bar pct={has ? pct : 0} h="h-4" /></div>
      <p className="mt-2 text-xs text-muted-foreground">
        {has ? "Total followers from your latest logged numbers on each platform." : "Log follower counts in Analytics to track this."}
      </p>
    </section>
  );
}

function GoalsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { data: goals = [] } = useQuery({ queryKey: ["goals"], queryFn: () => fetchAll("goals") });
  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("goals", id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goals"] }); toast.success("Goal deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="animate-page space-y-8">
      <PageHeader title="Goals" subtitle="What J4denTV is working towards." action={<Button onClick={() => setOpen(true)}><Plus /> ADD GOAL</Button>} />
      <RoadTo1K />
      <SubGoalsLadder />
      <section>
        <h2 className="section-title mb-4 text-4xl">Other Goals</h2>
        {goals.length === 0 ? (
          <EmptyState title="No other goals yet." action={<Button variant="outline" onClick={() => setOpen(true)}>ADD GOAL</Button>} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((g: any) => {
              const pct = g.target_value > 0 ? (g.current_value / g.target_value) * 100 : 0;
              const done = g.current_value >= g.target_value;
              return (
                <div key={g.id} className={`card-secondary lift p-6 ${done ? "opacity-60" : ""}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="eyebrow">{g.category}</span>
                    <span className="text-xs text-muted-foreground">{g.deadline ? `Due ${shortDate(g.deadline)}` : "No deadline"}</span>
                  </div>
                  <p className="section-title mt-2 text-3xl">{done ? "✓ " : ""}{g.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatNumber(g.current_value)} / {formatNumber(g.target_value)} · {Math.round(Math.min(100, pct))}%</p>
                  <div className="mt-4"><Bar pct={pct} /></div>
                  <div className="mt-4 flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(g)}><Pencil /> EDIT</Button>
                    <ConfirmDelete onConfirm={() => remove.mutate(g.id)} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      {open ? <GoalDialog open onOpenChange={() => setOpen(false)} /> : null}
      {editing ? <GoalDialog open existing={editing} onOpenChange={() => setEditing(null)} /> : null}
    </div>
  );
}

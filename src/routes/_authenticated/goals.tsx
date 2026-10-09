import { SubGoalsLadder } from "@/components/hub/SubGoals";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAll } from "@/lib/api";
import { shortDate } from "@/lib/hub";
import { EmptyState, PageHeader, ProgressRow } from "@/components/hub/common";
import { GoalDialog } from "@/components/hub/dialogs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({
    meta: [
      { title: "Goals — J4denTV Creator Hub" },
      { name: "description", content: "Track J4denTV creator goals and deadlines." },
      { property: "og:title", content: "Goals — J4denTV Creator Hub" },
      { property: "og:description", content: "Track J4denTV creator goals and deadlines." },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const [open, setOpen] = useState(false);
  const { data: goals = [] } = useQuery({ queryKey: ["goals"], queryFn: () => fetchAll("goals") });
  return (
    <div>
      <PageHeader
        title="Goals"
        subtitle="What you're working towards."
        action={<Button onClick={() => setOpen(true)}>New goal</Button>}
      />
      <div className="mb-8"><SubGoalsLadder /></div>
      {goals.length === 0 ? (
        <EmptyState title="No goals yet" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g: any) => (
            <div key={g.id} className="panel panel-hover p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="chip-base chip-violet">{g.category}</span>
                <span className="text-xs text-muted-foreground">
                  {g.deadline ? `Due ${shortDate(g.deadline)}` : "No deadline"}
                </span>
              </div>
              <ProgressRow label={g.name} current={g.current_value} target={g.target_value} />
            </div>
          ))}
        </div>
      )}
      {open ? <GoalDialog open onOpenChange={() => setOpen(false)} /> : null}
    </div>
  );
}

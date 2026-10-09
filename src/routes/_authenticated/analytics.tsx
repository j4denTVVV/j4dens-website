import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchAll } from "@/lib/api";
import { ANALYTICS_PLATFORMS, formatNumber, shortDate } from "@/lib/hub";
import { EmptyState, PageHeader } from "@/components/hub/common";
import { AnalyticsDialog } from "@/components/hub/dialogs";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — J4denTV Creator Hub" },
      { name: "description", content: "Monthly growth across J4denTV platforms." },
      { property: "og:title", content: "Analytics — J4denTV Creator Hub" },
      { property: "og:description", content: "Monthly growth across J4denTV platforms." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<string>("All");
  const { data: rows = [] } = useQuery({
    queryKey: ["analytics_entries"],
    queryFn: () => fetchAll("analytics_entries", { orderBy: "period_start" }),
  });
  const list = rows.filter((r: any) => platform === "All" || r.platform === platform);
  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Your numbers, month by month."
        action={<Button onClick={() => setOpen(true)}>Add entry</Button>}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {["All", ...ANALYTICS_PLATFORMS].map((p) => (
          <Button key={p} size="sm" variant={p === platform ? "default" : "outline"} onClick={() => setPlatform(p)}>
            {p}
          </Button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState title="No analytics yet" />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                {["Period", "Platform", "Views", "Followers gained", "Likes", "Posts"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((r: any) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3">{shortDate(r.period_start)}</td>
                  <td className="px-4 py-3">{r.platform}</td>
                  <td className="px-4 py-3">{formatNumber(r.views)}</td>
                  <td className="px-4 py-3">{formatNumber(r.followers_gained)}</td>
                  <td className="px-4 py-3">{formatNumber(r.likes)}</td>
                  <td className="px-4 py-3">{formatNumber(r.posts)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open ? <AnalyticsDialog open onOpenChange={() => setOpen(false)} /> : null}
    </div>
  );
}

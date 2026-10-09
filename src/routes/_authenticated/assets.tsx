import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HubItemsPage } from "@/components/hub/HubItemsPage";
import { TabBar } from "@/components/hub/studio";

type Tab = "overlay" | "equipment";

export const Route = createFileRoute("/_authenticated/assets")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } =>
    s["tab"] === "equipment" || s["tab"] === "overlay" ? { tab: s["tab"] } : {},
  head: () => ({
    meta: [
      { title: "Assets — J4DENTV Creator HQ" },
      { name: "description", content: "Overlays and equipment for J4denTV." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Assets,
});

function Assets() {
  const { tab = "overlay" } = Route.useSearch();
  const navigate = useNavigate();
  return (
    <div>
      <TabBar
        id="assets"
        value={tab}
        onChange={(t) => navigate({ to: "/assets", search: { tab: t } })}
        tabs={[{ value: "overlay", label: "Overlays" }, { value: "equipment", label: "Equipment" }]}
      />
      <HubItemsPage key={tab} kind={tab} />
    </div>
  );
}

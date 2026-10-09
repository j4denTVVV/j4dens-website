import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarBoard, type CalendarItem } from "@/components/hub/CalendarBoard";
import { PageHeader } from "@/components/hub/common";
import { fetchAll } from "@/lib/api";
import { KIND_CONFIG, type HubItem } from "@/components/hub/HubItemsPage";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({ meta: [{ title: "Calendar — J4DENTV Creator HQ" }, { name: "robots", content: "noindex" }] }),
  component: CalendarPage,
});

const KIND_PATH = {
  challenge: "/challenges", marathon: "/marathons", subathon: "/subathons", collab: "/collabs",
  irl: "/irl", overlay: "/overlays", equipment: "/equipment",
} as const;

function CalendarPage() {
  const navigate = useNavigate();
  const { data: videos = [] } = useQuery({ queryKey: ["youtube_videos"], queryFn: () => fetchAll("youtube_videos") });
  const { data: streams = [] } = useQuery({ queryKey: ["streams"], queryFn: () => fetchAll("streams") });
  const { data: goals = [] } = useQuery({ queryKey: ["goals"], queryFn: () => fetchAll("goals") });
  const { data: hub = [] } = useQuery({ queryKey: ["hub_items", "all"], queryFn: () => fetchAll<HubItem>("hub_items") });

  const { data: collabs = [] } = useQuery({ queryKey: ["collabs"], queryFn: () => fetchAll("collabs") });

  const items: CalendarItem[] = [];
  collabs.forEach((c: any) => {
    if (c.collab_date && ["Confirmed", "Filmed", "Posted"].includes(c.status))
      items.push({ date: c.collab_date, label: `Collab: ${c.title}`, kind: "event", onOpen: () => navigate({ to: "/collabs" }) });
  });
  videos.forEach((v: any) => {
    const open = () => navigate({ to: "/youtube/$videoId", params: { videoId: v.id } });
    if (v.planned_upload_date) items.push({ date: v.planned_upload_date, label: v.working_title, kind: "upload", onOpen: open });
    if (v.planned_record_date) items.push({ date: v.planned_record_date, label: v.working_title, kind: "record", onOpen: open });
  });
  streams.forEach((s: any) => {
    if (s.stream_date) items.push({ date: s.stream_date, label: s.title, kind: "stream", onOpen: () => navigate({ to: "/streams/$streamId", params: { streamId: s.id } }) });
  });
  goals.forEach((g: any) => {
    if (g.deadline) items.push({ date: g.deadline, label: g.name, kind: "goal", onOpen: () => navigate({ to: "/goals" }) });
  });
  hub.forEach((h) => {
    if (h.start_date && h.status !== "Archived")
      items.push({ date: h.start_date, label: `${KIND_CONFIG[h.kind].singular}: ${h.title}`, kind: "event", onOpen: () => navigate({ to: KIND_PATH[h.kind] }) });
  });

  return (
    <div>
      <PageHeader title="Calendar" subtitle="Everything you've planned, in one place." />
      <CalendarBoard items={items} />
    </div>
  );
}

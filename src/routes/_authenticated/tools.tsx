import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Search } from "lucide-react";
import { PageHeader } from "@/components/hub/common";
import { TabBar } from "@/components/hub/studio";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Tab = "overlays" | "emotes" | "analytics" | "streaming";
type Tool = { name: string; desc: string; links: { label: string; url: string }[] };

const TOOLS: Record<Tab, Tool[]> = {
  overlays: [
    { name: "StreamElements", desc: "Overlays, alerts, chatbot and tipping.", links: [{ label: "Open dashboard", url: "https://streamelements.com/dashboard" }, { label: "Overlay gallery", url: "https://streamelements.com/themes" }] },
    { name: "Streamlabs", desc: "Alert boxes, widgets and overlay themes.", links: [{ label: "Open dashboard", url: "https://streamlabs.com/dashboard" }, { label: "Themes", url: "https://streamlabs.com/library" }] },
  ],
  emotes: [
    { name: "7TV", desc: "Custom emotes for Twitch, YouTube and Kick.", links: [{ label: "Open 7TV", url: "https://7tv.app" }, { label: "My emotes", url: "https://7tv.app/users" }] },
  ],
  analytics: [
    { name: "StreamCharts", desc: "Stream stats, viewer history and rankings.", links: [{ label: "My J4denTV page", url: "https://streamscharts.com/channels/j4dentv" }, { label: "Open StreamCharts", url: "https://streamscharts.com" }] },
    { name: "Metricool", desc: "Deep social analytics and scheduling.", links: [{ label: "Open Metricool", url: "https://app.metricool.com" }] },
  ],
  streaming: [
    { name: "OBS Studio", desc: "Free streaming and recording software.", links: [{ label: "Download", url: "https://obsproject.com" }] },
    { name: "Notion", desc: "Detailed planning and documents.", links: [{ label: "Open Notion", url: "https://www.notion.so" }] },
    { name: "Twitch Creator Dashboard", desc: "Stream manager, insights and settings.", links: [{ label: "Open", url: "https://dashboard.twitch.tv" }] },
    { name: "YouTube Studio", desc: "Uploads, analytics and comments.", links: [{ label: "Open", url: "https://studio.youtube.com" }] },
    { name: "TikTok Studio", desc: "Post, review analytics and go live.", links: [{ label: "Open", url: "https://www.tiktok.com/tiktokstudio" }] },
  ],
};

export const Route = createFileRoute("/_authenticated/tools")({
  head: () => ({
    meta: [
      { title: "Creator Tools — J4DENTV Creator HQ" },
      { name: "description", content: "Overlays, emotes, analytics and streaming tools in one place." },
      { property: "og:title", content: "Creator Tools — J4DENTV Creator HQ" },
      { property: "og:description", content: "Overlays, emotes, analytics and streaming tools in one place." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ToolsPage,
});

async function search7tv(q: string) {
  const res = await fetch("https://7tv.io/v3/gql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query($q:String!){emotes(query:$q,limit:24){items{id name owner{display_name}}}}`,
      variables: { q },
    }),
  });
  if (!res.ok) throw new Error("7TV search failed");
  const json = await res.json();
  return (json?.data?.emotes?.items ?? []) as { id: string; name: string; owner?: { display_name?: string } }[];
}

function EmoteSearch() {
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const { data = [], isFetching, error } = useQuery({
    queryKey: ["7tv", q],
    queryFn: () => search7tv(q),
    enabled: q.length > 1,
  });
  return (
    <div className="card-primary mb-6 rounded-2xl p-6">
      <form onSubmit={(e) => { e.preventDefault(); setQ(input.trim()); }} className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search 7TV emotes" className="h-11" />
        <Button type="submit"><Search className="size-4" /> Search</Button>
      </form>
      {error ? (
        <p className="mt-4 text-sm text-muted-foreground">
          7TV search isn't available right now.{" "}
          <a className="underline" href={`https://7tv.app/emotes?query=${encodeURIComponent(q)}`} target="_blank" rel="noreferrer">Search on 7TV</a>
        </p>
      ) : null}
      {isFetching ? <p className="mt-4 text-sm text-muted-foreground">Searching…</p> : null}
      {data.length ? (
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {data.map((e) => (
            <a key={e.id} href={`https://7tv.app/emotes/${e.id}`} target="_blank" rel="noreferrer" className="card-secondary lift flex flex-col items-center gap-2 rounded-xl p-3 text-center">
              <img src={`https://cdn.7tv.app/emote/${e.id}/2x.webp`} alt={e.name} className="h-10 object-contain" loading="lazy" />
              <span className="w-full truncate text-xs">{e.name}</span>
            </a>
          ))}
        </div>
      ) : q && !isFetching && !error ? <p className="mt-4 text-sm text-muted-foreground">No emotes found.</p> : null}
    </div>
  );
}

function ToolsPage() {
  const [tab, setTab] = useState<Tab>("overlays");
  return (
    <div>
      <PageHeader title="Creator Tools" subtitle="Everything you use to run the channel, one click away." />
      <TabBar
        id="tools"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "overlays", label: "Overlays" },
          { value: "emotes", label: "Emotes" },
          { value: "analytics", label: "Analytics" },
          { value: "streaming", label: "Streaming Tools" },
        ]}
      />
      {tab === "emotes" ? <EmoteSearch /> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TOOLS[tab].map((t) => (
          <div key={t.name} className="card-primary lift flex flex-col rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <img src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(t.links[0]!.url)}`} alt="" className="size-9 rounded-lg bg-foreground/10 p-1" />
              <p className="section-title text-2xl">{t.name}</p>
            </div>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">{t.desc}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {t.links.map((l, i) => (
                <Button key={l.url} asChild variant={i === 0 ? "default" : "outline"} size="sm">
                  <a href={l.url} target="_blank" rel="noreferrer">{l.label} <ExternalLink className="size-3.5" /></a>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

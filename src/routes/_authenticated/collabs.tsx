import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Plus, Search, Trash2, ChevronDown } from "lucide-react";
import { deleteRow, fetchAll, insertRow, updateRow } from "@/lib/api";
import { shortDate } from "@/lib/hub";
import { PageHeader, Field } from "@/components/hub/common";
import { PLATFORM_META, PlatformBadges, PlatformPicker, isPlatform } from "@/components/hub/platforms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/collabs")({
  head: () => ({
    meta: [
      { title: "Collabs — J4DENTV Creator HQ" },
      { name: "description", content: "Find creators, plan collaborations and track outreach." },
      { property: "og:title", content: "Collabs — J4DENTV Creator HQ" },
      { property: "og:description", content: "Find creators, plan collaborations and track outreach." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CollabsPage,
});

const STATUSES = ["Idea", "Need To Ask", "Reached Out", "Waiting", "Confirmed", "Filmed", "Posted", "Cancelled"];
type Creator = { id: string; display_name: string; username: string | null; avatar_url: string | null; profiles: Record<string, string> | null };
type Collab = {
  id: string; creator_id: string | null; title: string; collab_date: string | null; collab_time: string | null;
  activity: string | null; plan: string | null; status: string; notes: string | null; segments: string | null; platforms: string[] | null;
};

function CollabsPage() {
  const qc = useQueryClient();
  const { data: creators = [] } = useQuery({ queryKey: ["creators"], queryFn: () => fetchAll<Creator>("creators") });
  const { data: collabs = [] } = useQuery({ queryKey: ["collabs"], queryFn: () => fetchAll<Collab>("collabs") });
  const [finding, setFinding] = useState(false);
  const [editing, setEditing] = useState<Partial<Collab> | null>(null);
  const [filter, setFilter] = useState("All");
  const byId = useMemo(() => new Map(creators.map((c) => [c.id, c])), [creators]);
  const shown = filter === "All" ? collabs : collabs.filter((c) => c.status === filter);

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("collabs", id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["collabs"] }); toast.success("Collab deleted"); },
  });

  return (
    <div>
      <PageHeader
        title="Collabs"
        subtitle="Find creators, plan collaborations and track who you've contacted."
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setFinding(true)}><Search className="h-4 w-4" /> Find creator</Button>
            <Button variant="outline" onClick={() => setEditing({ status: "Idea", platforms: [] })}><Plus className="h-4 w-4" /> Manual collab</Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {["All", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`border px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors ${filter === s ? "border-foreground text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {s}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="card-minimal p-10 text-center">
          <p className="section-title text-2xl">No collabs yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Find a creator to start planning one.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((c) => {
            const cr = c.creator_id ? byId.get(c.creator_id) : undefined;
            return (
              <button key={c.id} onClick={() => setEditing(c)} className="card-secondary lift p-5 text-left">
                <div className="flex items-center gap-3">
                  <Avatar creator={cr} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{cr?.display_name ?? c.title}</p>
                    {cr?.username ? <p className="truncate text-xs text-muted-foreground">@{cr.username}</p> : null}
                  </div>
                  <span className="border border-border px-2 py-0.5 text-[9px] font-semibold tracking-[0.2em] uppercase">{c.status}</span>
                </div>
                <p className="mt-4 text-sm">{c.activity || c.title}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{c.collab_date ? `${shortDate(c.collab_date)}${c.collab_time ? ` · ${c.collab_time}` : ""}` : "No date"}</span>
                  <PlatformBadges list={c.platforms} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {finding ? (
        <FindCreator creators={creators} onClose={() => setFinding(false)}
          onSelect={(cr) => { setFinding(false); setEditing({ creator_id: cr.id, status: "Idea", platforms: [], title: `Collab with ${cr.display_name}` }); }} />
      ) : null}
      {editing ? (
        <CollabDialog value={editing} creators={creators} onClose={() => setEditing(null)}
          onDelete={editing.id ? () => { remove.mutate(editing.id!); setEditing(null); } : undefined} />
      ) : null}
    </div>
  );
}

function Avatar({ creator }: { creator?: Creator | undefined }) {
  if (creator?.avatar_url) return <img src={creator.avatar_url} alt="" className="h-10 w-10 rounded-full border border-border object-cover" />;
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted font-display text-lg">
      {(creator?.display_name ?? "?").slice(0, 1).toUpperCase()}
    </span>
  );
}

function FindCreator({ creators, onClose, onSelect }: { creators: Creator[]; onClose: () => void; onSelect: (c: Creator) => void }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const handle = q.trim().replace(/^@/, "");
  const matches = handle
    ? creators.filter((c) => [c.display_name, c.username, ...Object.values(c.profiles ?? {})].some((v) => v?.toLowerCase().includes(handle.toLowerCase())))
    : creators;

  const save = useMutation({
    mutationFn: () => insertRow<Creator>("creators", {
      display_name: handle, username: handle,
      profiles: Object.fromEntries(Object.entries(profiles).filter(([, v]) => v.trim())),
    }),
    onSuccess: (cr) => { qc.invalidateQueries({ queryKey: ["creators"] }); toast.success("Creator saved"); onSelect(cr); },
    onError: () => toast.error("Couldn't save creator"),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="section-title text-3xl">Find creator</DialogTitle></DialogHeader>
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search creator or @username..." className="h-12" />

        <div className="max-h-56 space-y-2 overflow-y-auto">
          <p className="eyebrow">Saved creators</p>
          {matches.length === 0 ? <p className="text-sm text-muted-foreground">No saved creators match.</p> : matches.map((c) => (
            <div key={c.id} className="flex items-center gap-3 border border-border p-3">
              <Avatar creator={c} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.display_name}</p>
                <PlatformBadges list={Object.keys(c.profiles ?? {})} />
              </div>
              <Button size="sm" onClick={() => onSelect(c)}>Select</Button>
            </div>
          ))}
        </div>

        {handle ? (
          <div className="space-y-3 border border-border p-4">
            <p className="eyebrow">External creator search is not connected</p>
            <div className="grid grid-cols-2 gap-2">
              {(["YouTube", "Twitch", "TikTok", "Instagram"] as const).map((p) => (
                <a key={p} href={PLATFORM_META[p].search(handle)} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 border border-border px-3 py-2 text-[10px] font-semibold tracking-[0.2em] uppercase hover:border-foreground">
                  Search {p} <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
            <p className="pt-2 text-xs text-muted-foreground">Found them? Link their profiles and save as one creator:</p>
            {(["Twitch", "YouTube", "TikTok", "Instagram"] as const).map((p) => (
              <Input key={p} placeholder={`${p} username (optional)`} value={profiles[p] ?? ""}
                onChange={(e) => setProfiles({ ...profiles, [p]: e.target.value.replace(/^@/, "") })} />
            ))}
            <Button className="w-full" disabled={save.isPending} onClick={() => save.mutate()}>Link profiles &amp; save @{handle}</Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CollabDialog({ value, creators, onClose, onDelete }: { value: Partial<Collab>; creators: Creator[]; onClose: () => void; onDelete?: (() => void) | undefined }) {
  const qc = useQueryClient();
  const [v, setV] = useState<Partial<Collab>>(value);
  const [more, setMore] = useState(Boolean(value.notes || value.segments));
  const set = (k: keyof Collab, x: unknown) => setV((p) => ({ ...p, [k]: x }));
  const creator = creators.find((c) => c.id === v.creator_id);

  const save = useMutation({
    mutationFn: () => {
      const row = {
        creator_id: v.creator_id || null, title: v.title || (creator ? `Collab with ${creator.display_name}` : v.activity || "Collab"),
        collab_date: v.collab_date || null, collab_time: v.collab_time || null, activity: v.activity || null, plan: v.plan || null,
        status: v.status || "Idea", notes: v.notes || null, segments: v.segments || null, platforms: v.platforms ?? [],
        platform: (v.platforms ?? [])[0] ?? null,
      };
      return v.id ? updateRow("collabs", v.id, row) : insertRow("collabs", row);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["collabs"] }); toast.success("Collab saved"); onClose(); },
    onError: () => toast.error("Couldn't save collab"),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader><DialogTitle className="section-title text-3xl">{v.id ? "Edit collab" : "New collab"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Field label="Creator">
            <select value={v.creator_id ?? ""} onChange={(e) => set("creator_id", e.target.value || null)}
              className="h-11 w-full border border-input bg-transparent px-3 text-sm">
              <option value="">— None —</option>
              {creators.map((c) => <option key={c.id} value={c.id}>{c.display_name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date"><Input type="date" value={v.collab_date ?? ""} onChange={(e) => set("collab_date", e.target.value)} /></Field>
            <Field label="Time"><Input type="time" value={v.collab_time ?? ""} onChange={(e) => set("collab_time", e.target.value)} /></Field>
          </div>
          <Field label="Platforms"><PlatformPicker value={(v.platforms ?? []).filter(isPlatform)} onChange={(x) => set("platforms", x)} /></Field>
          <Field label="Game / Activity"><Input value={v.activity ?? ""} onChange={(e) => set("activity", e.target.value)} /></Field>
          <Field label="What we're doing"><Textarea value={v.plan ?? ""} onChange={(e) => set("plan", e.target.value)} /></Field>
          <Field label="Status">
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button type="button" key={s} onClick={() => set("status", s)}
                  className={`border px-2.5 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase ${v.status === s ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}>{s}</button>
              ))}
            </div>
          </Field>
          <button type="button" onClick={() => setMore(!more)} className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground">
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${more ? "rotate-180" : ""}`} /> Segments &amp; notes
          </button>
          {more ? (
            <>
              <Field label="Segments"><Textarea value={v.segments ?? ""} onChange={(e) => set("segments", e.target.value)} /></Field>
              <Field label="Notes, ideas, checklist, equipment"><Textarea value={v.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></Field>
            </>
          ) : null}
          <div className="flex gap-2 pt-2">
            {onDelete ? <Button variant="outline" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button> : null}
            <Button className="flex-1" disabled={save.isPending} onClick={() => save.mutate()}>Save collab</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


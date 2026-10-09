import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, EmptyState, Field } from "@/components/hub/common";
import { deleteRow, fetchAll, insertRow, updateRow } from "@/lib/api";
import { chipClass, shortDate } from "@/lib/hub";

export type HubKind = "challenge" | "marathon" | "subathon" | "collab" | "irl" | "overlay" | "equipment";

type CheckItem = { label: string; done: boolean };
export type HubItem = {
  id: string;
  kind: HubKind;
  title: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  platform: string | null;
  partner: string | null;
  location: string | null;
  goal: string | null;
  notes: string | null;
  checklist: CheckItem[];
  start_time?: string | null;
  details?: Record<string, string>;
};

/** Fields shown only for a given type (stored in hub_items.details). */
export const DETAIL_FIELDS: Partial<Record<HubKind, Array<{ key: string; label: string; long?: boolean }>>> = {
  subathon: [
    { key: "start_duration", label: "Starting duration" },
    { key: "max_duration", label: "Maximum duration" },
    { key: "timer_rule", label: "Sub timer rule" },
    { key: "goals", label: "Goals", long: true },
    { key: "milestones", label: "Milestones", long: true },
    { key: "segments", label: "Segments", long: true },
  ],
  marathon: [
    { key: "duration", label: "Duration" },
    { key: "games", label: "Games", long: true },
    { key: "segments", label: "Segments", long: true },
    { key: "collabs", label: "Collabs" },
    { key: "challenges", label: "Challenges" },
    { key: "breaks", label: "Breaks" },
    { key: "equipment", label: "Equipment" },
  ],
  challenge: [
    { key: "game", label: "Game / activity" },
    { key: "reward", label: "Reward or punishment" },
  ],
  irl: [
    { key: "route", label: "Route / plan", long: true },
    { key: "safety", label: "Safety & permissions" },
  ],
};

export const KIND_CONFIG: Record<
  HubKind,
  {
    title: string;
    subtitle: string;
    singular: string;
    statuses: string[];
    fields: Array<"dates" | "platform" | "partner" | "location" | "goal">;
    labels?: Partial<Record<"partner" | "location" | "goal", string>>;
  }
> = {
  challenge: { title: "Challenges", subtitle: "Plan challenge content and rules.", singular: "challenge", statuses: ["Idea", "Planned", "In Progress", "Completed", "Archived"], fields: ["dates", "platform", "goal"], labels: { goal: "Rules / win condition" } },
  marathon: { title: "Marathons", subtitle: "Long-form streams, schedules and prep.", singular: "marathon", statuses: ["Idea", "Planned", "Ready", "Live", "Completed", "Archived"], fields: ["dates", "platform", "goal"], labels: { goal: "Target length / goal" } },
  subathon: { title: "Subathons", subtitle: "Timers, goals and incentives.", singular: "subathon", statuses: ["Idea", "Planned", "Ready", "Live", "Completed", "Archived"], fields: ["dates", "platform", "goal"], labels: { goal: "Sub goals / timer rules" } },
  collab: { title: "Collabs", subtitle: "Creators you're working with.", singular: "collab", statuses: ["Idea", "Reached Out", "Confirmed", "Filmed", "Posted", "Archived"], fields: ["dates", "platform", "partner"], labels: { partner: "Collaborator" } },
  irl: { title: "IRLs", subtitle: "Out-in-the-world streams and shoots.", singular: "IRL", statuses: ["Idea", "Planned", "Ready", "Completed", "Archived"], fields: ["dates", "platform", "location"], labels: { location: "Location" } },
  overlay: { title: "Overlays", subtitle: "Stream graphics, alerts and scenes.", singular: "overlay", statuses: ["Idea", "Designing", "Testing", "Live", "Archived"], fields: ["goal"], labels: { goal: "Used for" } },
  equipment: { title: "Equipment", subtitle: "Gear you own and gear you want.", singular: "item", statuses: ["Wishlist", "Ordered", "Owned", "Needs Repair", "Sold"], fields: ["partner", "goal"], labels: { partner: "Brand / model", goal: "Price / notes" } },
};

const empty = (kind: HubKind): Omit<HubItem, "id"> => ({
  kind,
  title: "",
  status: KIND_CONFIG[kind].statuses[0] ?? "Idea",
  start_date: null,
  end_date: null,
  platform: null,
  partner: null,
  location: null,
  goal: null,
  notes: null,
  checklist: [],
  start_time: null,
  details: {},
});
export const emptyItem = empty;

export function HubItemsPage({ kind }: { kind: HubKind }) {
  const cfg = KIND_CONFIG[kind];
  const qc = useQueryClient();
  const key = ["hub_items", kind];
  const { data: items = [] } = useQuery({
    queryKey: key,
    queryFn: () => fetchAll<HubItem>("hub_items", { match: { kind } }),
  });
  const [editing, setEditing] = useState<(Omit<HubItem, "id"> & { id?: string }) | null>(null);
  const [filter, setFilter] = useState("All");
  const shown = items.filter((i) => (filter === "All" ? i.status !== "Archived" : i.status === filter));

  return (
    <div>
      <PageHeader
        title={cfg.title}
        subtitle={cfg.subtitle}
        action={
          <Button onClick={() => setEditing(empty(kind))}>
            <Plus className="size-4" /> New {cfg.singular}
          </Button>
        }
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {["All", ...cfg.statuses].map((s) => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
            {s}
          </Button>
        ))}
      </div>
      {shown.length === 0 ? (
        <EmptyState title={`No ${cfg.title.toLowerCase()} yet`} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((i) => {
            const done = (i.checklist ?? []).filter((c) => c.done).length;
            return (
              <Button key={i.id} variant="ghost" onClick={() => setEditing(i)} className="card-secondary lift h-auto flex-col items-stretch whitespace-normal p-5 text-left">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{i.title}</p>
                  <span className={chipClass(i.status)}>{i.status}</span>
                </div>
                {i.start_date ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {shortDate(i.start_date)}
                    {i.end_date ? ` → ${shortDate(i.end_date)}` : ""}
                  </p>
                ) : null}
                {i.partner || i.location || i.platform ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[i.partner, i.location, i.platform].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
                {i.notes ? <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{i.notes}</p> : null}
                {i.checklist?.length ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Checklist {done}/{i.checklist.length}
                  </p>
                ) : null}
              </Button>
            );
          })}
        </div>
      )}
      {editing ? (
        <ItemDialog
          value={editing}
          onClose={() => setEditing(null)}
          onSaved={() => qc.invalidateQueries({ queryKey: ["hub_items"] })}
        />
      ) : null}
    </div>
  );
}

export function ItemDialog({
  value,
  onClose,
  onSaved,
}: {
  value: Omit<HubItem, "id"> & { id?: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const cfg = KIND_CONFIG[value.kind];
  const [form, setForm] = useState(value);
  const [newCheck, setNewCheck] = useState("");
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: async () => {
      const { id, ...rest } = form;
      const values = { ...rest, checklist: rest.checklist as unknown, details: (rest.details ?? {}) as unknown } as Record<string, unknown>;
      return id ? updateRow("hub_items", id, values) : insertRow("hub_items", values);
    },
    onSuccess: () => {
      toast.success("Saved");
      onSaved();
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: () => {
      if (!form.id) throw new Error("This item has not been saved yet.");
      return deleteRow("hub_items", form.id);
    },
    onSuccess: () => {
      toast.success("Deleted");
      onSaved();
      onClose();
    },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{form.id ? `Edit ${cfg.singular}` : `New ${cfg.singular}`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Title">
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} autoFocus />
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {cfg.statuses.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {cfg.fields.includes("dates") ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start">
                <Input type="date" value={form.start_date ?? ""} onChange={(e) => set("start_date", e.target.value || null)} />
              </Field>
              <Field label="End">
                <Input type="date" value={form.end_date ?? ""} onChange={(e) => set("end_date", e.target.value || null)} />
              </Field>
            </div>
          ) : null}
          {cfg.fields.includes("dates") && value.kind !== "collab" ? (
            <Field label="Start time">
              <Input type="time" value={form.start_time ?? ""} onChange={(e) => set("start_time", e.target.value || null)} />
            </Field>
          ) : null}
          {(DETAIL_FIELDS[value.kind] ?? []).map((f) => (
            <Field key={f.key} label={f.label}>
              {f.long ? (
                <Textarea rows={2} value={form.details?.[f.key] ?? ""} onChange={(e) => set("details", { ...(form.details ?? {}), [f.key]: e.target.value })} />
              ) : (
                <Input value={form.details?.[f.key] ?? ""} onChange={(e) => set("details", { ...(form.details ?? {}), [f.key]: e.target.value })} />
              )}
            </Field>
          ))}
          {cfg.fields.includes("platform") ? (
            <Field label="Platform">
              <Input value={form.platform ?? ""} onChange={(e) => set("platform", e.target.value || null)} placeholder="Twitch, YouTube, TikTok…" />
            </Field>
          ) : null}
          {(["partner", "location", "goal"] as const).map((k) =>
            cfg.fields.includes(k) ? (
              <Field key={k} label={cfg.labels?.[k] ?? k}>
                <Input value={form[k] ?? ""} onChange={(e) => set(k, e.target.value || null)} />
              </Field>
            ) : null,
          )}
          <Field label="Notes">
            <Textarea rows={4} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value || null)} />
          </Field>
          <div>
            <p className="mb-2 text-sm font-medium">Checklist</p>
            <div className="space-y-2">
              {form.checklist.map((c, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Checkbox
                    checked={c.done}
                    onCheckedChange={(v) =>
                      set("checklist", form.checklist.map((x, j) => (j === idx ? { ...x, done: !!v } : x)))
                    }
                  />
                  <span className={`flex-1 text-sm ${c.done ? "text-muted-foreground line-through" : ""}`}>{c.label}</span>
                  <Button size="icon" variant="ghost" onClick={() => set("checklist", form.checklist.filter((_, j) => j !== idx))}>
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCheck.trim()) return;
                  set("checklist", [...form.checklist, { label: newCheck.trim(), done: false }]);
                  setNewCheck("");
                }}
              >
                <Input value={newCheck} onChange={(e) => setNewCheck(e.target.value)} placeholder="Add a task…" />
                <Button type="submit" variant="outline">Add</Button>
              </form>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          {form.id ? (
            <Button variant="ghost" className="text-destructive" onClick={() => remove.mutate()}>
              <Trash2 className="size-4" /> Delete
            </Button>
          ) : <span />}
          <Button disabled={!form.title.trim() || save.isPending} onClick={() => save.mutate()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

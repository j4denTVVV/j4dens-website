import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/hub/common";
import { CategorySelector, ContentTypeSelector, StatusSelector, PrioritySelector, PlatformSelector, MoreOptions, FormAction } from "@/components/hub/visual-selectors";
import { insertRow, updateRow } from "@/lib/api";
import { ANALYTICS_PLATFORMS, GOAL_CATEGORIES, IDEA_STATUSES, IDEA_TYPES, STREAM_CATEGORIES, STREAM_STATUSES, VIDEO_CATEGORIES, VIDEO_STATUSES } from "@/lib/hub";

type Row = any;
type Props = { open: boolean; onOpenChange: (v: boolean) => void; existing?: Row };
function useSave(table: string, done: () => void) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, values }: { id?: string; values: Row }) => id ? updateRow(table, id, values) : insertRow(table, values), onSuccess: () => { qc.invalidateQueries({ queryKey: [table] }); toast.success("Saved"); done(); }, onError: (e: Error) => toast.error(e.message) });
}
function Shell({ open, onOpenChange, title, children, onSave, saving, action }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; children: ReactNode; onSave: () => void; saving: boolean; action: string }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader><div className="space-y-6">{children}</div><DialogFooter className="border-t border-border pt-5"><Button variant="ghost" className="rounded-sm" onClick={() => onOpenChange(false)}>Cancel</Button><FormAction disabled={saving} onClick={onSave}>{saving ? "Saving…" : action}</FormAction></DialogFooter></DialogContent></Dialog>;
}
export function VideoDialog({ open, onOpenChange, existing }: Props) {
  const [form, setForm] = useState<Row>(existing ?? { working_title: "", category: "Gaming", status: "Idea", priority: "Normal", planned_record_date: "", planned_upload_date: "", notes: "" });
  const set = (k: string, v: unknown) => setForm((f: Row) => ({ ...f, [k]: v }));
  const save = useSave("youtube_videos", () => onOpenChange(false));
  return <Shell open={open} onOpenChange={onOpenChange} title={existing ? "Edit video" : "New video"} action={existing ? "Save video" : "Create video"} saving={save.isPending} onSave={() => {
    if (!String(form.working_title ?? "").trim()) { toast.error("Add a working title"); return; }
    save.mutate({ id: existing?.id, values: { working_title: form.working_title, category: form.category, status: form.status, priority: form.priority, planned_record_date: form.planned_record_date || null, planned_upload_date: form.planned_upload_date || null, notes: form.notes || null, ...(existing ? { hook: form.hook || null, thumbnail_idea: form.thumbnail_idea || null } : {}) } });
  }}>
    <Field label="Title"><Input autoFocus value={form.working_title ?? ""} onChange={e => set("working_title", e.target.value)} placeholder="What's the video?" /></Field>
    <Field label="What type?"><CategorySelector value={form.category} onChange={v => set("category", v)} options={VIDEO_CATEGORIES} /></Field>
    <Field label="Status"><StatusSelector value={form.status} onChange={v => set("status", v)} options={VIDEO_STATUSES} /></Field>
    <Field label="When?"><div className="grid grid-cols-2 gap-3"><Field label="Recording date"><Input type="date" value={form.planned_record_date ?? ""} onChange={e => set("planned_record_date", e.target.value)} /></Field><Field label="Upload date"><Input type="date" value={form.planned_upload_date ?? ""} onChange={e => set("planned_upload_date", e.target.value)} /></Field></div></Field>
    <MoreOptions><Field label="Priority"><PrioritySelector value={form.priority} onChange={v => set("priority", v)} /></Field><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} rows={3} /></Field>{existing && <><Field label="Hook"><Textarea value={form.hook ?? ""} onChange={e => set("hook", e.target.value)} /></Field><Field label="Thumbnail idea"><Textarea value={form.thumbnail_idea ?? ""} onChange={e => set("thumbnail_idea", e.target.value)} /></Field></>}</MoreOptions>
  </Shell>;
}
export function StreamDialog({ open, onOpenChange, existing, defaultPlatform = "Twitch" }: Props & { defaultPlatform?: string }) {
  const [form, setForm] = useState<Row>(existing ?? { title: "", stream_date: "", stream_time: "", category: "Just Chatting", status: "Idea", platform: defaultPlatform, platforms: [defaultPlatform], main_idea: "" });
  const set = (k: string, v: unknown) => setForm((f: Row) => ({ ...f, [k]: v }));
  const platforms = form.platforms?.length ? form.platforms : form.platform && form.platform !== "Multi-stream" ? [form.platform] : [];
  const save = useSave("streams", () => onOpenChange(false));
  return <Shell open={open} onOpenChange={onOpenChange} title={existing ? "Edit stream" : "Plan stream"} action={existing ? "Save stream" : "Create stream"} saving={save.isPending} onSave={() => {
    if (!String(form.title ?? "").trim()) { toast.error("Add a stream title"); return; }
    save.mutate({ id: existing?.id, values: { title: form.title, stream_date: form.stream_date || null, stream_time: form.stream_time || null, category: form.category, status: form.status, platform: platforms.length > 1 ? "Multi-stream" : platforms[0] ?? null, platforms, main_idea: form.main_idea || null, notes: form.notes || null, details: form.details ?? {} } });
  }}>
    <Field label="Stream title"><Input autoFocus value={form.title ?? ""} onChange={e => set("title", e.target.value)} placeholder="Friday stream" /></Field>
    <div className="grid grid-cols-2 gap-3"><Field label="Date"><Input type="date" value={form.stream_date ?? ""} onChange={e => set("stream_date", e.target.value)} /></Field><Field label="Time"><Input type="time" value={form.stream_time ?? ""} onChange={e => set("stream_time", e.target.value)} /></Field></div>
    <Field label="Where are you going live?"><PlatformSelector value={platforms} onChange={v => { set("platforms", v); set("platform", v.length > 1 ? "Multi-stream" : v[0] ?? ""); }} /></Field>
    <Field label="What type?"><CategorySelector value={form.category} onChange={v => set("category", v)} options={STREAM_CATEGORIES} /></Field>
    <Field label="Status"><StatusSelector value={form.status} onChange={v => set("status", v)} options={STREAM_STATUSES} labels={{ "Live Completed": "Completed" }} /></Field>
    <Field label="Main idea"><Input value={form.main_idea ?? ""} onChange={e => set("main_idea", e.target.value)} /></Field>
    <MoreOptions><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} /></Field>{["equipment", "collab"].map(k => <Field key={k} label={k}><Input value={form.details?.[k] ?? ""} onChange={e => set("details", { ...form.details, [k]: e.target.value })} /></Field>)}</MoreOptions>
  </Shell>;
}
export function IdeaDialog({ open, onOpenChange, existing }: Props) {
  const [form, setForm] = useState<Row>(existing ?? { title: "", description: "", type: "YouTube", priority: "Normal", status: "Unused", tags: [] });
  const set = (k: string, v: unknown) => setForm((f: Row) => ({ ...f, [k]: v }));
  const save = useSave("ideas", () => onOpenChange(false));
  const submit = () => { if (!String(form.title ?? "").trim()) { toast.error("Add an idea title"); return; } save.mutate({ id: existing?.id, values: { title: form.title, description: form.description || null, type: form.type, priority: form.priority, status: form.status, tags: Array.isArray(form.tags) ? form.tags : String(form.tags ?? "").split(",").map(t => t.trim()).filter(Boolean) } }); };
  return <Shell open={open} onOpenChange={onOpenChange} title={existing ? "Edit idea" : "New idea"} action="Save idea" saving={save.isPending} onSave={submit}>
    <Field label="Type idea"><Input autoFocus value={form.title ?? ""} onChange={e => set("title", e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (!save.isPending) submit(); } }} placeholder="An idea worth saving…" /></Field>
    <ContentTypeSelector value={form.type} onChange={v => set("type", v)} options={IDEA_TYPES} />
    <MoreOptions><Field label="Description"><Textarea value={form.description ?? ""} onChange={e => set("description", e.target.value)} /></Field><Field label="Priority"><PrioritySelector value={form.priority} onChange={v => set("priority", v)} /></Field><Field label="Status"><StatusSelector value={form.status} onChange={v => set("status", v)} options={IDEA_STATUSES} /></Field><Field label="Tags"><Input value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags ?? ""} onChange={e => set("tags", e.target.value)} /></Field></MoreOptions>
  </Shell>;
}
export function GoalDialog({ open, onOpenChange, existing }: Props) {
  const [form, setForm] = useState<Row>(existing ?? { name: "", category: "YouTube", current_value: 0, target_value: 10, deadline: "" });
  const set = (k: string, v: unknown) => setForm((f: Row) => ({ ...f, [k]: v }));
  const save = useSave("goals", () => onOpenChange(false));
  return <Shell open={open} onOpenChange={onOpenChange} title={existing ? "Edit goal" : "New goal"} action={existing ? "Save goal" : "Create goal"} saving={save.isPending} onSave={() => {
    if (!String(form.name ?? "").trim()) { toast.error("Add a goal name"); return; }
    const current = Number(form.current_value) || 0; const target = Number(form.target_value) || 1;
    save.mutate({ id: existing?.id, values: { name: form.name, category: form.category, current_value: current, target_value: target, deadline: form.deadline || null, completed: current >= target } });
  }}>
    <Field label="Goal name"><Input autoFocus value={form.name ?? ""} onChange={e => set("name", e.target.value)} placeholder="What are you working towards?" /></Field>
    <Field label="What is this for?"><CategorySelector value={form.category} onChange={v => set("category", v)} options={GOAL_CATEGORIES} labels={{ "YouTube uploads": "Uploads", "Short-form posts": "Shorts" }} /></Field>
    <div className="grid grid-cols-2 gap-3"><Field label="Current"><Input type="number" value={form.current_value ?? 0} onChange={e => set("current_value", e.target.value)} /></Field><Field label="Target"><Input type="number" value={form.target_value ?? 0} onChange={e => set("target_value", e.target.value)} /></Field></div>
    <Field label="Deadline"><Input type="date" value={form.deadline ?? ""} onChange={e => set("deadline", e.target.value)} /></Field>
  </Shell>;
}
export function AnalyticsDialog({ open, onOpenChange, existing, defaultPlatform = "YouTube" }: Props & { defaultPlatform?: string }) {
  const today = new Date();
  const [form, setForm] = useState<Row>(existing ?? { period: "monthly", platform: defaultPlatform, period_start: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`, period_end: "", followers_start: "", followers_end: "", followers_gained: 0, views: 0, posts: 0, likes: 0, comments: 0, shares: 0, avg_viewers: "", watch_time: "", subs_gained: "" });
  const set = (k: string, v: unknown) => setForm((f: Row) => ({ ...f, [k]: v }));
  const save = useSave("analytics_entries", () => onOpenChange(false));
  const live = form.platform === "Twitch"; const youtube = form.platform === "YouTube";
  const metric = (k: string, label: string) => <Field key={k} label={label}><Input type="number" value={form[k] ?? ""} onChange={e => set(k, e.target.value)} /></Field>;
  return <Shell open={open} onOpenChange={onOpenChange} title={existing ? "Edit analytics" : "Analytics entry"} action="Save analytics" saving={save.isPending} onSave={() => {
    if (!form.period_start) { toast.error("Pick a start date"); return; }
    const values: Row = { period: form.period, platform: form.platform, period_start: form.period_start, period_end: form.period_end || null };
    for (const k of ["followers_start", "followers_end", "avg_viewers", "watch_time", "subs_gained"]) values[k] = form[k] === "" || form[k] == null ? null : Number(form[k]);
    for (const k of ["followers_gained", "views", "posts", "likes", "comments", "shares"]) values[k] = Number(form[k]) || 0;
    save.mutate({ id: existing?.id, values });
  }}>
    <Field label="Choose platform"><PlatformSelector single value={[form.platform]} onChange={v => set("platform", v[0])} options={ANALYTICS_PLATFORMS} /></Field>
    <Field label="Period"><StatusSelector label="Period" value={form.period} onChange={v => set("period", v)} options={["weekly", "monthly", "custom"]} labels={{ weekly: "Week", monthly: "Month", custom: "Custom" }} /></Field>
    <div className="grid grid-cols-2 gap-3"><Field label="Start date"><Input type="date" value={form.period_start ?? ""} onChange={e => set("period_start", e.target.value)} /></Field>{form.period === "custom" && <Field label="End date"><Input type="date" value={form.period_end ?? ""} onChange={e => set("period_end", e.target.value)} /></Field>}</div>
    <div className="grid grid-cols-2 gap-4">{metric("followers_end", youtube ? "Subscribers" : "Followers")}{metric("followers_gained", youtube ? "Subscribers gained" : "Followers gained")}{live ? metric("avg_viewers", "Average viewers") : metric("views", "Views")}{live ? metric("subs_gained", "Subs gained") : metric("posts", youtube ? "Uploads" : "Posts")}</div>
    <MoreOptions>{form.period !== "custom" && <Field label="End date"><Input type="date" value={form.period_end ?? ""} onChange={e => set("period_end", e.target.value)} /></Field>}<div className="grid grid-cols-2 gap-4">{metric("followers_start", "Followers at start")}{live ? <>{metric("views", "Views")}{metric("posts", "Streams")}{metric("watch_time", "Watch time (hours)")}</> : <>{metric("likes", "Likes")}{metric("comments", "Comments")}{!youtube && metric("shares", "Shares")}{youtube && <>{metric("watch_time", "Watch time (hours)")}{metric("subs_gained", "Subs gained")}{metric("avg_viewers", "Average live viewers")}</>}</>}</div></MoreOptions>
  </Shell>;
}

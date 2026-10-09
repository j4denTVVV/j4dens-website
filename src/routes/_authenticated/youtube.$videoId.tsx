import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Plus, X } from "lucide-react";
import { deleteRow, fetchAll, fetchOne, insertRow, updateRow } from "@/lib/api";
import { PRIORITIES, VIDEO_CATEGORIES, VIDEO_STATUSES } from "@/lib/hub";
import { ConfirmDelete, Field, PageHeader } from "@/components/hub/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/youtube/$videoId")({
  head: () => ({
    meta: [
      { title: "Video details — J4denTV Creator Hub" },
      { name: "description", content: "Full plan, structure and performance for one video." },
      { property: "og:title", content: "Video details — J4denTV Creator Hub" },
      {
        property: "og:description",
        content: "Full plan, structure and performance for one video.",
      },
    ],
  }),
  component: VideoDetail,
});

function Picker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function VideoDetail() {
  const { videoId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);
  const [newSection, setNewSection] = useState("");
  const [newTask, setNewTask] = useState("");

  const { data: video, isLoading } = useQuery({
    queryKey: ["youtube_videos", videoId],
    queryFn: () => fetchOne("youtube_videos", videoId),
  });
  const { data: sections = [] } = useQuery({
    queryKey: ["youtube_sections", videoId],
    queryFn: () =>
      fetchAll("youtube_sections", {
        orderBy: "position",
        ascending: true,
        match: { video_id: videoId },
      }),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["youtube_checklists", videoId],
    queryFn: () =>
      fetchAll("youtube_checklists", {
        orderBy: "position",
        ascending: true,
        match: { video_id: videoId },
      }),
  });

  useEffect(() => {
    if (video) setForm(video);
  }, [video]);

  const save = useMutation({
    mutationFn: (values: Record<string, unknown>) => updateRow("youtube_videos", videoId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["youtube_videos"] });
      toast.success("Video saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteRow("youtube_videos", videoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["youtube_videos"] });
      toast.success("Video deleted");
      navigate({ to: "/youtube" });
    },
  });

  const childMutation = (table: string, key: string) => ({
    add: async (values: Record<string, unknown>) => {
      await insertRow(table, { ...values, video_id: videoId });
      qc.invalidateQueries({ queryKey: [key, videoId] });
    },
    update: async (id: string, values: Record<string, unknown>) => {
      await updateRow(table, id, values);
      qc.invalidateQueries({ queryKey: [key, videoId] });
    },
    remove: async (id: string) => {
      await deleteRow(table, id);
      qc.invalidateQueries({ queryKey: [key, videoId] });
    },
  });

  const sectionApi = childMutation("youtube_sections", "youtube_sections");
  const taskApi = childMutation("youtube_checklists", "youtube_checklists");

  if (isLoading || !form) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!video) return <p className="text-sm text-muted-foreground">This video no longer exists.</p>;

  const set = (k: string, v: unknown) => setForm((f: any) => ({ ...f, [k]: v }));
  const num = (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v));

  const onSave = () =>
    save.mutate({
      working_title: form.working_title,
      final_title: form.final_title || null,
      category: form.category,
      status: form.status,
      priority: form.priority,
      concept: form.concept || null,
      hook: form.hook || null,
      notes: form.notes || null,
      thumbnail_idea: form.thumbnail_idea || null,
      thumbnail_done: !!form.thumbnail_done,
      planned_record_date: form.planned_record_date || null,
      actual_record_date: form.actual_record_date || null,
      planned_upload_date: form.planned_upload_date || null,
      actual_upload_date: form.actual_upload_date || null,
      views_24h: num(form.views_24h),
      views_7d: num(form.views_7d),
      views_30d: num(form.views_30d),
      likes: num(form.likes),
      comments: num(form.comments),
      subs_gained: num(form.subs_gained),
    });

  return (
    <div>
      <Link
        to="/youtube"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> YouTube Planner
      </Link>
      <PageHeader
        title={form.working_title || "Untitled video"}
        subtitle={`${form.category} · ${form.status}`}
        action={
          <div className="flex gap-2">
            <ConfirmDelete onConfirm={() => remove.mutate()} />
            <Button onClick={onSave} disabled={save.isPending}>
              Save
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="panel space-y-4 p-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Working title">
              <Input
                value={form.working_title ?? ""}
                onChange={(e) => set("working_title", e.target.value)}
              />
            </Field>
            <Field label="Final title">
              <Input
                value={form.final_title ?? ""}
                onChange={(e) => set("final_title", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Video concept">
            <Textarea
              rows={4}
              value={form.concept ?? ""}
              onChange={(e) => set("concept", e.target.value)}
            />
          </Field>
          <Field label="Hook (first 10–30 seconds)">
            <Textarea
              rows={3}
              value={form.hook ?? ""}
              onChange={(e) => set("hook", e.target.value)}
            />
          </Field>
          <Field label="Notes">
            <Textarea
              rows={3}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
        </div>

        <div className="panel space-y-4 p-6">
          <Field label="Category">
            <Picker
              value={form.category}
              onChange={(v) => set("category", v)}
              options={VIDEO_CATEGORIES}
            />
          </Field>
          <Field label="Status">
            <Picker
              value={form.status}
              onChange={(v) => set("status", v)}
              options={VIDEO_STATUSES}
            />
          </Field>
          <Field label="Priority">
            <Picker
              value={form.priority}
              onChange={(v) => set("priority", v)}
              options={PRIORITIES}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Planned recording">
              <Input
                type="date"
                value={form.planned_record_date ?? ""}
                onChange={(e) => set("planned_record_date", e.target.value)}
              />
            </Field>
            <Field label="Actual recording">
              <Input
                type="date"
                value={form.actual_record_date ?? ""}
                onChange={(e) => set("actual_record_date", e.target.value)}
              />
            </Field>
            <Field label="Planned upload">
              <Input
                type="date"
                value={form.planned_upload_date ?? ""}
                onChange={(e) => set("planned_upload_date", e.target.value)}
              />
            </Field>
            <Field label="Actual upload">
              <Input
                type="date"
                value={form.actual_upload_date ?? ""}
                onChange={(e) => set("actual_upload_date", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <h2 className="section-title mb-4 text-lg">Video structure</h2>
          <div className="space-y-3">
            {sections.map((s: any) => (
              <div key={s.id} className="rounded-lg bg-surface p-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={s.completed}
                    onCheckedChange={(c) => sectionApi.update(s.id, { completed: !!c })}
                  />
                  <span className={`flex-1 text-sm ${s.completed ? "text-muted-foreground line-through" : ""}`}>
                    {s.name}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => sectionApi.remove(s.id)}>
                    <X className="size-4" />
                  </Button>
                </div>
                <Textarea
                  rows={2}
                  className="mt-2"
                  placeholder="Notes"
                  defaultValue={s.notes ?? ""}
                  onBlur={(e) => sectionApi.update(s.id, { notes: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Add a section (e.g. Round 1)"
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => {
                if (!newSection.trim()) return;
                sectionApi.add({ name: newSection.trim(), position: sections.length });
                setNewSection("");
              }}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="section-title mb-4 text-lg">Recording checklist</h2>
          <div className="space-y-2">
            {tasks.map((t: any) => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2">
                <Checkbox
                  checked={t.completed}
                  onCheckedChange={(c) => taskApi.update(t.id, { completed: !!c })}
                />
                <span className={`flex-1 text-sm ${t.completed ? "text-muted-foreground line-through" : ""}`}>
                  {t.label}
                </span>
                <Button variant="ghost" size="icon" onClick={() => taskApi.remove(t.id)}>
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Add a task (e.g. Record intro)"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => {
                if (!newTask.trim()) return;
                taskApi.add({ label: newTask.trim(), position: tasks.length });
                setNewTask("");
              }}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="panel space-y-4 p-6">
          <h2 className="section-title text-lg">Thumbnail</h2>
          <Field label="Thumbnail idea">
            <Textarea
              rows={4}
              value={form.thumbnail_idea ?? ""}
              onChange={(e) => set("thumbnail_idea", e.target.value)}
              placeholder="Jaden looking shocked on left, terrible Roblox game on right, 1 STAR above it."
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
            <span className="text-sm">Thumbnail completed</span>
            <Switch
              checked={!!form.thumbnail_done}
              onCheckedChange={(v) => set("thumbnail_done", v)}
            />
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="section-title mb-4 text-lg">Video performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Views after 24h">
              <Input
                type="number"
                value={form.views_24h ?? ""}
                onChange={(e) => set("views_24h", e.target.value)}
              />
            </Field>
            <Field label="Views after 7 days">
              <Input
                type="number"
                value={form.views_7d ?? ""}
                onChange={(e) => set("views_7d", e.target.value)}
              />
            </Field>
            <Field label="Views after 30 days">
              <Input
                type="number"
                value={form.views_30d ?? ""}
                onChange={(e) => set("views_30d", e.target.value)}
              />
            </Field>
            <Field label="Likes">
              <Input
                type="number"
                value={form.likes ?? ""}
                onChange={(e) => set("likes", e.target.value)}
              />
            </Field>
            <Field label="Comments">
              <Input
                type="number"
                value={form.comments ?? ""}
                onChange={(e) => set("comments", e.target.value)}
              />
            </Field>
            <Field label="Subscribers gained">
              <Input
                type="number"
                value={form.subs_gained ?? ""}
                onChange={(e) => set("subs_gained", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => navigate({ to: "/youtube" })}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={save.isPending}>
          Save
        </Button>
      </div>
    </div>
  );
}

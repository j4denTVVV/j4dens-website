import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Plus, X } from "lucide-react";
import { deleteRow, fetchAll, fetchOne, insertRow, updateRow } from "@/lib/api";
import { STREAM_CATEGORIES, STREAM_PLATFORMS, STREAM_STATUSES } from "@/lib/hub";
import { ConfirmDelete, Field, PageHeader } from "@/components/hub/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/streams/$streamId")({
  head: () => ({
    meta: [
      { title: "Stream details — J4denTV Creator Hub" },
      { name: "description", content: "Concept, checklist and segments for one stream." },
      { property: "og:title", content: "Stream details — J4denTV Creator Hub" },
      { property: "og:description", content: "Concept, checklist and segments for one stream." },
    ],
  }),
  component: StreamDetail,
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

function StreamDetail() {
  const { streamId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);
  const [newTask, setNewTask] = useState("");
  const [segName, setSegName] = useState("");
  const [segLength, setSegLength] = useState("");

  const { data: stream, isLoading } = useQuery({
    queryKey: ["streams", streamId],
    queryFn: () => fetchOne("streams", streamId),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: ["stream_checklists", streamId],
    queryFn: () =>
      fetchAll("stream_checklists", {
        orderBy: "position",
        ascending: true,
        match: { stream_id: streamId },
      }),
  });
  const { data: segments = [] } = useQuery({
    queryKey: ["stream_segments", streamId],
    queryFn: () =>
      fetchAll("stream_segments", {
        orderBy: "position",
        ascending: true,
        match: { stream_id: streamId },
      }),
  });

  useEffect(() => {
    if (stream) setForm(stream);
  }, [stream]);

  const save = useMutation({
    mutationFn: (values: Record<string, unknown>) => updateRow("streams", streamId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["streams"] });
      toast.success("Stream saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteRow("streams", streamId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["streams"] });
      toast.success("Stream deleted");
      navigate({ to: "/streams" });
    },
  });

  const child = (table: string, key: string) => ({
    add: async (values: Record<string, unknown>) => {
      await insertRow(table, { ...values, stream_id: streamId });
      qc.invalidateQueries({ queryKey: [key, streamId] });
    },
    update: async (id: string, values: Record<string, unknown>) => {
      await updateRow(table, id, values);
      qc.invalidateQueries({ queryKey: [key, streamId] });
    },
    remove: async (id: string) => {
      await deleteRow(table, id);
      qc.invalidateQueries({ queryKey: [key, streamId] });
    },
  });

  const taskApi = child("stream_checklists", "stream_checklists");
  const segApi = child("stream_segments", "stream_segments");

  if (isLoading || !form) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!stream) return <p className="text-sm text-muted-foreground">This stream no longer exists.</p>;

  const set = (k: string, v: unknown) => setForm((f: any) => ({ ...f, [k]: v }));

  const onSave = () =>
    save.mutate({
      title: form.title,
      stream_date: form.stream_date || null,
      stream_time: form.stream_time || null,
      category: form.category,
      status: form.status,
      platform: form.platform,
      main_idea: form.main_idea || null,
      notes: form.notes || null,
    });

  return (
    <div>
      <Link
        to="/streams"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Stream Planner
      </Link>
      <PageHeader
        title={form.title || "Untitled stream"}
        subtitle={`${form.platform} · ${form.status}`}
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
          <Field label="Stream title">
            <Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Main concept">
            <Textarea
              rows={4}
              value={form.main_idea ?? ""}
              onChange={(e) => set("main_idea", e.target.value)}
            />
          </Field>
          <Field label="Stream notes">
            <Textarea
              rows={4}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
        </div>

        <div className="panel space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date">
              <Input
                type="date"
                value={form.stream_date ?? ""}
                onChange={(e) => set("stream_date", e.target.value)}
              />
            </Field>
            <Field label="Time">
              <Input
                type="time"
                value={form.stream_time ?? ""}
                onChange={(e) => set("stream_time", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Platform">
            <Picker
              value={form.platform}
              onChange={(v) => set("platform", v)}
              options={STREAM_PLATFORMS}
            />
          </Field>
          <Field label="Main category">
            <Picker
              value={form.category}
              onChange={(v) => set("category", v)}
              options={STREAM_CATEGORIES}
            />
          </Field>
          <Field label="Status">
            <Picker
              value={form.status}
              onChange={(v) => set("status", v)}
              options={STREAM_STATUSES}
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <h2 className="section-title mb-4 text-lg">Things needed</h2>
          <div className="space-y-2">
            {tasks.map((t: any) => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2">
                <Checkbox
                  checked={t.completed}
                  onCheckedChange={(c) => taskApi.update(t.id, { completed: !!c })}
                />
                <span
                  className={`flex-1 text-sm ${t.completed ? "text-muted-foreground line-through" : ""}`}
                >
                  {t.label}
                </span>
                <Button variant="ghost" size="icon" onClick={() => taskApi.remove(t.id)}>
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing on the list yet.</p>
            ) : null}
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="OBS scene ready"
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

        <div className="panel p-6">
          <h2 className="section-title mb-1 text-lg">Segments</h2>
          <p className="mb-4 text-xs text-muted-foreground">Optional — only if you want a plan.</p>
          <div className="space-y-3">
            {segments.map((s: any) => (
              <div key={s.id} className="rounded-lg bg-surface p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {s.length_mins ? `${s.length_mins} mins` : ""}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => segApi.remove(s.id)}>
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  rows={2}
                  className="mt-2"
                  placeholder="Notes"
                  defaultValue={s.notes ?? ""}
                  onBlur={(e) => segApi.update(s.id, { notes: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Opening Chat"
              value={segName}
              onChange={(e) => setSegName(e.target.value)}
            />
            <Input
              type="number"
              className="w-24"
              placeholder="Mins"
              value={segLength}
              onChange={(e) => setSegLength(e.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => {
                if (!segName.trim()) return;
                segApi.add({
                  name: segName.trim(),
                  length_mins: segLength ? Number(segLength) : null,
                  position: segments.length,
                });
                setSegName("");
                setSegLength("");
              }}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => navigate({ to: "/streams" })}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={save.isPending}>
          Save
        </Button>
      </div>
    </div>
  );
}

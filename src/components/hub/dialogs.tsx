import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/hub/common";
import { insertRow, updateRow } from "@/lib/api";
import {
  ANALYTICS_PLATFORMS,
  GOAL_CATEGORIES,
  IDEA_STATUSES,
  IDEA_TYPES,
  PRIORITIES,
  STREAM_CATEGORIES,
  STREAM_PLATFORMS,
  STREAM_STATUSES,
  VIDEO_CATEGORIES,
  VIDEO_STATUSES,
} from "@/lib/hub";

type Row = any;

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

function useSave(table: string, keys: string[], successMessage: string, onDone?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Row }) =>
      id ? updateRow(table, id, values) : insertRow(table, values),
    onSuccess: () => {
      keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      toast.success(successMessage);
      onDone?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

function Shell({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="space-y-4 py-2">{children}</div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function VideoDialog({
  open,
  onOpenChange,
  existing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: Row;
}) {
  const [form, setForm] = useState<Row>(
    existing ?? {
      working_title: "",
      category: "Gaming",
      status: "Idea",
      priority: "Normal",
      planned_record_date: "",
      planned_upload_date: "",
      notes: "",
    },
  );
  const save = useSave("youtube_videos", ["youtube_videos"], "Video saved", () =>
    onOpenChange(false),
  );
  const set = (k: string, v: unknown) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title={existing ? "Edit video" : "New video"}
      description="Plan a J4denTV upload."
      saving={save.isPending}
      onSave={() => {
        if (!String(form.working_title ?? "").trim()) {
          toast.error("Add a working title");
          return;
        }
        save.mutate({
          id: existing?.id,
          values: {
            working_title: form.working_title,
            category: form.category,
            status: form.status,
            priority: form.priority,
            planned_record_date: form.planned_record_date || null,
            planned_upload_date: form.planned_upload_date || null,
            notes: form.notes || null,
          },
        });
      }}
    >
      <Field label="Working title">
        <Input
          value={form.working_title ?? ""}
          onChange={(e) => set("working_title", e.target.value)}
          placeholder="I Played The Worst Roblox Games"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          <Picker
            value={form.category}
            onChange={(v) => set("category", v)}
            options={VIDEO_CATEGORIES}
          />
        </Field>
        <Field label="Status">
          <Picker value={form.status} onChange={(v) => set("status", v)} options={VIDEO_STATUSES} />
        </Field>
        <Field label="Priority">
          <Picker value={form.priority} onChange={(v) => set("priority", v)} options={PRIORITIES} />
        </Field>
        <Field label="Recording date">
          <Input
            type="date"
            value={form.planned_record_date ?? ""}
            onChange={(e) => set("planned_record_date", e.target.value)}
          />
        </Field>
        <Field label="Upload date">
          <Input
            type="date"
            value={form.planned_upload_date ?? ""}
            onChange={(e) => set("planned_upload_date", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Notes">
        <Textarea
          rows={3}
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
        />
      </Field>
    </Shell>
  );
}

export function StreamDialog({
  open,
  onOpenChange,
  existing,
  defaultPlatform = "Twitch",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: Row;
  defaultPlatform?: string;
}) {
  const [form, setForm] = useState<Row>(
    existing ?? {
      title: "",
      stream_date: "",
      stream_time: "",
      category: "Just Chatting",
      status: "Idea",
      platform: defaultPlatform,
      main_idea: "",
    },
  );
  const save = useSave("streams", ["streams"], "Stream added", () => onOpenChange(false));
  const set = (k: string, v: unknown) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title={existing ? "Edit stream" : "Plan stream"}
      saving={save.isPending}
      onSave={() => {
        if (!String(form.title ?? "").trim()) {
          toast.error("Add a stream title");
          return;
        }
        save.mutate({
          id: existing?.id,
          values: {
            title: form.title,
            stream_date: form.stream_date || null,
            stream_time: form.stream_time || null,
            category: form.category,
            status: form.status,
            platform: form.platform,
            main_idea: form.main_idea || null,
          },
        });
      }}
    >
      <Field label="Stream title">
        <Input
          value={form.title ?? ""}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Friday Stream"
        />
      </Field>
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
        <Field label="Platform">
          <Picker
            value={form.platform}
            onChange={(v) => set("platform", v)}
            options={STREAM_PLATFORMS}
          />
        </Field>
        <Field label="Category">
          <Picker
            value={form.category}
            onChange={(v) => set("category", v)}
            options={STREAM_CATEGORIES}
          />
        </Field>
        <Field label="Status">
          <Picker value={form.status} onChange={(v) => set("status", v)} options={STREAM_STATUSES} />
        </Field>
      </div>
      <Field label="Main idea">
        <Textarea
          rows={3}
          value={form.main_idea ?? ""}
          onChange={(e) => set("main_idea", e.target.value)}
        />
      </Field>
    </Shell>
  );
}

export function IdeaDialog({
  open,
  onOpenChange,
  existing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: Row;
}) {
  const [form, setForm] = useState<Row>(
    existing ?? {
      title: "",
      description: "",
      type: "YouTube",
      priority: "Normal",
      status: "Unused",
      tags: [],
    },
  );
  const save = useSave("ideas", ["ideas"], "Idea saved", () => onOpenChange(false));
  const set = (k: string, v: unknown) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title={existing ? "Edit idea" : "Add idea"}
      saving={save.isPending}
      onSave={() => {
        if (!String(form.title ?? "").trim()) {
          toast.error("Add an idea title");
          return;
        }
        save.mutate({
          id: existing?.id,
          values: {
            title: form.title,
            description: form.description || null,
            type: form.type,
            priority: form.priority,
            status: form.status,
            tags: Array.isArray(form.tags)
              ? form.tags
              : String(form.tags ?? "")
                  .split(",")
                  .map((t: string) => t.trim())
                  .filter(Boolean),
          },
        });
      }}
    >
      <Field label="Idea title">
        <Input
          autoFocus
          value={form.title ?? ""}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Reacting to my oldest videos"
        />
      </Field>
      <Field label="Description">
        <Textarea
          rows={3}
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Type">
          <Picker value={form.type} onChange={(v) => set("type", v)} options={IDEA_TYPES} />
        </Field>
        <Field label="Priority">
          <Picker value={form.priority} onChange={(v) => set("priority", v)} options={PRIORITIES} />
        </Field>
        <Field label="Status">
          <Picker value={form.status} onChange={(v) => set("status", v)} options={IDEA_STATUSES} />
        </Field>
        <Field label="Tags (comma separated)">
          <Input
            value={Array.isArray(form.tags) ? form.tags.join(", ") : (form.tags ?? "")}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="Roblox, Funny"
          />
        </Field>
      </div>
    </Shell>
  );
}

export function GoalDialog({
  open,
  onOpenChange,
  existing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: Row;
}) {
  const [form, setForm] = useState<Row>(
    existing ?? {
      name: "",
      category: "YouTube",
      current_value: 0,
      target_value: 10,
      deadline: "",
    },
  );
  const save = useSave("goals", ["goals"], "Goal saved", () => onOpenChange(false));
  const set = (k: string, v: unknown) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title={existing ? "Edit goal" : "New goal"}
      saving={save.isPending}
      onSave={() => {
        if (!String(form.name ?? "").trim()) {
          toast.error("Add a goal name");
          return;
        }
        const current = Number(form.current_value) || 0;
        const target = Number(form.target_value) || 1;
        save.mutate({
          id: existing?.id,
          values: {
            name: form.name,
            category: form.category,
            current_value: current,
            target_value: target,
            deadline: form.deadline || null,
            completed: current >= target,
          },
        });
      }}
    >
      <Field label="Goal name">
        <Input
          value={form.name ?? ""}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Upload 4 YouTube videos this month"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          <Picker
            value={form.category}
            onChange={(v) => set("category", v)}
            options={GOAL_CATEGORIES}
          />
        </Field>
        <Field label="Deadline">
          <Input
            type="date"
            value={form.deadline ?? ""}
            onChange={(e) => set("deadline", e.target.value)}
          />
        </Field>
        <Field label="Current">
          <Input
            type="number"
            value={form.current_value ?? 0}
            onChange={(e) => set("current_value", e.target.value)}
          />
        </Field>
        <Field label="Target">
          <Input
            type="number"
            value={form.target_value ?? 0}
            onChange={(e) => set("target_value", e.target.value)}
          />
        </Field>
      </div>
    </Shell>
  );
}

export function AnalyticsDialog({
  open,
  onOpenChange,
  existing,
  defaultPlatform = "YouTube",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: Row;
  defaultPlatform?: string;
}) {
  const today = new Date();
  const [form, setForm] = useState<Row>(
    existing ?? {
      period: "monthly",
      platform: defaultPlatform,
      period_start: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`,
      period_end: "",
      followers_start: "",
      followers_end: "",
      followers_gained: 0,
      views: 0,
      posts: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      avg_viewers: "",
      watch_time: "",
      subs_gained: "",
    },
  );
  const save = useSave("analytics_entries", ["analytics_entries"], "Analytics updated", () =>
    onOpenChange(false),
  );
  const set = (k: string, v: unknown) => setForm((f: any) => ({ ...f, [k]: v }));
  const num = (v: unknown) => (v === "" || v === null || v === undefined ? null : Number(v));

  return (
    <Shell
      open={open}
      onOpenChange={onOpenChange}
      title={existing ? "Edit analytics entry" : "New analytics entry"}
      saving={save.isPending}
      onSave={() => {
        if (!form.period_start) {
          toast.error("Pick a start date");
          return;
        }
        save.mutate({
          id: existing?.id,
          values: {
            period: form.period,
            platform: form.platform,
            period_start: form.period_start,
            period_end: form.period_end || null,
            followers_start: num(form.followers_start),
            followers_end: num(form.followers_end),
            followers_gained: Number(form.followers_gained) || 0,
            views: Number(form.views) || 0,
            posts: Number(form.posts) || 0,
            likes: Number(form.likes) || 0,
            comments: Number(form.comments) || 0,
            shares: Number(form.shares) || 0,
            avg_viewers: num(form.avg_viewers),
            watch_time: num(form.watch_time),
            subs_gained: num(form.subs_gained),
          },
        });
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Period">
          <Picker
            value={form.period}
            onChange={(v) => set("period", v)}
            options={["monthly", "weekly"]}
          />
        </Field>
        <Field label="Platform">
          <Picker
            value={form.platform}
            onChange={(v) => set("platform", v)}
            options={ANALYTICS_PLATFORMS}
          />
        </Field>
        <Field label={form.period === "weekly" ? "Week start" : "Month start"}>
          <Input
            type="date"
            value={form.period_start ?? ""}
            onChange={(e) => set("period_start", e.target.value)}
          />
        </Field>
        <Field label={form.period === "weekly" ? "Week end" : "Month end (optional)"}>
          <Input
            type="date"
            value={form.period_end ?? ""}
            onChange={(e) => set("period_end", e.target.value)}
          />
        </Field>
        {form.period === "monthly" ? (
          <>
            <Field label="Followers at start">
              <Input
                type="number"
                value={form.followers_start ?? ""}
                onChange={(e) => set("followers_start", e.target.value)}
              />
            </Field>
            <Field label="Followers at end">
              <Input
                type="number"
                value={form.followers_end ?? ""}
                onChange={(e) => set("followers_end", e.target.value)}
              />
            </Field>
          </>
        ) : null}
        <Field label="Followers gained">
          <Input
            type="number"
            value={form.followers_gained ?? 0}
            onChange={(e) => set("followers_gained", e.target.value)}
          />
        </Field>
        <Field label="Views">
          <Input
            type="number"
            value={form.views ?? 0}
            onChange={(e) => set("views", e.target.value)}
          />
        </Field>
        <Field label="Posts">
          <Input
            type="number"
            value={form.posts ?? 0}
            onChange={(e) => set("posts", e.target.value)}
          />
        </Field>
        <Field label="Likes">
          <Input
            type="number"
            value={form.likes ?? 0}
            onChange={(e) => set("likes", e.target.value)}
          />
        </Field>
        <Field label="Comments">
          <Input
            type="number"
            value={form.comments ?? 0}
            onChange={(e) => set("comments", e.target.value)}
          />
        </Field>
        <Field label="Shares">
          <Input
            type="number"
            value={form.shares ?? 0}
            onChange={(e) => set("shares", e.target.value)}
          />
        </Field>
        {form.period === "monthly" ? (
          <>
            <Field label="Average viewers">
              <Input
                type="number"
                value={form.avg_viewers ?? ""}
                onChange={(e) => set("avg_viewers", e.target.value)}
              />
            </Field>
            <Field label="Watch time (hours)">
              <Input
                type="number"
                value={form.watch_time ?? ""}
                onChange={(e) => set("watch_time", e.target.value)}
              />
            </Field>
            <Field label="Subscribers gained">
              <Input
                type="number"
                value={form.subs_gained ?? ""}
                onChange={(e) => set("subs_gained", e.target.value)}
              />
            </Field>
          </>
        ) : null}
      </div>
    </Shell>
  );
}

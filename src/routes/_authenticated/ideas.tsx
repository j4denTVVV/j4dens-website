import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { deleteRow, fetchAll } from "@/lib/api";
import { chipClass, IDEA_STATUSES, IDEA_TYPES, PRIORITIES } from "@/lib/hub";
import { ConfirmDelete, EmptyState, PageHeader } from "@/components/hub/common";
import { IdeaDialog } from "@/components/hub/dialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/ideas")({
  head: () => ({
    meta: [
      { title: "Ideas — J4denTV Creator Hub" },
      { name: "description", content: "The J4denTV idea bank: save any idea in seconds." },
      { property: "og:title", content: "Ideas — J4denTV Creator Hub" },
      { property: "og:description", content: "The J4denTV idea bank: save any idea in seconds." },
    ],
  }),
  component: Ideas,
});

const PRIORITY_RANK: Record<string, number> = { "Must Make": 0, High: 1, Normal: 2, Low: 3 };

function Ideas() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ["ideas"],
    queryFn: () => fetchAll("ideas"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRow("ideas", id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Idea deleted");
    },
  });

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = ideas.filter((i: any) => {
      if (type !== "All" && i.type !== type) return false;
      if (status !== "All" && i.status !== status) return false;
      if (priority !== "All" && i.priority !== priority) return false;
      if (!q) return true;
      return `${i.title} ${i.description ?? ""} ${(i.tags ?? []).join(" ")}`
        .toLowerCase()
        .includes(q);
    });
    return [...list].sort((a: any, b: any) => {
      if (sort === "Oldest") return a.created_at.localeCompare(b.created_at);
      if (sort === "Priority")
        return (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
      if (sort === "Content Type") return String(a.type).localeCompare(String(b.type));
      return b.created_at.localeCompare(a.created_at);
    });
  }, [ideas, search, type, status, priority, sort]);

  return (
    <div>
      <PageHeader
        title="Idea Bank"
        subtitle="Save any idea the second you think of it."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Add Idea
          </Button>
        }
      />
      {creating ? <IdeaDialog open onOpenChange={() => setCreating(false)} /> : null}
      {editing ? (
        <IdeaDialog open onOpenChange={() => setEditing(null)} existing={editing} />
      ) : null}

      <div className="panel mb-6 flex flex-wrap items-center gap-3 p-4">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {[
          { value: type, set: setType, options: ["All", ...IDEA_TYPES], width: "w-44" },
          { value: status, set: setStatus, options: ["All", ...IDEA_STATUSES], width: "w-36" },
          { value: priority, set: setPriority, options: ["All", ...PRIORITIES], width: "w-36" },
          {
            value: sort,
            set: setSort,
            options: ["Newest", "Oldest", "Priority", "Content Type"],
            width: "w-40",
          },
        ].map((f, idx) => (
          <Select key={idx} value={f.value} onValueChange={f.set}>
            <SelectTrigger className={f.width}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {f.options.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {!isLoading && visible.length === 0 ? (
        <EmptyState
          title={ideas.length === 0 ? "No ideas saved yet." : "No ideas match those filters."}
          action={
            ideas.length === 0 ? (
              <Button onClick={() => setCreating(true)}>Save your first idea</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((i: any) => (
            <div key={i.id} className="panel panel-hover flex flex-col p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={chipClass(i.priority)}>{i.priority}</span>
                <span className={chipClass(i.status)}>{i.status}</span>
                <span className="text-xs text-muted-foreground">{i.type}</span>
              </div>
              <p className="mt-3 font-medium">{i.title}</p>
              {i.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{i.description}</p>
              ) : null}
              {(i.tags ?? []).length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {i.tags.map((t: string) => (
                    <span key={t} className="chip-base chip-grey">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="mt-4 flex justify-end gap-1">
                <Button variant="ghost" onClick={() => setEditing(i)}>
                  Edit
                </Button>
                <ConfirmDelete onConfirm={() => remove.mutate(i.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

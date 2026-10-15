import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Plus } from "lucide-react";
import { fetchAll, insertRow, updateRow } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { chipClass, shortDate, VIDEO_STATUSES } from "@/lib/hub";
import { EmptyState, PageHeader } from "@/components/hub/common";
import { VideoDialog } from "@/components/hub/dialogs";
import { CalendarBoard, type CalendarItem } from "@/components/hub/CalendarBoard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/youtube/")({
  head: () => ({
    meta: [
      { title: "YouTube Planner — J4denTV Creator Hub" },
      { name: "description", content: "Plan, create and track every J4denTV upload." },
      { property: "og:title", content: "YouTube Planner — J4denTV Creator Hub" },
      { property: "og:description", content: "Plan, create and track every J4denTV upload." },
    ],
  }),
  component: YouTubePlanner,
});

function YouTubePlanner() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["youtube_videos"],
    queryFn: () => fetchAll("youtube_videos"),
  });

  const qc = useQueryClient();
  const [quick, setQuick] = useState("");
  const quickAdd = useMutation({
    mutationFn: (title: string) => insertRow("youtube_videos", { working_title: title, status: "Idea", category: "Other", priority: "Normal" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["youtube_videos"] }); setQuick(""); toast.success("Video added to Idea"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const advance = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateRow("youtube_videos", id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["youtube_videos"] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const nextStatus = (s: string) => VIDEO_STATUSES[VIDEO_STATUSES.indexOf(s as never) + 1];

  const open = (id: string) => navigate({ to: "/youtube/$videoId", params: { videoId: id } });

  const calendarItems: CalendarItem[] = videos
    .filter((v: any) => v.planned_upload_date)
    .map((v: any) => ({
      date: v.planned_upload_date,
      label: v.working_title,
      kind: "upload" as const,
      onOpen: () => open(v.id),
    }));

  return (
    <div>
      <PageHeader
        title="YouTube Planner"
        subtitle="Plan, create and track every J4denTV upload."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> New Video
          </Button>
        }
      />
      <form className="panel mb-6 flex items-center gap-2 p-3" onSubmit={(e) => { e.preventDefault(); if (quick.trim()) quickAdd.mutate(quick.trim()); }}>
        <Input value={quick} onChange={(e) => setQuick(e.target.value)} placeholder="Quick add: type a video title and press Enter" className="border-0 bg-transparent" maxLength={150} />
        <Button type="submit" variant="studio" size="sm" disabled={!quick.trim() || quickAdd.isPending}>Add <ArrowRight className="size-4" /></Button>
      </form>
      {creating ? <VideoDialog open onOpenChange={() => setCreating(false)} /> : null}

      {!isLoading && videos.length === 0 ? (
        <EmptyState
          title="No YouTube videos planned yet."
          action={<Button onClick={() => setCreating(true)}>Plan your first video</Button>}
        />
      ) : (
        <Tabs defaultValue="board">
          <TabsList>
            <TabsTrigger value="board">Board</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {VIDEO_STATUSES.map((status) => {
                const group = videos.filter((v: any) => v.status === status);
                return (
                  <div key={status} className="rounded-xl bg-surface p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <span className={chipClass(status)}>{status}</span>
                      <span className="text-xs text-muted-foreground">{group.length}</span>
                    </div>
                    <div className="space-y-3">
                      {group.map((v: any) => (
                        <div key={v.id} className="panel panel-hover w-full p-3">
                        <button type="button" onClick={() => open(v.id)} className="w-full text-left">
                          <p className="text-sm font-medium">{v.working_title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {v.category} · upload {shortDate(v.planned_upload_date)}
                          </p>
                          <span className={`${chipClass(v.priority)} mt-2`}>{v.priority}</span>
                        </button>
                        {nextStatus(v.status) ? (
                          <button type="button" onClick={() => advance.mutate({ id: v.id, status: nextStatus(v.status)! })} className="mt-3 inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
                            Move to {nextStatus(v.status)} <ArrowRight className="size-3" />
                          </button>
                        ) : null}
                        </div>
                      ))}
                      {group.length === 0 ? (
                        <p className="px-1 py-3 text-xs text-muted-foreground">Empty</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <CalendarBoard items={calendarItems} />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <div className="panel overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Recording</TableHead>
                    <TableHead>Upload</TableHead>
                    <TableHead>Thumbnail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((v: any) => (
                    <TableRow
                      key={v.id}
                      onClick={() => open(v.id)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">{v.working_title}</TableCell>
                      <TableCell>{v.category}</TableCell>
                      <TableCell>
                        <span className={chipClass(v.status)}>{v.status}</span>
                      </TableCell>
                      <TableCell>
                        <span className={chipClass(v.priority)}>{v.priority}</span>
                      </TableCell>
                      <TableCell>{shortDate(v.planned_record_date)}</TableCell>
                      <TableCell>{shortDate(v.planned_upload_date)}</TableCell>
                      <TableCell>{v.thumbnail_done ? "Done" : "Pending"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

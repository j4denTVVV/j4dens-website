import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ExternalLink, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { insertRow } from "@/lib/api";
import { searchTwitchCreators, type CreatorResult } from "@/lib/platforms.functions";
import { PLATFORM_META, PlatformLogo, PlatformBadges } from "@/components/hub/platforms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Creator = { id: string; display_name: string; username: string | null; avatar_url: string | null; profiles: Record<string, string> | null };
export function CreatorSearch({ creators, onClose, onSelect }: { creators: Creator[]; onClose: () => void; onSelect: (c: Creator) => void }) {
  const qc = useQueryClient();
  const search = useServerFn(searchTwitchCreators);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [all, setAll] = useState(false);
  const [manual, setManual] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const handle = q.trim().replace(/^@/, "");
  useEffect(() => { const timer = setTimeout(() => { setDebounced(handle); setAll(false); }, 300); return () => clearTimeout(timer); }, [handle]);
  const { data, isFetching, error } = useQuery({ queryKey: ["creator-search", debounced], queryFn: () => search({ data: { query: debounced } }), enabled: debounced.length >= 2, staleTime: 60000, retry: false });
  const saved = creators.filter((c) => [c.display_name, c.username, ...Object.values(c.profiles ?? {})].some((v) => v?.toLowerCase().includes(handle.toLowerCase())));
  const save = useMutation({
    mutationFn: (result?: CreatorResult) => {
      const existing = result ? creators.find((c) => c.profiles?.[result.platform]?.toLowerCase() === result.username.toLowerCase()) : undefined;
      if (existing) return Promise.resolve(existing);
      return insertRow<Creator>("creators", result ? { display_name: result.display_name, username: result.username, avatar_url: result.avatar_url, profiles: { [result.platform]: result.username } } : { display_name: handle, username: handle, profiles: Object.fromEntries(Object.entries(profiles).filter(([, v]) => v.trim())) });
    },
    onSuccess: (creator) => { qc.invalidateQueries({ queryKey: ["creators"] }); onSelect(creator); },
    onError: (e) => toast.error(e.message),
  });
  return <Dialog open onOpenChange={onClose}><DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto"><DialogHeader><DialogTitle className="section-title text-3xl">Find creator</DialogTitle></DialogHeader>
    <div className="relative"><Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><Input aria-label="Search creator" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Creator or @username" className="h-12 pl-10" /></div>
    <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
      <p className="eyebrow flex items-center justify-between">Channels {isFetching ? <Loader2 className="size-4 animate-spin" /> : <PlatformLogo p="Twitch" />}</p>
      {error ? <p role="alert" className="break-words text-xs text-destructive">{error.message}</p> : null}
      {debounced.length < 2 ? <p className="py-2 text-sm text-muted-foreground">Search Twitch channels</p> : null}
      {data?.status === "not_connected" ? <p className="text-xs text-muted-foreground">Twitch not connected</p> : null}
      {data?.status === "connected" && !isFetching && !data.results.length ? <p className="py-2 text-sm text-muted-foreground">No channels found</p> : null}
      {(data?.results ?? []).slice(0, all ? 20 : 4).map((r) => <Button key={r.id} variant="ghost" disabled={save.isPending} onClick={() => save.mutate(r)} className="h-auto w-full justify-start gap-3 px-2 py-3 text-left normal-case">
        <img src={r.avatar_url} alt="" className="size-10 shrink-0 rounded-full object-cover" /><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{r.display_name}</span><span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><PlatformLogo p={r.platform} size={12} /><span className="truncate">@{r.username}</span>{r.language ? <span>{r.language.toUpperCase()}</span> : null}</span></span>
      </Button>)}
      {(data?.results.length ?? 0) > 4 ? <Button variant="outline" className="w-full" onClick={() => setAll(!all)}>{all ? "Show less" : "Show all"}<ArrowRight className="size-4" /></Button> : null}
    </div>
    {saved.length ? <div className="space-y-2"><p className="eyebrow">Saved creators</p>{saved.map((c) => <Button key={c.id} variant="ghost" className="h-auto w-full justify-start gap-3 py-3" onClick={() => onSelect(c)}>{c.avatar_url ? <img src={c.avatar_url} alt="" className="size-10 rounded-full object-cover" /> : <span className="grid size-10 place-items-center rounded-full bg-muted">{c.display_name[0]}</span>}<span className="min-w-0 flex-1 text-left"><span className="block truncate">{c.display_name}</span><span className="text-xs text-muted-foreground">@{c.username}</span></span><PlatformBadges list={Object.keys(c.profiles ?? {})} /></Button>)}</div> : null}
    <Button variant="outline" onClick={() => setManual(!manual)}>Link creator manually</Button>
    {manual && handle ? <div className="space-y-3 border-t border-border pt-3">{(["YouTube", "Twitch", "TikTok", "Instagram"] as const).map((p) => <div key={p} className="flex items-center gap-2"><PlatformLogo p={p} /><Input aria-label={`${p} username`} placeholder={`${p} username`} value={profiles[p] ?? ""} onChange={(e) => setProfiles({ ...profiles, [p]: e.target.value.replace(/^@/, "") })} /><Button variant="ghost" size="icon" asChild><a aria-label={`Search ${p}`} href={PLATFORM_META[p].search(handle)} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /></a></Button></div>)}<Button disabled={save.isPending} className="w-full" onClick={() => save.mutate(undefined)}>Save @{handle}</Button></div> : null}
  </DialogContent></Dialog>;
}
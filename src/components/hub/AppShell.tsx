import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarDays,
  Clapperboard,
  Clock3,
  Handshake,
  Headphones,
  Home,
  Lightbulb,
  LogOut,
  MapPin,
  Menu,
  MonitorUp,
  Plus,
  Radio,
  Search,
  Settings as SettingsIcon,
  Target,
  Trophy,
  Video,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { fetchAll, fetchSettings } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ItemDialog, emptyItem } from "@/components/hub/HubItemsPage";
import { ProfileAvatar } from "@/components/hub/studio";
import {
  AnalyticsDialog,
  GoalDialog,
  IdeaDialog,
  StreamDialog,
  VideoDialog,
} from "@/components/hub/dialogs";

const NAV = [
  { label: "", items: [{ to: "/dashboard", label: "Overview", icon: Home, search: undefined }] },
  {
    label: "Plan",
    items: [
      { to: "/live", label: "Live Planner", icon: Radio, search: undefined },
      { to: "/youtube", label: "YouTube", icon: Video, search: undefined },
      { to: "/collabs", label: "Collabs", icon: Handshake, search: undefined },
      { to: "/ideas", label: "Ideas", icon: Lightbulb, search: undefined },
    ],
  },
  {
    label: "Track",
    items: [
      { to: "/analytics", label: "Analytics", icon: BarChart3, search: undefined },
      { to: "/calendar", label: "Calendar", icon: CalendarDays, search: undefined },
      { to: "/goals", label: "Goals", icon: Target, search: undefined },
    ],
  },
  {
    label: "Resources",
    items: [
      { to: "/tools", label: "Creator Tools", icon: MonitorUp, search: undefined },
      { to: "/equipment", label: "Equipment", icon: Clapperboard, search: undefined },
    ],
  },
  { label: "", items: [{ to: "/settings", label: "Settings", icon: SettingsIcon, search: undefined }] },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-5">
      {NAV.map((group, gi) => (
        <div key={gi}>
          {group.label ? (
            <p className="eyebrow mb-2 px-3 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-sidebar-muted">
              {group.label}
            </p>
          ) : null}
          <div className="space-y-1">
            {group.items.map(({ to, label, icon: Icon, search }) => {
              const active = pathname === to || pathname.startsWith(`${to}/`);
              return (
                <Link
                  key={to}
                  to={to}
                  search={search as never}
                  onClick={onNavigate}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                    active
                      ? "bg-foreground/10 font-medium text-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.12)]"
                      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                  {active ? <span className="ml-auto size-1.5 rounded-full bg-foreground" /> : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Brand({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-sidebar-border px-3 pb-5 pt-4">
      <ProfileAvatar size={46} />
      <div>
        <p className="section-title text-shine text-2xl leading-none">{name}</p>
        <p className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-sidebar-muted">Creator HQ</p>
      </div>
    </div>
  );
}

type QAKind = "stream" | "challenge" | "marathon" | "subathon" | "irl" | "collab" | "video" | "idea" | "goal";
const QA: { k: QAKind; label: string; icon: typeof Radio }[] = [
  { k: "stream", label: "Stream", icon: Radio },
  { k: "challenge", label: "Challenge", icon: Trophy },
  { k: "marathon", label: "Marathon", icon: Clock3 },
  { k: "subathon", label: "Subathon", icon: Headphones },
  { k: "irl", label: "IRL", icon: MapPin },
  { k: "collab", label: "Collab", icon: Handshake },
  { k: "video", label: "YouTube", icon: Video },
  { k: "idea", label: "Idea", icon: Lightbulb },
  { k: "goal", label: "Goal", icon: Target },
];

export function QuickAdd({ label = "Quick Add" }: { label?: string }) {
  const [grid, setGrid] = useState(false);
  const [open, setOpen] = useState<null | QAKind | "analytics">(null);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const close = () => setOpen(null);
  const pick = (k: QAKind) => {
    setGrid(false);
    if (k === "collab") navigate({ to: "/collabs" });
    else setOpen(k);
  };
  const hubKind = open === "challenge" || open === "marathon" || open === "subathon" || open === "irl" ? open : null;
  return (
    <>
      <Button onClick={() => setGrid(true)}>
        <Plus className="size-4" /> <span className="hidden sm:inline">{label}</span>
      </Button>
      <Dialog open={grid} onOpenChange={setGrid}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="section-title text-4xl">What are you adding?</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            {QA.map(({ k, label: l, icon: Icon }) => (
              <button
                key={k}
                type="button"
                onClick={() => pick(k)}
                className="card-secondary lift flex flex-col items-center gap-2 rounded-2xl px-3 py-5 text-sm font-medium"
              >
                <Icon className="size-6" />
                {l}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      {open === "video" ? <VideoDialog open onOpenChange={close} /> : null}
      {open === "stream" ? <StreamDialog open onOpenChange={close} /> : null}
      {open === "idea" ? <IdeaDialog open onOpenChange={close} /> : null}
      {open === "analytics" ? <AnalyticsDialog open onOpenChange={close} /> : null}
      {open === "goal" ? <GoalDialog open onOpenChange={close} /> : null}
      {hubKind ? (
        <ItemDialog value={emptyItem(hubKind)} onClose={close} onSaved={() => qc.invalidateQueries({ queryKey: ["hub_items"] })} />
      ) : null}
    </>
  );
}

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: videos = [] } = useQuery({
    queryKey: ["youtube_videos"],
    queryFn: () => fetchAll("youtube_videos"),
  });
  const { data: streams = [] } = useQuery({ queryKey: ["streams"], queryFn: () => fetchAll("streams") });
  const { data: ideas = [] } = useQuery({ queryKey: ["ideas"], queryFn: () => fetchAll("ideas") });
  const { data: items = [] } = useQuery({ queryKey: ["hub_items"], queryFn: () => fetchAll("hub_items") });
  const { data: goals = [] } = useQuery({ queryKey: ["goals"], queryFn: () => fetchAll("goals") });
  const { data: collabs = [] } = useQuery({ queryKey: ["collabs"], queryFn: () => fetchAll("collabs") });
  const { data: creators = [] } = useQuery({ queryKey: ["creators"], queryFn: () => fetchAll("creators") });
  const { data: setup = [] } = useQuery({ queryKey: ["setup_items"], queryFn: () => fetchAll("setup_items") });
  const go = (fn: () => void) => () => { setOpen(false); fn(); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Search className="size-4" />
        <span className="hidden sm:inline text-muted-foreground">Search everything</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search plans, collabs, videos, ideas, goals, tools..." />
        <CommandList>
          <CommandEmpty>Nothing found.</CommandEmpty>
          <CommandGroup heading="YouTube videos">
            {videos.map((v: any) => (
              <CommandItem
                key={v.id}
                value={`${v.working_title} ${v.final_title ?? ""} ${v.category}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/youtube/$videoId", params: { videoId: v.id } });
                }}
              >
                🎬 {v.working_title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Streams">
            {streams.map((s: any) => (
              <CommandItem
                key={s.id}
                value={`${s.title} ${s.category} ${s.platform}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/streams/$streamId", params: { streamId: s.id } });
                }}
              >
                🔴 {s.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Ideas">
            {ideas.map((i: any) => (
              <CommandItem
                key={i.id}
                value={`${i.title} ${i.description ?? ""} ${(i.tags ?? []).join(" ")}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/ideas" });
                }}
              >
                💡 {i.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Plans">
            {items.map((i: any) => (
              <CommandItem key={i.id} value={`${i.title} ${i.kind} ${i.notes ?? ""}`}
                onSelect={go(() => i.kind === "overlay" || i.kind === "equipment"
                  ? navigate({ to: "/assets", search: { tab: i.kind } })
                  : i.kind === "collab" ? navigate({ to: "/collabs" })
                  : navigate({ to: "/live", search: { tab: i.kind } }))}>
                {i.title} <span className="ml-auto text-xs text-muted-foreground">{i.kind}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Collabs & creators">
            {collabs.map((c: any) => (
              <CommandItem key={c.id} value={`${c.title} collab`} onSelect={go(() => navigate({ to: "/collabs" }))}>🤝 {c.title}</CommandItem>
            ))}
            {creators.map((c: any) => (
              <CommandItem key={c.id} value={`${c.display_name} ${c.username ?? ""} creator`} onSelect={go(() => navigate({ to: "/collabs" }))}>👤 {c.display_name}</CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Goals & equipment">
            {goals.map((g: any) => (
              <CommandItem key={g.id} value={`${g.name} goal`} onSelect={go(() => navigate({ to: "/goals" }))}>🎯 {g.name}</CommandItem>
            ))}
            {setup.map((e: any) => (
              <CommandItem key={e.id} value={`${e.name} ${e.category ?? ""} equipment`} onSelect={go(() => navigate({ to: "/equipment" }))}>🎧 {e.name}</CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Tools">
            {["StreamElements", "Streamlabs", "7TV", "StreamCharts", "OBS", "Metricool", "Notion"].map((t) => (
              <CommandItem key={t} value={`${t} tool`} onSelect={go(() => navigate({ to: "/tools" }))}>🛠 {t}</CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const creatorName = settings?.creator_name ?? "J4denTV";

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/hq", replace: true });
  };

  return (
    <div className="hub-shell min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-3 py-2 lg:flex">
        <Brand name={creatorName} />
        <div className="flex-1 overflow-y-auto py-6">
          <NavLinks />
        </div>
        <Button variant="ghost" className="justify-start border-t border-sidebar-border text-muted-foreground" onClick={signOut}>
          <LogOut className="size-4" /> Lock Hub
        </Button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 overflow-y-auto border-sidebar-border bg-sidebar p-3">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Brand name={creatorName} />
                <div className="py-6"><NavLinks onNavigate={() => setMobileNavOpen(false)} /></div>
                <Button
                  variant="ghost"
                  className="mt-4 w-full justify-start text-muted-foreground"
                  onClick={signOut}
                >
                  <LogOut className="size-4" /> Lock Hub
                </Button>
              </SheetContent>
            </Sheet>
            <span className="section-title text-lg lg:hidden">{creatorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <GlobalSearch />
            <QuickAdd label="Quick Add" />
          </div>
        </header>
        <main className="animate-page mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

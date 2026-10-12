import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { fetchSettings, saveSettings, type Settings } from "@/lib/api";
import { getConnectedStats } from "@/lib/platforms.functions";
import { supabase } from "@/integrations/supabase/client";
import { Field, PageHeader } from "@/components/hub/common";
import { PLATFORMS, PlatformLogo } from "@/components/hub/platforms";
import { PlatformSelector, FormAction } from "@/components/hub/visual-selectors";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — J4denTV Creator Hub" },
      { name: "description", content: "Profile, connected accounts, targets and security for the J4denTV Creator Hub." },
      { property: "og:title", content: "Settings — J4denTV Creator Hub" },
      { property: "og:description", content: "Profile, connected accounts, targets and security for the J4denTV Creator Hub." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SettingsPage,
});

const NUMS = [
  ["target_videos", "Videos / month"],
  ["target_streams", "Streams / month"],
  ["target_shorts", "Shorts / month"],
  ["target_followers", "Followers target"],
] as const;

function Accounts() {
  const getStats = useServerFn(getConnectedStats);
  const { data = [], isLoading } = useQuery({ queryKey: ["connected-stats"], queryFn: () => getStats() });
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {PLATFORMS.map((p) => {
        const s = data.find((d) => d.platform === p);
        const on = s?.status === "connected";
        return (
          <div key={p} className={`card-minimal flex items-center gap-4 p-5 ${on ? "border-foreground/40" : ""}`}>
            <PlatformLogo p={p} size={28} />
            <div className="flex-1">
              <p className="section-title text-xl">{p.toUpperCase()}</p>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Checking…" : on ? `${s?.username ? "@" + s.username + " · " : ""}${s?.followers != null ? s.followers.toLocaleString("en-GB") + " followers" : "connected"}` : "NOT CONNECTED"}
              </p>
            </div>
            {on ? <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest"><Check className="size-3" /> CONNECTED</span>
              : <Button size="sm" variant="outline" onClick={() => toast.info(`Ask in chat to connect ${p} — it needs your approval.`)}>CONNECT</Button>}
          </div>
        );
      })}
    </div>
  );
}

function Security() {
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState(""); const [busy, setBusy] = useState(false);
  const change = async () => {
    if (pw.length < 8) { toast.error("Use at least 8 characters"); return; }
    if (pw !== pw2) { toast.error("Passwords don't match"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Password changed"); setPw(""); setPw2(""); }
  };
  return (
    <div className="max-w-md space-y-4">
      <Field label="New password"><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
      <Field label="Confirm password"><Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></Field>
      <FormAction disabled={busy} onClick={change}>{busy ? "Saving…" : "Change password"}</FormAction>
    </div>
  );
}

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const [form, setForm] = useState<Partial<Settings>>({});
  useEffect(() => { if (data) setForm(data); }, [data]);
  const f = form as any;

  const save = async () => {
    try {
      const { user_id: _u, ...rest } = form as Settings;
      await saveSettings(rest);
      await qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    } catch (e) { toast.error((e as Error).message); }
  };
  const SaveBtn = <FormAction onClick={save}>Save settings</FormAction>;

  return (
    <div className="animate-page max-w-4xl">
      <PageHeader title="Settings" subtitle="Make the hub yours." />
      <Tabs defaultValue="profile">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="profile">PROFILE</TabsTrigger>
          <TabsTrigger value="accounts">CONNECTED ACCOUNTS</TabsTrigger>
          <TabsTrigger value="targets">TARGETS</TabsTrigger>
          <TabsTrigger value="security">SECURITY</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="card-primary space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Greeting name"><Input value={f.greeting_name ?? ""} onChange={(e) => setForm({ ...form, greeting_name: e.target.value })} /></Field>
            <Field label="Creator name"><Input value={f.creator_name ?? ""} onChange={(e) => setForm({ ...form, creator_name: e.target.value })} /></Field>
          </div>
          <Field label="Bio"><Textarea rows={3} value={f.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value } as any)} /></Field>
          <Field label="Main platform"><PlatformSelector single value={f.default_platform ? [f.default_platform] : []} onChange={(v) => setForm({ ...form, default_platform: v[0] ?? "Twitch" })} /></Field>
          <Field label="Timezone"><Input value={f.timezone ?? ""} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></Field>
          {SaveBtn}
        </TabsContent>
        <TabsContent value="accounts" className="card-primary p-6"><Accounts /></TabsContent>
        <TabsContent value="targets" className="card-primary space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-4">
            {NUMS.map(([k, label]) => (
              <Field key={k} label={label}><Input type="number" min={0} value={f[k] ?? 0} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} /></Field>
            ))}
          </div>
          {SaveBtn}
        </TabsContent>
        <TabsContent value="security" className="card-primary p-6"><Security /></TabsContent>
      </Tabs>
    </div>
  );
}

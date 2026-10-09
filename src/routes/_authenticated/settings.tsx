import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchSettings, saveSettings, type Settings } from "@/lib/api";
import { Field, PageHeader } from "@/components/hub/common";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — J4denTV Creator Hub" },
      { name: "description", content: "Personalise the J4denTV Creator Hub." },
      { property: "og:title", content: "Settings — J4denTV Creator Hub" },
      { property: "og:description", content: "Personalise the J4denTV Creator Hub." },
    ],
  }),
  component: SettingsPage,
});

const TEXT = [
  ["greeting_name", "Greeting name"],
  ["creator_name", "Creator name"],
  ["timezone", "Timezone"],
  ["default_platform", "Default platform"],
] as const;
const NUMS = [
  ["target_videos", "Monthly videos target"],
  ["target_streams", "Monthly streams target"],
  ["target_shorts", "Monthly shorts target"],
  ["target_followers", "Followers target"],
] as const;

function SettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const [form, setForm] = useState<Partial<Settings>>({});
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = async () => {
    try {
      const { user_id: _u, ...rest } = form as Settings & { socials?: unknown };
      await saveSettings(rest);
      await qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Make the hub yours." />
      <div className="panel space-y-4 p-6">
        {TEXT.map(([k, label]) => (
          <Field key={k} label={label}>
            <Input value={(form[k] as string) ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          </Field>
        ))}
        <div className="grid gap-4 sm:grid-cols-2">
          {NUMS.map(([k, label]) => (
            <Field key={k} label={label}>
              <Input
                type="number"
                value={(form[k] as number) ?? 0}
                onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
              />
            </Field>
          ))}
        </div>
        <Button onClick={save}>Save</Button>
      </div>
    </div>
  );
}

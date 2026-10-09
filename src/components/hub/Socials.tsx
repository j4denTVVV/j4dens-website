import { ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSettings } from "@/lib/api";

const FALLBACK = {
  x: "j4denTV",
  tiktok: "j4dentv_",
  twitch: "j4denTV",
  youtube: "j4denTV",
  instagram: "j4denTV",
  discord: "",
};

type Platform = { key: keyof typeof FALLBACK; name: string; url: (h: string) => string };

const PLATFORMS: Platform[] = [
  { key: "twitch", name: "Twitch", url: (h) => `https://twitch.tv/${h}` },
  { key: "youtube", name: "YouTube", url: (h) => `https://youtube.com/@${h}` },
  { key: "tiktok", name: "TikTok", url: (h) => `https://tiktok.com/@${h}` },
  { key: "instagram", name: "Instagram", url: (h) => `https://instagram.com/${h}` },
  { key: "x", name: "X", url: (h) => `https://x.com/${h}` },
];

function platformUrl(p: Platform, socials: Record<string, string> | undefined) {
  const handle = (socials?.[p.key] as string | undefined) || FALLBACK[p.key];
  return { handle, url: p.url(handle) };
}

export function SocialsCard() {
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const socials = settings?.socials as Record<string, string> | undefined;
  const visible = PLATFORMS.map((p) => ({ ...p, ...platformUrl(p, socials) })).filter((p) => p.handle);

  return (
    <section className="panel p-6">
      <p className="section-title text-lg">My socials</p>
      <p className="text-sm text-muted-foreground">Follow 4TV — FOUR THA VISION</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {visible.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="panel-hover flex items-center justify-between rounded-lg border border-border px-4 py-3"
          >
            <span>
              <span className="block text-sm font-medium">{s.name}</span>
              <span className="block text-xs text-muted-foreground">@{s.handle}</span>
            </span>
            <ExternalLink className="size-4 text-muted-foreground" />
          </a>
        ))}
      </div>
    </section>
  );
}

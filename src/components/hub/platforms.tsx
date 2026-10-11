import type { IconType } from "react-icons";
import { SiTwitch, SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiX } from "react-icons/si";

export const PLATFORMS = ["Twitch", "YouTube", "TikTok", "Instagram", "Facebook", "X"] as const;
export type Platform = (typeof PLATFORMS)[number];

/** Brand colours are allowed: they are the real platform logos. */
export const PLATFORM_META: Record<Platform, { icon: IconType; color: string; profile: (h: string) => string; search: (q: string) => string }> = {
  Twitch: { icon: SiTwitch, color: "#9146FF", profile: (h) => `https://www.twitch.tv/${h}`, search: (q) => `https://www.twitch.tv/search?term=${encodeURIComponent(q)}` },
  YouTube: { icon: SiYoutube, color: "#FF0033", profile: (h) => `https://www.youtube.com/@${h}`, search: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=EgIQAg%253D%253D` },
  TikTok: { icon: SiTiktok, color: "#FFFFFF", profile: (h) => `https://www.tiktok.com/@${h}`, search: (q) => `https://www.tiktok.com/search/user?q=${encodeURIComponent(q)}` },
  Instagram: { icon: SiInstagram, color: "#E1306C", profile: (h) => `https://www.instagram.com/${h}`, search: (q) => `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(q)}` },
  Facebook: { icon: SiFacebook, color: "#1877F2", profile: (h) => `https://www.facebook.com/${h}`, search: (q) => `https://www.facebook.com/search/top?q=${encodeURIComponent(q)}` },
  X: { icon: SiX, color: "#FFFFFF", profile: (h) => `https://x.com/${h}`, search: (q) => `https://x.com/search?q=${encodeURIComponent(q)}&f=user` },
};

export function isPlatform(p: string): p is Platform {
  return (PLATFORMS as readonly string[]).includes(p);
}

export function PlatformLogo({ p, size = 14 }: { p: string; size?: number }) {
  if (!isPlatform(p)) return null;
  const { icon: Icon, color } = PLATFORM_META[p];
  return <Icon size={size} color={color} aria-label={p} />;
}

export function PlatformBadges({ list }: { list?: string[] | null }) {
  const ps = (list ?? []).filter(isPlatform);
  if (!ps.length) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      {ps.map((p) => (
        <span key={p} title={p} className="grid size-6 place-items-center rounded-full border border-border bg-background/60">
          <PlatformLogo p={p} size={12} />
        </span>
      ))}
    </span>
  );
}

export { PlatformSelector as PlatformPicker } from "@/components/hub/visual-selectors";

export const VIDEO_CATEGORIES = [
  "Gaming",
  "Reaction",
  "Challenge",
  "IRL",
  "Commentary",
  "Storytime",
  "Other",
] as const;

export const VIDEO_STATUSES = [
  "Idea",
  "Planning",
  "Ready to Record",
  "Recorded",
  "Editing",
  "Thumbnail",
  "Scheduled",
  "Uploaded",
] as const;

export const PRIORITIES = ["Low", "Normal", "High", "Must Make"] as const;

export const STREAM_PLATFORMS = ["Twitch", "YouTube", "TikTok", "Multi-stream"] as const;
export const STREAM_CATEGORIES = [
  "Just Chatting",
  "Gaming",
  "Reaction",
  "Challenge",
  "IRL",
  "Community",
  "Other",
] as const;
export const STREAM_STATUSES = ["Idea", "Planned", "Ready", "Live Completed", "Cancelled"] as const;

export const IDEA_TYPES = [
  "YouTube",
  "Stream",
  "TikTok / Short",
  "Series",
  "Challenge",
  "Reaction",
  "IRL",
  "Other",
] as const;
export const IDEA_STATUSES = ["Unused", "Considering", "Planned", "Used"] as const;

export const ANALYTICS_PLATFORMS = ["YouTube", "TikTok", "Instagram", "Twitch", "Facebook"] as const;
export const GOAL_CATEGORIES = [
  "YouTube",
  "Streaming",
  "TikTok",
  "Instagram",
  "Community",
  "General",
] as const;

const CHIP: Record<string, string> = {
  Idea: "chip-grey",
  Planning: "chip-violet",
  "Ready to Record": "chip-blue",
  Recorded: "chip-cyan",
  Editing: "chip-amber",
  Thumbnail: "chip-amber",
  Scheduled: "chip-pink",
  Uploaded: "chip-green",
  Planned: "chip-violet",
  Ready: "chip-blue",
  "Live Completed": "chip-green",
  Cancelled: "chip-red",
  Unused: "chip-grey",
  Considering: "chip-blue",
  Used: "chip-green",
  Low: "chip-grey",
  Normal: "chip-blue",
  High: "chip-amber",
  "Must Make": "chip-red",
};

export function chipClass(value: string | null | undefined) {
  return `chip-base ${CHIP[value ?? ""] ?? "chip-grey"}`;
}

export function formatNumber(n: number | null | undefined) {
  if (n === null || n === undefined || Number.isNaN(n)) return "0";
  return new Intl.NumberFormat("en-GB").format(n);
}

export function percentChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

export function monthKey(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y ?? 2000, (m ?? 1) - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export function shortDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function daysUntil(value: string | null | undefined) {
  if (!value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

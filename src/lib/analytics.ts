export const RANGES = [
  { key: "7d", label: "7 DAYS" },
  { key: "30d", label: "30 DAYS" },
  { key: "3m", label: "3 MONTHS" },
  { key: "6m", label: "6 MONTHS" },
  { key: "ytd", label: "THIS YEAR" },
] as const;
export type RangeKey = (typeof RANGES)[number]["key"];

/** Start date (inclusive) for a time filter, relative to `now`. */
export function rangeStart(key: RangeKey, now = new Date()): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (key === "7d") d.setDate(d.getDate() - 7);
  else if (key === "30d") d.setDate(d.getDate() - 30);
  else if (key === "3m") d.setMonth(d.getMonth() - 3);
  else if (key === "6m") d.setMonth(d.getMonth() - 6);
  else return new Date(now.getFullYear(), 0, 1);
  return d;
}

export type Entry = {
  platform: string;
  period_start: string;
  followers_end: number | null;
  followers_gained: number;
  views: number;
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  avg_viewers: number | null;
  watch_time: number | null;
  subs_gained: number | null;
};

export function inRange<T extends { period_start: string }>(rows: T[], key: RangeKey, now = new Date()) {
  const start = rangeStart(key, now).toISOString().slice(0, 10);
  return rows.filter((r) => r.period_start >= start);
}

/** Sum a field; null when no row has a value (so the UI shows DATA NOT AVAILABLE). */
export function sumOrNull(rows: Entry[], k: keyof Entry): number | null {
  const vals = rows.map((r) => r[k]).filter((v): v is number => typeof v === "number");
  return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
}
export function maxOrNull(rows: Entry[], k: keyof Entry): number | null {
  const vals = rows.map((r) => r[k]).filter((v): v is number => typeof v === "number");
  return vals.length ? Math.max(...vals) : null;
}
export function avgOrNull(rows: Entry[], k: keyof Entry): number | null {
  const vals = rows.map((r) => r[k]).filter((v): v is number => typeof v === "number");
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
}
export function latestFollowers(rows: Entry[]): number | null {
  const withF = rows.filter((r) => r.followers_end != null).sort((a, b) => b.period_start.localeCompare(a.period_start));
  return withF[0]?.followers_end ?? null;
}

/** Percent change between two numbers, or null when the previous value is missing/zero. */
export function pctChange(cur: number | null, prev: number | null): number | null {
  if (cur == null || !prev) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

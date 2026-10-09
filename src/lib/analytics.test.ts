import { describe, expect, it } from "vitest";
import { avgOrNull, inRange, pctChange, rangeStart, sumOrNull, type Entry } from "./analytics";

const now = new Date(2026, 9, 9); // 9 Oct 2026
const e = (period_start: string, extra: Partial<Entry> = {}): Entry => ({
  platform: "Twitch", period_start, followers_end: null, followers_gained: 0, views: 0, posts: 0,
  likes: 0, comments: 0, shares: 0, avg_viewers: null, watch_time: null, subs_gained: null, ...extra,
});

describe("analytics time filters", () => {
  it("THIS YEAR starts on 1 January", () => {
    expect(rangeStart("ytd", now).toDateString()).toBe(new Date(2026, 0, 1).toDateString());
  });
  it("7 DAYS excludes older entries", () => {
    expect(inRange([e("2026-10-05"), e("2026-09-20")], "7d", now)).toHaveLength(1);
  });
});

describe("never invent data", () => {
  it("metric with no saved values is null (DATA NOT AVAILABLE)", () => {
    expect(avgOrNull([e("2026-10-05")], "avg_viewers")).toBeNull();
    expect(sumOrNull([], "views")).toBeNull();
  });
  it("percent change needs a previous value", () => {
    expect(pctChange(10, null)).toBeNull();
    expect(pctChange(118, 100)).toBe(18);
  });
});

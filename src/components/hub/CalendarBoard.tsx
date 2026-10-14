import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CalendarItem = {
  date: string;
  label: string;
  kind: "upload" | "record" | "stream" | "goal" | "event";
  onOpen?: () => void;
};

const ICON: Record<CalendarItem["kind"], string> = {
  upload: "🎬",
  record: "🎥",
  stream: "🔴",
  goal: "🎯",
  event: "⭐",
};

type View = "month" | "week" | "agenda";

const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function ItemButton({ item }: { item: CalendarItem }) {
  return (
    <button
      type="button"
      onClick={item.onOpen}
      className="block w-full truncate rounded-sm border-l border-primary bg-accent/60 px-1 py-0.5 text-left text-[0.68rem] hover:bg-accent"
      title={item.label}
    >
      {ICON[item.kind]} {item.label}
    </button>
  );
}

export function CalendarBoard({ items }: { items: CalendarItem[] }) {
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const today = keyOf(new Date());

  const shift = (dir: number) => {
    const d = new Date(cursor);
    if (view === "week") d.setDate(d.getDate() + 7 * dir);
    else d.setMonth(d.getMonth() + dir, 1);
    setCursor(d);
  };

  const { cells, title, week } = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: Array<{ day: number | null; key: string }> = [];
    for (let i = 0; i < startOffset; i += 1) list.push({ day: null, key: `pad-${i}` });
    for (let d = 1; d <= daysInMonth; d += 1) list.push({ day: d, key: `${year}-${pad(month + 1)}-${pad(d)}` });
    const monday = new Date(cursor);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const w = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
    const t =
      view === "week"
        ? `${w[0]!.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${w[6]!.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
        : first.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    return { cells: list, title: t, week: w };
  }, [cursor, view]);

  const agenda = useMemo(
    () => [...items].filter((i) => i.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    [items, today],
  );

  return (
    <div className="panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title text-lg">{view === "agenda" ? "Upcoming" : title}</h2>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Calendar view" className="flex gap-1">
            {(["month", "week", "agenda"] as View[]).map((v) => (
              <Button key={v} type="button" variant="choice" size="sm" aria-pressed={view === v} className="visual-choice h-8 px-3 text-xs uppercase" onClick={() => setView(v)}>
                {v}
              </Button>
            ))}
          </div>
          {view !== "agenda" && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" aria-label="Previous" onClick={() => shift(-1)}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Next" onClick={() => shift(1)}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {view === "agenda" ? (
        agenda.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nothing planned yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {agenda.map((item, idx) => (
              <li key={`${item.date}-${idx}`}>
                <button type="button" onClick={item.onOpen} className="flex w-full items-center gap-4 py-3 text-left hover:bg-accent/40">
                  <span className="w-28 shrink-0 text-xs uppercase tracking-wide text-muted-foreground">
                    {new Date(item.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <span className="text-sm">{ICON[item.kind]} {item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )
      ) : view === "week" ? (
        <div className="grid gap-2 md:grid-cols-7">
          {week.map((d) => {
            const k = keyOf(d);
            const dayItems = items.filter((i) => i.date === k);
            return (
              <div key={k} className={`min-h-40 rounded-md border border-border bg-surface p-2 ${k === today ? "ring-1 ring-primary" : ""}`}>
                <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                  {d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" })}
                </p>
                <div className="space-y-1">
                  {dayItems.map((item, idx) => <ItemButton key={idx} item={item} />)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-[0.65rem] tracking-wide text-muted-foreground uppercase">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map(({ day, key }) => {
              const dayItems = day ? items.filter((i) => i.date === key) : [];
              return (
                <div key={key} className={`min-h-20 rounded-md border p-1.5 text-left text-xs ${day ? "border-border bg-surface" : "border-transparent"} ${key === today ? "ring-1 ring-primary" : ""}`}>
                  {day ? <span className="text-muted-foreground">{day}</span> : null}
                  <div className="mt-1 space-y-1">
                    {dayItems.slice(0, 3).map((item, idx) => <ItemButton key={`${key}-${idx}`} item={item} />)}
                    {dayItems.length > 3 ? <span className="text-[0.65rem] text-muted-foreground">+{dayItems.length - 3} more</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

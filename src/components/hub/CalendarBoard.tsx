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

export function CalendarBoard({ items }: { items: CalendarItem[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const { cells, monthName } = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // Monday first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: Array<{ day: number | null; key: string }> = [];
    for (let i = 0; i < startOffset; i += 1) list.push({ day: null, key: `pad-${i}` });
    for (let d = 1; d <= daysInMonth; d += 1) {
      list.push({
        day: d,
        key: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      });
    }
    return {
      cells: list,
      monthName: first.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    };
  }, [cursor]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title text-lg">{monthName}</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[0.65rem] tracking-wide text-muted-foreground uppercase">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map(({ day, key }) => {
          const dayItems = day ? items.filter((i) => i.date === key) : [];
          return (
            <div
              key={key}
               className={`min-h-20 rounded-md border p-1.5 text-left text-xs ${
                day ? "border-border bg-surface" : "border-transparent"
              } ${key === today ? "ring-1 ring-primary" : ""}`}
            >
              {day ? <span className="text-muted-foreground">{day}</span> : null}
              <div className="mt-1 space-y-1">
                {dayItems.slice(0, 3).map((item, idx) => (
                  <button
                    key={`${key}-${idx}`}
                    type="button"
                    onClick={item.onOpen}
                     className="block w-full truncate rounded-sm border-l border-primary bg-accent/60 px-1 py-0.5 text-left text-[0.68rem] hover:bg-accent"
                    title={item.label}
                  >
                    {ICON[item.kind]} {item.label}
                  </button>
                ))}
                {dayItems.length > 3 ? (
                  <span className="text-[0.65rem] text-muted-foreground">
                    +{dayItems.length - 3} more
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { Clapperboard, Clock3, Headphones, Handshake, MapPin, MonitorUp, Radio, Trophy, type LucideIcon } from "lucide-react";
import { chipClass } from "@/lib/hub";

type Meta = { label: string; icon: LucideIcon };
export const TYPE_META: Record<"stream" | "challenge" | "marathon" | "subathon" | "irl" | "collab" | "overlay" | "equipment", Meta> = {
  stream: { label: "Stream", icon: Radio },
  challenge: { label: "Challenge", icon: Trophy },
  marathon: { label: "Marathon", icon: Clock3 },
  subathon: { label: "Subathon", icon: Headphones },
  irl: { label: "IRL", icon: MapPin },
  collab: { label: "Collab", icon: Handshake },
  overlay: { label: "Overlay", icon: MonitorUp },
  equipment: { label: "Equipment", icon: Clapperboard },
};

export function whenLabel(date?: string | null, time?: string | null) {
  if (!date) return "No date yet";
  const d = new Date(date);
  const day = d.toLocaleDateString("en-GB", { month: "short", day: "numeric" }).toUpperCase();
  return time ? `${day} • ${time}` : day;
}

export function LiveCard({
  type,
  title,
  date,
  time,
  status,
  detail,
  onOpen,
}: {
  type: string;
  title: string;
  date?: string | null;
  time?: string | null;
  status: string;
  detail?: string | null;
  onOpen: () => void;
}) {
  const meta: Meta = (TYPE_META as Record<string, Meta>)[type] ?? TYPE_META.stream;
  const Icon = meta.icon;
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      type="button"
      onClick={onOpen}
      className="card-secondary lift group flex w-full flex-col p-5 text-left"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-primary">
          <span className="grid size-6 place-items-center rounded-full bg-primary/10">
            <Icon className="size-3.5" />
          </span>
          {meta.label}
        </span>
        <span className={chipClass(status)}>{status}</span>
      </div>
      <p className="section-title mt-4 text-2xl leading-tight">{title}</p>
      <p className="mt-1 text-xs font-medium tracking-[0.14em] text-muted-foreground">{whenLabel(date, time)}</p>
      {detail ? <p className="mt-3 text-sm text-muted-foreground">{detail}</p> : null}
    </motion.button>
  );
}

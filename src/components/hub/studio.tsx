import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView } from "framer-motion";
import pfp from "@/assets/j4dentv-hub-pfp.png.asset.json";

export const PFP_URL = pfp.url;
const EASE = [0.2, 0.7, 0.2, 1] as const;

export function ProfileAvatar({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`gold-ring inline-block shrink-0 ${className}`} style={{ width: size, height: size }}>
      <img src={PFP_URL} alt="J4denTV" className="size-full rounded-full object-cover" />
    </span>
  );
}

export function Stagger({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      {children}
    </motion.div>
  );
}

export function Rise({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({ value, className = "" }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, value, { duration: 1.1, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, value]);
  return (
    <span ref={ref} className={className}>
      {n.toLocaleString("en-GB")}
    </span>
  );
}

export function GoldBar({ pct }: { pct: number }) {
  const p = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full rounded-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${p}%` }}
        transition={{ duration: 1.2, ease: EASE }}
      />
    </div>
  );
}

export function StudioEmpty({
  icon,
  title,
  text,
  children,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-full border border-primary/30 text-primary">{icon}</div>
      <p className="section-title text-2xl">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {children ? <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}

export function TabBar<T extends string>({
  tabs,
  value,
  onChange,
  id,
}: {
  tabs: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  id: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onChange(t.value)}
          className={`relative px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
            value === t.value ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t.label}
          {value === t.value ? (
            <motion.span layoutId={`tab-${id}`} className="absolute inset-x-2 -bottom-px h-0.5 bg-primary" />
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function countdown(target: Date, now: Date) {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return "Now";
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
}

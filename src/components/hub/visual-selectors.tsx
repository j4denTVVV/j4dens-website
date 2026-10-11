import { useState, type ReactNode } from "react";
import { ArrowRight, Check, ChevronDown, Plus, Gamepad2, MessageCircle, Trophy, MapPin, Users, Mic, Tv, Camera, Lightbulb, Monitor, Armchair, Smartphone, SlidersHorizontal, Headphones, Video, Radio, Clapperboard, Sparkles, CalendarDays } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlatformLogo, PLATFORMS, isPlatform } from "@/components/hub/platforms";

const ICONS: Record<string, typeof Plus> = {
  Gaming: Gamepad2, Reaction: Video, Challenge: Trophy, IRL: MapPin, Collab: Users,
  Commentary: Mic, "Stream Video": Tv, "Just Chatting": MessageCircle, Community: Users,
  Other: Plus, Custom: Sparkles, Live: Radio, Stream: Radio, Streams: Radio, YouTube: Clapperboard,
  "YouTube uploads": Clapperboard, Uploads: Clapperboard, Collabs: Users, Marathons: CalendarDays,
  Short: Smartphone, "Short-form posts": Smartphone, Cameras: Camera, Microphones: Mic,
  Lighting: Lightbulb, "Capture Cards": Video, Monitors: Monitor, Desks: Armchair,
  "IRL Equipment": Smartphone, "IRL Gear": Smartphone, "Stream Decks": SlidersHorizontal,
  Headphones: Headphones, "Monitor Arms": Monitor, Tripods: Camera, City: MapPin, Event: CalendarDays,
};

export function ChoiceIcon({ value }: { value: string }) {
  if (isPlatform(value)) return <PlatformLogo p={value} size={22} />;
  const Icon = ICONS[value] ?? Sparkles;
  return <Icon className="size-5" strokeWidth={1.5} />;
}

type ChoiceProps = { value: string; onChange: (value: string) => void; options: readonly string[]; label?: string; className?: string; labels?: Record<string, string> };
export function CategorySelector({ value, onChange, options, label = "Category", className, labels }: ChoiceProps) {
  const choices = value && !options.includes(value) ? [...options, value] : options;
  return <div role="group" aria-label={label} className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>
    {choices.map(option => <Button key={option} type="button" variant="choice" aria-pressed={value === option} onClick={() => onChange(option)} className="visual-choice min-h-20 h-auto flex-col gap-2 whitespace-normal px-2 py-3 text-center text-sm">
      <ChoiceIcon value={option} /><span>{labels?.[option] ?? option}</span>
      {value === option && <Check className="choice-check absolute right-1.5 top-1.5 size-3" />}
    </Button>)}
  </div>;
}

export function StatusSelector({ value, onChange, options, label = "Status", className, labels }: ChoiceProps) {
  const choices = value && !options.includes(value) ? [...options, value] : options;
  return <div role="group" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
    {choices.map(option => <Button key={option} type="button" variant="choice" size="sm" className="visual-choice h-9 gap-1.5 px-3 text-xs" aria-pressed={value === option} onClick={() => onChange(option)}>
      {value === option && <span className="size-1 rounded-full bg-foreground" />}{labels?.[option] ?? option}
    </Button>)}
  </div>;
}
export function PrioritySelector(props: Omit<ChoiceProps, "options"> & { options?: readonly string[] }) {
  return <StatusSelector {...props} label="Priority" options={props.options ?? ["Low", "Normal", "High", "Must Do"]} />;
}
export function ContentTypeSelector(props: ChoiceProps) { return <CategorySelector {...props} label={props.label ?? "Content type"} />; }

export function PlatformSelector({ value, onChange, single = false, options = PLATFORMS }: { value: string[]; onChange: (value: string[]) => void; single?: boolean; options?: readonly string[] }) {
  const choices = [...new Set([...options, ...value])];
  return <div role="group" aria-label={single ? "Choose platform" : "Choose platforms"} className="grid grid-cols-3 gap-2 sm:grid-cols-6">
    {choices.map(p => <Button key={p} type="button" variant="choice" className="visual-choice min-h-20 h-auto flex-col gap-2 whitespace-normal px-1 py-3 text-xs" aria-pressed={value.includes(p)} onClick={() => onChange(single ? [p] : value.includes(p) ? value.filter(x => x !== p) : [...value, p])}>
      <PlatformLogo p={p} size={23} /><span>{p}</span>{value.includes(p) && <Check className="choice-check absolute right-1.5 top-1.5 size-3" />}
    </Button>)}
  </div>;
}

export function MoreOptions({ children, label = "More options", defaultOpen = false }: { children: ReactNode; label?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <div className="border-t border-border pt-4">
    <Button type="button" variant="ghost" size="sm" className="h-9 rounded-sm px-0 font-display text-base uppercase" aria-expanded={open} onClick={() => setOpen(!open)}>
      {open ? <ChevronDown className="size-4" /> : <Plus className="size-4" />}{label}
    </Button>
    {open && <div className="space-y-5 pt-4">{children}</div>}
  </div>;
}
export function FormAction({ children, ...props }: ButtonProps) {
  return <Button variant="studio" {...props}>{children}<ArrowRight className="size-4" /></Button>;
}
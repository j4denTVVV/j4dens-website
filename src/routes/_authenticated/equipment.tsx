import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteRow, fetchAll, insertRow, updateRow } from "@/lib/api";
import { Field, PageHeader } from "@/components/hub/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/equipment")({
  head: () => ({
    meta: [
      { title: "Equipment — J4DENTV Creator HQ" },
      { name: "description", content: "Find, save and organise gear for J4denTV." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EquipmentPage,
});

const CATEGORIES = [
  "Cameras", "Microphones", "Lighting", "Capture Cards", "Desks", "Monitors",
  "Monitor Arms", "Tripods", "Stream Decks", "Headphones", "IRL Equipment",
];
const SECTIONS = ["Own", "Want To Buy", "Ordered", "Upgrade Later"];
const EXAMPLES = ["camera", "microphone", "capture card", "tripod", "lighting", "monitor arm", "stream deck", "IRL backpack"];

type Item = {
  id: string; name: string; category: string | null; section: string; price: number | null;
  url: string | null; notes: string | null;
};

// Store + image live inside notes as a small header so no schema change is needed.
function parseNotes(n: string | null) {
  const m = /^\[\[(.*?)\|(.*?)\]\]\n?/s.exec(n ?? "");
  return m ? { store: m[1] ?? "", image: m[2] ?? "", text: (n ?? "").slice(m[0].length) } : { store: "", image: "", text: n ?? "" };
}
const packNotes = (store: string, image: string, text: string) =>
  store || image ? `[[${store}|${image}]]\n${text}` : text;

const amazon = (q: string) => `https://www.amazon.co.uk/s?k=${encodeURIComponent(q)}`;
const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

function EquipmentPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [section, setSection] = useState("Own");
  const [cat, setCat] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<Item> | null>(null);
  const { data: items = [] } = useQuery<Item[]>({ queryKey: ["setup_items"], queryFn: () => fetchAll("setup_items") });

  const shown = items.filter((i) => i.section === section && (!cat || i.category === cat));
  const wantPriced = items.filter((i) => i.section === "Want To Buy" && i.price != null);
  const wantTotal = wantPriced.reduce((s, i) => s + Number(i.price), 0);
  const counts = useMemo(() => Object.fromEntries(SECTIONS.map((s) => [s, items.filter((i) => i.section === s).length])), [items]);

  const move = useMutation({
    mutationFn: ({ id, section }: { id: string; section: string }) => updateRow("setup_items", id, { section }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["setup_items"] }); toast.success("Moved"); },
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteRow("setup_items", id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["setup_items"] }),
  });

  return (
    <div>
      <PageHeader title="EQUIPMENT" subtitle="Find, save and organise gear for J4denTV."
        action={<Button onClick={() => setEdit({ section })}><Plus className="size-4" /> Add item</Button>} />

      <form
        className="card-primary flex flex-col gap-3 p-4 sm:flex-row"
        onSubmit={(e) => { e.preventDefault(); if (q.trim()) window.open(amazon(q.trim()), "_blank", "noopener"); }}
      >
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search equipment..." className="h-14 rounded-full pl-12 text-base" />
        </div>
        <Button type="submit" size="lg" disabled={!q.trim()}>SEARCH AMAZON UK</Button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((e) => (
          <button key={e} onClick={() => setQ(e)} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-foreground hover:text-foreground">{e}</button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Product results inside the Hub need an Amazon product account — not connected. Search opens Amazon UK.</p>

      <h2 className="section-title mt-10 mb-4 text-2xl">CATEGORIES</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((c) => (
          <div key={c} className={`card-secondary lift flex flex-col justify-between gap-3 p-4 ${cat === c ? "ring-1 ring-foreground" : ""}`}>
            <button onClick={() => setCat(cat === c ? null : c)} className="section-title text-left text-xl">{c.toUpperCase()}</button>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{items.filter((i) => i.category === c).length} saved</span>
              <a href={amazon(c)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">Amazon <ExternalLink className="size-3" /></a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 mb-4 flex flex-wrap items-end justify-between gap-4">
        <h2 className="section-title text-2xl">MY SETUP{cat ? ` · ${cat.toUpperCase()}` : ""}</h2>
        <div className="card-minimal px-4 py-2 text-right">
          <p className="eyebrow">WANT TO BUY TOTAL</p>
          <p className="section-title text-2xl">{wantPriced.length ? gbp(wantTotal) : "No prices yet"}</p>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <Button key={s} size="sm" variant={section === s ? "default" : "outline"} onClick={() => setSection(s)}>
            {s.toUpperCase()} ({counts[s] ?? 0})
          </Button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="card-minimal p-10 text-center text-sm text-muted-foreground">Nothing in {section}{cat ? ` for ${cat}` : ""} yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((i) => {
            const n = parseNotes(i.notes);
            return (
              <div key={i.id} className="card-secondary flex flex-col gap-3 p-4">
                {n.image ? <img src={n.image} alt={i.name} className="aspect-video w-full rounded-md object-cover" /> : null}
                <div className="flex items-start justify-between gap-2">
                  <button className="text-left font-semibold hover:underline" onClick={() => setEdit(i)}>{i.name}</button>
                  {i.price != null ? <span className="font-semibold">{gbp(Number(i.price))}</span> : null}
                </div>
                <p className="text-xs text-muted-foreground">{[i.category, n.store].filter(Boolean).join(" · ") || "No category"}</p>
                {n.text ? <p className="line-clamp-2 text-sm text-muted-foreground">{n.text}</p> : null}
                <div className="mt-auto flex items-center gap-2">
                  <Select value={i.section} onValueChange={(v) => move.mutate({ id: i.id, section: v })}>
                    <SelectTrigger className="h-9 flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{SECTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  {i.url ? <Button size="icon" variant="outline" asChild><a href={i.url} target="_blank" rel="noopener noreferrer" aria-label="Open link"><ExternalLink className="size-4" /></a></Button> : null}
                  <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => del.mutate(i.id)}><Trash2 className="size-4" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {edit ? <ItemDialog item={edit} onClose={() => setEdit(null)} /> : null}
    </div>
  );
}

function ItemDialog({ item, onClose }: { item: Partial<Item>; onClose: () => void }) {
  const qc = useQueryClient();
  const n = parseNotes(item.notes ?? null);
  const [f, setF] = useState({
    name: item.name ?? "", category: item.category ?? "", section: item.section ?? "Want To Buy",
    price: item.price != null ? String(item.price) : "", url: item.url ?? "", store: n.store, image: n.image, notes: n.text,
  });
  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const save = useMutation({
    mutationFn: () => {
      const values = {
        name: f.name.trim(), category: f.category || null, section: f.section,
        price: f.price.trim() ? Number(f.price) : null, url: f.url.trim() || null,
        notes: packNotes(f.store.trim(), f.image.trim(), f.notes) || null,
      };
      return item.id ? updateRow("setup_items", item.id, values) : insertRow("setup_items", values);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["setup_items"] }); toast.success("Saved"); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{item.id ? "Edit item" : "Add equipment"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name" className="sm:col-span-2"><Input value={f.name} onChange={(e) => set("name")(e.target.value)} /></Field>
          <Field label="Category">
            <Select value={f.category} onValueChange={set("category")}>
              <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="List">
            <Select value={f.section} onValueChange={set("section")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SECTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Price (£)"><Input type="number" step="0.01" min="0" value={f.price} onChange={(e) => set("price")(e.target.value)} /></Field>
          <Field label="Store"><Input value={f.store} onChange={(e) => set("store")(e.target.value)} placeholder="Amazon UK" /></Field>
          <Field label="Link" className="sm:col-span-2"><Input value={f.url} onChange={(e) => set("url")(e.target.value)} placeholder="https://" /></Field>
          <Field label="Image URL" className="sm:col-span-2"><Input value={f.image} onChange={(e) => set("image")(e.target.value)} placeholder="https://" /></Field>
          <Field label="Notes" className="sm:col-span-2"><Textarea value={f.notes} onChange={(e) => set("notes")(e.target.value)} /></Field>
        </div>
        <Button onClick={() => save.mutate()} disabled={!f.name.trim() || save.isPending}>Save</Button>
      </DialogContent>
    </Dialog>
  );
}

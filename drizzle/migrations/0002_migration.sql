CREATE TABLE public.hub_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  kind text NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'Idea',
  start_date date,
  end_date date,
  platform text,
  partner text,
  location text,
  goal text,
  notes text,
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hub_items TO authenticated;
GRANT ALL ON public.hub_items TO service_role;
ALTER TABLE public.hub_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own hub items" ON public.hub_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER hub_items_updated BEFORE UPDATE ON public.hub_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX hub_items_kind_idx ON public.hub_items(user_id, kind);
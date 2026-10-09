ALTER TABLE public.hub_items ADD COLUMN IF NOT EXISTS platforms text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.streams ADD COLUMN IF NOT EXISTS platforms text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.streams ADD COLUMN IF NOT EXISTS details jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.collabs ADD COLUMN IF NOT EXISTS platforms text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS appearance jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS preferences jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS bio text;

CREATE TABLE public.setup_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  category text,
  section text NOT NULL DEFAULT 'Want To Buy',
  price numeric,
  url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.setup_items TO authenticated;
GRANT ALL ON public.setup_items TO service_role;
ALTER TABLE public.setup_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own setup items" ON public.setup_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER setup_items_updated BEFORE UPDATE ON public.setup_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
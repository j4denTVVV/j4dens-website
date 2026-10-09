ALTER TABLE public.hub_items ADD COLUMN IF NOT EXISTS details jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.hub_items ADD COLUMN IF NOT EXISTS start_time text;

CREATE TABLE public.creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  display_name text NOT NULL,
  username text,
  avatar_url text,
  profiles jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creators TO authenticated;
GRANT ALL ON public.creators TO service_role;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own creators" ON public.creators FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER creators_updated BEFORE UPDATE ON public.creators FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.collabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  creator_id uuid REFERENCES public.creators(id) ON DELETE SET NULL,
  title text NOT NULL,
  collab_date date,
  collab_time text,
  platform text,
  activity text,
  collab_type text,
  plan text,
  segments text,
  duration text,
  status text NOT NULL DEFAULT 'Idea',
  notes text,
  opportunities text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collabs TO authenticated;
GRANT ALL ON public.collabs TO service_role;
ALTER TABLE public.collabs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own collabs" ON public.collabs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER collabs_updated BEFORE UPDATE ON public.collabs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.settings (
  user_id UUID PRIMARY KEY,
  creator_name TEXT NOT NULL DEFAULT 'J4denTV',
  greeting_name TEXT NOT NULL DEFAULT 'Jaden',
  avatar_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'Europe/London',
  default_platform TEXT NOT NULL DEFAULT 'Twitch',
  target_videos INTEGER NOT NULL DEFAULT 4,
  target_streams INTEGER NOT NULL DEFAULT 8,
  target_shorts INTEGER NOT NULL DEFAULT 20,
  target_followers INTEGER NOT NULL DEFAULT 2000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own settings" ON public.settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER settings_updated BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  working_title TEXT NOT NULL,
  final_title TEXT,
  category TEXT NOT NULL DEFAULT 'Gaming',
  status TEXT NOT NULL DEFAULT 'Idea',
  priority TEXT NOT NULL DEFAULT 'Normal',
  concept TEXT,
  hook TEXT,
  notes TEXT,
  thumbnail_idea TEXT,
  thumbnail_done BOOLEAN NOT NULL DEFAULT false,
  planned_record_date DATE,
  actual_record_date DATE,
  planned_upload_date DATE,
  actual_upload_date DATE,
  views_24h INTEGER,
  views_7d INTEGER,
  views_30d INTEGER,
  likes INTEGER,
  comments INTEGER,
  subs_gained INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youtube_videos TO authenticated;
GRANT ALL ON public.youtube_videos TO service_role;
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own videos" ON public.youtube_videos FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER videos_updated BEFORE UPDATE ON public.youtube_videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.youtube_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id UUID NOT NULL REFERENCES public.youtube_videos(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youtube_sections TO authenticated;
GRANT ALL ON public.youtube_sections TO service_role;
ALTER TABLE public.youtube_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sections" ON public.youtube_sections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.youtube_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id UUID NOT NULL REFERENCES public.youtube_videos(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youtube_checklists TO authenticated;
GRANT ALL ON public.youtube_checklists TO service_role;
ALTER TABLE public.youtube_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own video checklists" ON public.youtube_checklists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  stream_date DATE,
  stream_time TEXT,
  category TEXT NOT NULL DEFAULT 'Just Chatting',
  status TEXT NOT NULL DEFAULT 'Idea',
  platform TEXT NOT NULL DEFAULT 'Twitch',
  main_idea TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.streams TO authenticated;
GRANT ALL ON public.streams TO service_role;
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own streams" ON public.streams FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER streams_updated BEFORE UPDATE ON public.streams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.stream_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  length_mins INTEGER,
  notes TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stream_segments TO authenticated;
GRANT ALL ON public.stream_segments TO service_role;
ALTER TABLE public.stream_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own segments" ON public.stream_segments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.stream_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stream_checklists TO authenticated;
GRANT ALL ON public.stream_checklists TO service_role;
ALTER TABLE public.stream_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own stream checklists" ON public.stream_checklists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'YouTube',
  priority TEXT NOT NULL DEFAULT 'Normal',
  status TEXT NOT NULL DEFAULT 'Unused',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ideas TO authenticated;
GRANT ALL ON public.ideas TO service_role;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ideas" ON public.ideas FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER ideas_updated BEFORE UPDATE ON public.ideas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.analytics_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly',
  platform TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE,
  followers_start INTEGER,
  followers_end INTEGER,
  followers_gained INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  posts INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  avg_viewers INTEGER,
  watch_time INTEGER,
  subs_gained INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_entries TO authenticated;
GRANT ALL ON public.analytics_entries TO service_role;
ALTER TABLE public.analytics_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own analytics" ON public.analytics_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER analytics_updated BEFORE UPDATE ON public.analytics_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  current_value INTEGER NOT NULL DEFAULT 0,
  target_value INTEGER NOT NULL DEFAULT 1,
  deadline DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own goals" ON public.goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER goals_updated BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

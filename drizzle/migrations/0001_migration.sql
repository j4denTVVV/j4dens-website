DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['youtube_videos','youtube_sections','youtube_checklists','streams','stream_segments','stream_checklists','ideas','analytics_entries','goals'] LOOP
 EXECUTE format('UPDATE public.%I SET user_id=%L WHERE user_id=%L', t, 'c3e6a4ee-29c7-4ad8-b411-9cc3ba65bbfe','e052264e-3d4a-4833-a2e4-c0c3b37ebbe0');
END LOOP; END $$;
DELETE FROM public.settings WHERE user_id='c3e6a4ee-29c7-4ad8-b411-9cc3ba65bbfe' AND EXISTS (SELECT 1 FROM public.settings WHERE user_id='e052264e-3d4a-4833-a2e4-c0c3b37ebbe0');
UPDATE public.settings SET user_id='c3e6a4ee-29c7-4ad8-b411-9cc3ba65bbfe' WHERE user_id='e052264e-3d4a-4833-a2e4-c0c3b37ebbe0';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS socials jsonb NOT NULL DEFAULT '{"twitch":"j4denTV","youtube":"j4denTV","tiktok":"j4denTV","instagram":"j4denTV","x":"j4denTV","discord":""}'::jsonb;
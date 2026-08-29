-- ─────────────────────────────────────────────────────────────────────────────
-- moments table — Supabase SQL (Fixes 403 Forbidden)
-- Copy and paste ALL of this into:
-- Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.moments (
  id              TEXT PRIMARY KEY,
  type            TEXT NOT NULL DEFAULT 'update'
                    CHECK (type IN ('photo', 'milestone', 'quote', 'update', 'video')),
  title           TEXT NOT NULL,
  description     TEXT,
  date            TEXT,          -- human-readable e.g. "Aug 2026"
  year            INTEGER,       -- numeric year for grouping e.g. 2026
  icon            TEXT,          -- emoji e.g. '🎓'
  image_url       TEXT,          -- Supabase Storage URL or external URL
  color           TEXT NOT NULL DEFAULT 'accent'
                    CHECK (color IN ('accent', 'success', 'warning', 'purple', 'pink')),
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  tags            TEXT[] DEFAULT '{}',
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.update_moments_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_moments_updated_at ON public.moments;
CREATE TRIGGER set_moments_updated_at
  BEFORE UPDATE ON public.moments
  FOR EACH ROW EXECUTE FUNCTION public.update_moments_updated_at();

-- 3. Schema & Table Grants (Explicitly grants access to prevent 403 Forbidden)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.moments TO anon, authenticated, service_role;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "moments_public_read" ON public.moments;
DROP POLICY IF EXISTS "moments_auth_insert" ON public.moments;
DROP POLICY IF EXISTS "moments_auth_update" ON public.moments;
DROP POLICY IF EXISTS "moments_auth_delete" ON public.moments;

-- Public can read all moments (Anon & Authenticated)
CREATE POLICY "moments_public_read"
  ON public.moments FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Authenticated users (Admin dashboard) can insert/update/delete
CREATE POLICY "moments_auth_insert"
  ON public.moments FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "moments_auth_update"
  ON public.moments FOR UPDATE
  TO authenticated
  USING (TRUE);

CREATE POLICY "moments_auth_delete"
  ON public.moments FOR DELETE
  TO authenticated
  USING (TRUE);

-- 5. Enable Realtime Replication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'moments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.moments;
  END IF;
END $$;

-- 6. Seed Sample Data
INSERT INTO public.moments (id, type, title, description, date, year, icon, color, featured, tags, display_order) VALUES
  ('moment-conv-2026',    'milestone', 'Graduated from VIT Vellore 🎓',   'Officially a B.Tech graduate! Four incredible years of sleepless nights, amazing friends, and projects that changed how I see the world. Proudest moment of my life so far.',                  'Aug 2026', 2026, '🎓', 'purple',  TRUE,  ARRAY['education','achievement'],   10),
  ('moment-first-offer',  'milestone', 'First Full-Time Offer 💼',          'Received my first full-time offer! The grind was real — hundreds of DSA problems, mock interviews, and late-night prep sessions. It finally paid off.',                                          'Jul 2026', 2026, '💼', 'success', FALSE, ARRAY['career','achievement'],       20),
  ('moment-quote-1',      'quote',     'Favorite Quote',                    '"The best way to predict the future is to invent it." — Alan Kay',                                                                                                                                   'Jun 2026', 2026,  NULL, 'accent',  FALSE, ARRAY['inspiration'],               30),
  ('moment-hackathon',    'milestone', 'Won Smart India Hackathon 🏆',      'Our team of 6 built an AI-powered disaster response coordination platform in 36 hours. We won the national-level SIH 2025 finale. Unreal experience.',                                             'Dec 2025', 2025, '🏆', 'warning', TRUE,  ARRAY['achievement','ai'],          40),
  ('moment-ooty',         'update',    'Ooty Trip with the Squad ❤️',       'Took a much-needed break with college friends before placements kicked in. The Nilgiris fog, chai at every stop, and zero laptops for 3 days. Pure joy.',                                          'Oct 2025', 2025, '🏔️', 'accent',  FALSE, ARRAY['travel','life'],              50),
  ('moment-quote-2',      'quote',     'On Persistence',                    '"It does not matter how slowly you go as long as you do not stop." — Confucius',                                                                                                                    'Sep 2025', 2025,  NULL, 'purple',  FALSE, ARRAY['inspiration'],               60),
  ('moment-internship',   'milestone', 'Internship at Cognizant ✅',        'Completed my 3-month internship at Cognizant, working on ML-based document intelligence pipelines. Got to work with real enterprise-scale data.',                                                  'Aug 2025', 2025, '✅', 'success', FALSE, ARRAY['career','experience'],        70),
  ('moment-portfolio',    'update',    'Launched this Portfolio 🚀',        'After weeks of building, this portfolio finally went live! Built with React, Vite, Framer Motion, and Supabase. Every component handcrafted — no templates.',                                     'May 2025', 2025, '🚀', 'accent',  TRUE,  ARRAY['project','dev'],              80)
ON CONFLICT (id) DO NOTHING;

-- Run this in the Supabase SQL Editor
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS feature_certifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS feature_experience BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT 'Sujith Thota | Portfolio',
ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT 'Full Stack Developer & AI Enthusiast',
ADD COLUMN IF NOT EXISTS seo_og_image TEXT,
ADD COLUMN IF NOT EXISTS announcement_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS announcement_text TEXT DEFAULT 'Currently seeking Senior React roles for Q4',
ADD COLUMN IF NOT EXISTS contact_spam_filter BOOLEAN DEFAULT true;

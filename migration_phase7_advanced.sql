-- ====================================================================
-- PHASE 7 ADVANCED MIGRATION SCRIPT
-- Tables: admin_audit_logs, portfolio_analytics, recruiter_events
-- Extended Columns: site_settings theme columns
-- ====================================================================

-- 1. Security Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Real-Time Portfolio Analytics Table
CREATE TABLE IF NOT EXISTS public.portfolio_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path VARCHAR(255) NOT NULL,
    referrer VARCHAR(500),
    user_agent TEXT,
    country_code VARCHAR(10) DEFAULT 'US',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Recruiter Events Table
CREATE TABLE IF NOT EXISTS public.recruiter_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL, -- e.g., 'resume_download', 'contact_click', 'project_demo', 'bot_chat'
    event_detail TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Extend site_settings for Theme Customization
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS primary_color VARCHAR(50) DEFAULT '#007bff';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS accent_color VARCHAR(50) DEFAULT '#3b82f6';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS font_family VARCHAR(100) DEFAULT 'Modern (Inter)';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS enable_particles BOOLEAN DEFAULT true;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS glass_intensity VARCHAR(50) DEFAULT 'medium';

-- Grants for API roles
GRANT SELECT, INSERT ON public.admin_audit_logs TO authenticated;
GRANT SELECT, INSERT ON public.portfolio_analytics TO anon, authenticated;
GRANT SELECT, INSERT ON public.recruiter_events TO anon, authenticated;

-- Service role full access
GRANT ALL ON public.admin_audit_logs TO service_role;
GRANT ALL ON public.portfolio_analytics TO service_role;
GRANT ALL ON public.recruiter_events TO service_role;

-- Enable RLS & set default public insert policies
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read/write audit_logs" ON public.admin_audit_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public insert analytics" ON public.portfolio_analytics FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated read analytics" ON public.portfolio_analytics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow public insert recruiter_events" ON public.recruiter_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated read recruiter_events" ON public.recruiter_events FOR SELECT TO authenticated USING (true);

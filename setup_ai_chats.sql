-- ====================================================================
-- AI CHATS MIGRATION
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_name VARCHAR(100) DEFAULT 'Anonymous Visitor',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.chat_sessions TO anon, authenticated;
GRANT SELECT, INSERT ON public.chat_messages TO anon, authenticated;
GRANT ALL ON public.chat_sessions TO service_role;
GRANT ALL ON public.chat_messages TO service_role;

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow public inserts and updates to their own sessions (in a real app you'd use a cookie/localstorage UUID)
-- For this portfolio, we allow anon to insert and read so the widget works.
CREATE POLICY "Allow public insert sessions" ON public.chat_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public select sessions" ON public.chat_sessions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public update sessions" ON public.chat_sessions FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert messages" ON public.chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public select messages" ON public.chat_messages FOR SELECT TO anon, authenticated USING (true);

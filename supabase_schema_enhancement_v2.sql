-- ============================================================================
-- SUPABASE ENTERPRISE DATABASE SCHEMA ENHANCEMENT (v2.0 - Resilient Migration)
-- Sujith Thota Portfolio & AI Assistant Architecture
-- Includes: Safe Column Patching, RLS Policies, Lead Scoring, High-Speed Indexes
-- ============================================================================

-- 0. ENABLE CORE EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ============================================================================
-- 1. CORE TABLES (CREATE IF NOT EXISTS + COLUMN SAFETY PATCHES)
-- ============================================================================

-- 1.1 Site Settings
create table if not exists site_settings (
  id int primary key default 1,
  site_disabled boolean default false,
  maintenance_mode boolean default false,
  maintenance_message text default 'Under scheduled maintenance. Check back soon!',
  hero_headline text default 'Full-Stack Developer & Data Science Specialist',
  short_bio text default 'B.Tech CSE (Data Science) graduate from VIT University. Passionate about ML, Neural Networks & building seamless web experiences.',
  avatar_url text,
  resume_url text,
  theme_color text default '#3b82f6',
  feature_experience boolean default true,
  feature_certifications boolean default true,
  feature_ai_assistant boolean default true,
  updated_at timestamptz default now()
);

-- Safety column patches for existing site_settings table
alter table site_settings add column if not exists site_disabled boolean default false;
alter table site_settings add column if not exists maintenance_mode boolean default false;
alter table site_settings add column if not exists maintenance_message text default 'Under scheduled maintenance. Check back soon!';
alter table site_settings add column if not exists hero_headline text default 'Full-Stack Developer & Data Science Specialist';
alter table site_settings add column if not exists short_bio text default 'B.Tech CSE (Data Science) graduate from VIT University.';
alter table site_settings add column if not exists feature_experience boolean default true;
alter table site_settings add column if not exists feature_certifications boolean default true;
alter table site_settings add column if not exists feature_ai_assistant boolean default true;

-- Ensure default row exists
insert into site_settings (id) values (1) on conflict (id) do nothing;

-- 1.2 Projects Table
create table if not exists projects (
  id text primary key,
  title text not null,
  description text,
  image text,
  tags text[] default '{}',
  category text default 'AI / ML',
  github_url text,
  live_url text,
  featured boolean default false,
  display_order int default 0,
  stats jsonb default '[]'::jsonb,
  pipeline jsonb default '[]'::jsonb,
  architecture jsonb default '[]'::jsonb,
  code text,
  created_at timestamptz default now()
);

-- Safety column patches for existing projects table
alter table projects add column if not exists category text default 'AI / ML';
alter table projects add column if not exists featured boolean default false;
alter table projects add column if not exists display_order int default 0;
alter table projects add column if not exists stats jsonb default '[]'::jsonb;
alter table projects add column if not exists pipeline jsonb default '[]'::jsonb;
alter table projects add column if not exists architecture jsonb default '[]'::jsonb;
alter table projects add column if not exists code text;
alter table projects add column if not exists created_at timestamptz default now();

-- 1.3 Technical Skills Table
create table if not exists skills (
  id text primary key,
  name text not null,
  category text not null,
  proficiency_level int default 85,
  order_index int default 0,
  icon text,
  related_tools text[] default '{}',
  projects text[] default '{}',
  created_at timestamptz default now()
);

-- Safety column patches for existing skills table
alter table skills add column if not exists proficiency_level int default 85;
alter table skills add column if not exists order_index int default 0;
alter table skills add column if not exists icon text;
alter table skills add column if not exists related_tools text[] default '{}';
alter table skills add column if not exists projects text[] default '{}';
alter table skills add column if not exists created_at timestamptz default now();

-- 1.4 Experience Table
create table if not exists experience (
  id text primary key,
  role text not null,
  company text not null,
  location text default 'Remote',
  start_date text not null,
  end_date text default 'Present',
  is_education boolean default false,
  description_bullets text[] default '{}',
  display_order int default 0,
  created_at timestamptz default now()
);

-- Safety column patches for existing experience table
alter table experience add column if not exists location text default 'Remote';
alter table experience add column if not exists is_education boolean default false;
alter table experience add column if not exists description_bullets text[] default '{}';
alter table experience add column if not exists display_order int default 0;
alter table experience add column if not exists created_at timestamptz default now();

-- 1.5 Education Table
create table if not exists education (
  id text primary key,
  institution text not null,
  degree text not null,
  field_of_study text,
  cgpa text,
  year text not null,
  location text,
  highlights text[] default '{}',
  back_stats jsonb default '[]'::jsonb,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Safety column patches for existing education table
alter table education add column if not exists field_of_study text;
alter table education add column if not exists cgpa text;
alter table education add column if not exists location text;
alter table education add column if not exists highlights text[] default '{}';
alter table education add column if not exists back_stats jsonb default '[]'::jsonb;
alter table education add column if not exists display_order int default 0;
alter table education add column if not exists created_at timestamptz default now();

-- 1.6 Certifications Table
create table if not exists certifications (
  id text primary key,
  name text not null,
  issuer text not null,
  issue_date text,
  credential_url text,
  badge_image text,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Safety column patches for existing certifications table
alter table certifications add column if not exists badge_image text;
alter table certifications add column if not exists display_order int default 0;
alter table certifications add column if not exists created_at timestamptz default now();

-- 1.7 Updates & Changelog Table
create table if not exists updates (
  id serial primary key,
  version text not null default 'v1.3.0',
  label text,
  title text not null,
  description text,
  impact text default 'Minor',
  category text default 'feature',
  items text[] default '{}',
  reactions jsonb default '{"rocket": 0, "party": 0, "heart": 0, "thumbs": 0}'::jsonb,
  published boolean default true,
  created_at timestamptz default now()
);

-- Safety column patches for existing updates table
alter table updates add column if not exists version text default 'v1.3.0';
alter table updates add column if not exists label text;
alter table updates add column if not exists description text;
alter table updates add column if not exists impact text default 'Minor';
alter table updates add column if not exists category text default 'feature';
alter table updates add column if not exists items text[] default '{}';
alter table updates add column if not exists reactions jsonb default '{"rocket": 0, "party": 0, "heart": 0, "thumbs": 0}'::jsonb;
alter table updates add column if not exists published boolean default true;
alter table updates add column if not exists created_at timestamptz default now();

-- ============================================================================
-- 2. TELEMETRY, LEADS & SECURITY TABLES
-- ============================================================================

-- 2.1 Contact Messages Table
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  inquiry_type text default 'General',
  lead_score int default 50,
  intent_tier text default 'General',
  company_detected text,
  is_read boolean default false,
  is_archived boolean default false,
  is_spam boolean default false,
  spam_score int default 0,
  ip_address text,
  location text,
  created_at timestamptz default now()
);

-- Safety column patches for existing contact_messages table
alter table contact_messages add column if not exists lead_score int default 50;
alter table contact_messages add column if not exists intent_tier text default 'General';
alter table contact_messages add column if not exists company_detected text;
alter table contact_messages add column if not exists is_read boolean default false;
alter table contact_messages add column if not exists is_archived boolean default false;
alter table contact_messages add column if not exists is_spam boolean default false;
alter table contact_messages add column if not exists spam_score int default 0;
alter table contact_messages add column if not exists ip_address text;
alter table contact_messages add column if not exists location text;
alter table contact_messages add column if not exists created_at timestamptz default now();

-- 2.2 Admin Audit Logs
create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- 2.3 Recruiter Events
create table if not exists recruiter_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  event_detail text,
  session_id text,
  created_at timestamptz default now()
);

-- 2.4 Analytics
create table if not exists portfolio_analytics (
  id uuid primary key default gen_random_uuid(),
  page_path text not null,
  referrer text,
  user_agent text,
  country_code text default 'US',
  session_id text,
  created_at timestamptz default now()
);

-- 2.5 Login History
create table if not exists login_history (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  success boolean not null,
  ip_address text,
  user_agent text,
  reason text,
  created_at timestamptz default now()
);

-- ============================================================================
-- 3. AI CHATBOT & VECTOR RAG TABLES
-- ============================================================================

create table if not exists chat_sessions (
  id text primary key,
  visitor_ip text,
  persona text default 'general',
  created_at timestamptz default now()
);

create table if not exists chat_messages (
  id text primary key,
  session_id text references chat_sessions(id) on delete cascade,
  role text not null,
  content text not null,
  tokens_used int default 0,
  created_at timestamptz default now()
);

create table if not exists kb_chunks (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  section text,
  content text not null,
  embedding vector(512),
  created_at timestamptz default now()
);

create table if not exists kb_gaps (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  top_score float,
  session_id text,
  detected_persona text default 'general',
  reviewed boolean default false,
  created_at timestamptz default now()
);

-- ============================================================================
-- 4. AUTOMATION TRIGGERS
-- ============================================================================

-- 4.1 Lead Scoring Trigger
create or replace function score_incoming_lead()
returns trigger as $$
begin
  if new.message ilike any(array['%interview%', '%hire%', '%hiring%', '%job%', '%opportunity%', '%role%', '%salary%', '%vit%', '%offer%', '%ctc%'])
     or new.subject ilike any(array['%job%', '%interview%', '%opportunity%', '%hire%', '%role%']) then
    new.lead_score := coalesce(new.lead_score, 50) + 40;
    new.intent_tier := 'Recruiter (High)';
  end if;

  if new.email not ilike '%@gmail.com' 
     and new.email not ilike '%@yahoo.com' 
     and new.email not ilike '%@outlook.com' 
     and new.email not ilike '%@hotmail.com' 
     and new.email not ilike '%@icloud.com' then
    new.company_detected := initcap(split_part(split_part(new.email, '@', 2), '.', 1));
    new.lead_score := coalesce(new.lead_score, 50) + 15;
    if coalesce(new.intent_tier, 'General') = 'General' then
      new.intent_tier := 'Corporate / Collab';
    end if;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_score_lead on contact_messages;
create trigger trigger_score_lead
before insert on contact_messages
for each row execute function score_incoming_lead();

-- ============================================================================
-- 5. HIGH-SPEED PERFORMANCE INDEXES
-- ============================================================================

create index if not exists idx_projects_order on projects (display_order, created_at desc);
create index if not exists idx_skills_order on skills (order_index);
create index if not exists idx_experience_order on experience (display_order);
create index if not exists idx_education_order on education (display_order);
create index if not exists idx_certifications_order on certifications (display_order);
create index if not exists idx_updates_published on updates (published, created_at desc);

create index if not exists idx_messages_inbox on contact_messages (is_archived, is_read, created_at desc);
create index if not exists idx_audit_recent on admin_audit_logs (created_at desc);
create index if not exists idx_recruiter_recent on recruiter_events (created_at desc);
create index if not exists idx_chat_messages_session on chat_messages (session_id, created_at asc);

-- Full-Text Search GIN Index
create index if not exists idx_projects_search on projects using gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Vector Similarity Index
create index if not exists idx_kb_chunks_embedding on kb_chunks using ivfflat (embedding vector_cosine_ops);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
alter table site_settings enable row level security;
alter table projects enable row level security;
alter table skills enable row level security;
alter table experience enable row level security;
alter table education enable row level security;
alter table certifications enable row level security;
alter table updates enable row level security;
alter table contact_messages enable row level security;
alter table admin_audit_logs enable row level security;
alter table recruiter_events enable row level security;
alter table portfolio_analytics enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table kb_chunks enable row level security;
alter table kb_gaps enable row level security;

-- 6.1 Public Read Policies
drop policy if exists "Public can read site settings" on site_settings;
create policy "Public can read site settings" on site_settings for select using (true);

drop policy if exists "Public can read projects" on projects;
create policy "Public can read projects" on projects for select using (true);

drop policy if exists "Public can read skills" on skills;
create policy "Public can read skills" on skills for select using (true);

drop policy if exists "Public can read experience" on experience;
create policy "Public can read experience" on experience for select using (true);

drop policy if exists "Public can read education" on education;
create policy "Public can read education" on education for select using (true);

drop policy if exists "Public can read certifications" on certifications;
create policy "Public can read certifications" on certifications for select using (true);

drop policy if exists "Public can read published updates" on updates;
create policy "Public can read published updates" on updates for select using (published = true);

drop policy if exists "Public can read kb_chunks" on kb_chunks;
create policy "Public can read kb_chunks" on kb_chunks for select using (true);

-- 6.2 Public Insert-Only Telemetry & Inquiries
drop policy if exists "Public can submit contact messages" on contact_messages;
create policy "Public can submit contact messages" on contact_messages for insert with check (
  length(email) > 3 and length(message) > 3
);

drop policy if exists "Public can log recruiter events" on recruiter_events;
create policy "Public can log recruiter events" on recruiter_events for insert with check (true);

drop policy if exists "Public can log analytics" on portfolio_analytics;
create policy "Public can log analytics" on portfolio_analytics for insert with check (true);

drop policy if exists "Public can start chat sessions" on chat_sessions;
create policy "Public can start chat sessions" on chat_sessions for all using (true) with check (true);

drop policy if exists "Public can exchange chat messages" on chat_messages;
create policy "Public can exchange chat messages" on chat_messages for all using (true) with check (true);

-- 6.3 Append-Only Audit Trail
drop policy if exists "Audit logs are append-only" on admin_audit_logs;
create policy "Audit logs are append-only" on admin_audit_logs for insert with check (true);

drop policy if exists "Authenticated users can read audit logs" on admin_audit_logs;
create policy "Authenticated users can read audit logs" on admin_audit_logs for select to authenticated using (true);

-- 6.4 Full Admin Access (Authenticated Session)
drop policy if exists "Admin full access site_settings" on site_settings;
create policy "Admin full access site_settings" on site_settings for all to authenticated using (true) with check (true);

drop policy if exists "Admin full access projects" on projects;
create policy "Admin full access projects" on projects for all to authenticated using (true) with check (true);

drop policy if exists "Admin full access skills" on skills;
create policy "Admin full access skills" on skills for all to authenticated using (true) with check (true);

drop policy if exists "Admin full access experience" on experience;
create policy "Admin full access experience" on experience for all to authenticated using (true) with check (true);

drop policy if exists "Admin full access education" on education;
create policy "Admin full access education" on education for all to authenticated using (true) with check (true);

drop policy if exists "Admin full access certifications" on certifications;
create policy "Admin full access certifications" on certifications for all to authenticated using (true) with check (true);

drop policy if exists "Admin full access updates" on updates;
create policy "Admin full access updates" on updates for all to authenticated using (true) with check (true);

drop policy if exists "Admin full access contact_messages" on contact_messages;
create policy "Admin full access contact_messages" on contact_messages for all to authenticated using (true) with check (true);

drop policy if exists "Admin full access kb_gaps" on kb_gaps;
create policy "Admin full access kb_gaps" on kb_gaps for all to authenticated using (true) with check (true);

-- ============================================================================
-- 7. HELPER RPC FUNCTIONS
-- ============================================================================

-- Fast Database Ping Health Check
create or replace function get_db_health_ping()
returns jsonb as $$
begin
  return jsonb_build_object(
    'status', 'healthy',
    'timestamp', now(),
    'version', '2.0.0'
  );
end;
$$ language plpgsql security definer;

-- Vector Similarity Match Function for AI RAG Assistant
create or replace function match_kb_chunks(
  query_embedding vector(512),
  match_threshold float default 0.65,
  match_count int default 5
)
returns table (
  id uuid,
  source text,
  section text,
  content text,
  similarity float
) as $$
begin
  return query
  select
    kb_chunks.id,
    kb_chunks.source,
    kb_chunks.section,
    kb_chunks.content,
    1 - (kb_chunks.embedding <=> query_embedding) as similarity
  from kb_chunks
  where 1 - (kb_chunks.embedding <=> query_embedding) > match_threshold
  order by kb_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$ language plpgsql stable;

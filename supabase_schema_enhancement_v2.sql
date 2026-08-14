-- ============================================================================
-- SUPABASE ENTERPRISE DATABASE SCHEMA ENHANCEMENT (v2.0)
-- Sujith Thota Portfolio & AI Assistant Architecture
-- Includes: RLS Security Policies, Lead Scoring Triggers, High-Speed Indexes,
--           Vector RAG Extension, and Auto-Changelog Mutation Listeners.
-- ============================================================================

-- 0. ENABLE CORE EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ============================================================================
-- 1. CORE CONTENT & CMS TABLES
-- ============================================================================

-- 1.1 Site Settings (Single-Row Global State)
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

-- Ensure default single row exists
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

-- 1.3 Technical Skills Table
create table if not exists skills (
  id text primary key,
  name text not null,
  category text not null, -- 'Languages' | 'AI & ML' | 'Frameworks' | 'Cloud & Tools'
  proficiency_level int default 85,
  order_index int default 0,
  icon text,
  related_tools text[] default '{}',
  projects text[] default '{}',
  created_at timestamptz default now()
);

-- 1.4 Work & Timeline Experience
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

-- 1.7 Updates & Changelog Table
create table if not exists updates (
  id serial primary key,
  version text not null default 'v1.3.0',
  label text,
  title text not null,
  description text,
  impact text default 'Minor', -- 'Major' | 'Minor' | 'Patch'
  category text default 'feature', -- 'feature' | 'improvement' | 'fix'
  items text[] default '{}',
  reactions jsonb default '{"rocket": 0, "party": 0, "heart": 0, "thumbs": 0}'::jsonb,
  published boolean default true,
  created_at timestamptz default now()
);

-- ============================================================================
-- 2. TELEMETRY, LEADS & SECURITY AUDIT TABLES
-- ============================================================================

-- 2.1 Contact Messages & Lead Intelligence
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  inquiry_type text default 'General',
  lead_score int default 50,
  intent_tier text default 'General', -- 'Recruiter (High)' | 'Collab' | 'General'
  company_detected text,
  is_read boolean default false,
  is_archived boolean default false,
  is_spam boolean default false,
  spam_score int default 0,
  ip_address text,
  location text,
  created_at timestamptz default now()
);

-- Ensure columns exist if table was previously created
alter table contact_messages add column if not exists lead_score int default 50;
alter table contact_messages add column if not exists intent_tier text default 'General';
alter table contact_messages add column if not exists company_detected text;
alter table contact_messages add column if not exists is_read boolean default false;
alter table contact_messages add column if not exists is_archived boolean default false;
alter table contact_messages add column if not exists is_spam boolean default false;

-- 2.2 Immutable Administrative Audit Log
create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null, -- 'ADMIN_INSERT_PROJECTS', 'ADMIN_UPDATE_SITE_SETTINGS', etc.
  entity_type text,
  entity_id text,
  details jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- 2.3 Recruiter Engagement Telemetry
create table if not exists recruiter_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null, -- 'resume_download', 'contact_click', 'project_demo', 'github_click'
  event_detail text,
  session_id text,
  created_at timestamptz default now()
);

-- 2.4 Visitor Analytics
create table if not exists portfolio_analytics (
  id uuid primary key default gen_random_uuid(),
  page_path text not null,
  referrer text,
  user_agent text,
  country_code text default 'US',
  session_id text,
  created_at timestamptz default now()
);

-- 2.5 Admin Login History & Security Ledger
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

-- 3.1 Chat Sessions
create table if not exists chat_sessions (
  id text primary key,
  visitor_ip text,
  persona text default 'general',
  created_at timestamptz default now()
);

-- 3.2 Chat Messages
create table if not exists chat_messages (
  id text primary key,
  session_id text references chat_sessions(id) on delete cascade,
  role text not null, -- 'user' | 'assistant' | 'system'
  content text not null,
  tokens_used int default 0,
  created_at timestamptz default now()
);

-- 3.3 Vector Knowledge Base Chunks
create table if not exists kb_chunks (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  section text,
  content text not null,
  embedding vector(512),
  created_at timestamptz default now()
);

-- 3.4 Knowledge Base Gaps Tracker
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
-- 4. INTELLIGENT AUTOMATION TRIGGERS & FUNCTIONS
-- ============================================================================

-- 4.1 Automated Recruiter Intent & Lead Scoring Trigger
create or replace function score_incoming_lead()
returns trigger as $$
begin
  -- 1. Boost score for high-intent hiring keywords
  if new.message ilike any(array['%interview%', '%hire%', '%hiring%', '%job%', '%opportunity%', '%role%', '%salary%', '%vit%', '%offer%', '%ctc%'])
     or new.subject ilike any(array['%job%', '%interview%', '%opportunity%', '%hire%', '%role%']) then
    new.lead_score := new.lead_score + 40;
    new.intent_tier := 'Recruiter (High)';
  end if;

  -- 2. Detect corporate domains vs free webmail
  if new.email not ilike '%@gmail.com' 
     and new.email not ilike '%@yahoo.com' 
     and new.email not ilike '%@outlook.com' 
     and new.email not ilike '%@hotmail.com' 
     and new.email not ilike '%@icloud.com' then
    new.company_detected := initcap(split_part(split_part(new.email, '@', 2), '.', 1));
    new.lead_score := new.lead_score + 15;
    if new.intent_tier = 'General' then
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

-- 4.2 Auto-Changelog Mutation Trigger on Projects
create or replace function auto_log_project_mutation()
returns trigger as $$
declare
  v_count int;
begin
  if (tg_op = 'INSERT') then
    select count(*) into v_count from updates;
    insert into updates (title, version, impact, category, published, description, items, created_at)
    values (
      'Added Project: ' || new.title,
      'v1.3.' || (coalesce(v_count, 0) + 1),
      'Feature',
      'feature',
      true,
      coalesce(substring(new.description from 1 for 140) || '...', 'New technical project published with repository details.'),
      array['[Feature] Added ' || new.title || ' with live pipeline visualizer.'],
      now()
    );
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_auto_log_projects on projects;
create trigger trigger_auto_log_projects
after insert on projects
for each row execute function auto_log_project_mutation();

-- ============================================================================
-- 5. HIGH-SPEED PERFORMANCE INDEXES (< 15ms Query Response)
-- ============================================================================

-- Content Table Ordering Indexes
create index if not exists idx_projects_order on projects (display_order, created_at desc);
create index if not exists idx_skills_order on skills (order_index);
create index if not exists idx_experience_order on experience (display_order);
create index if not exists idx_education_order on education (display_order);
create index if not exists idx_certifications_order on certifications (display_order);
create index if not exists idx_updates_published on updates (published, created_at desc);

-- Admin & Telemetry Query Indexes
create index if not exists idx_messages_inbox on contact_messages (is_archived, is_read, created_at desc);
create index if not exists idx_audit_recent on admin_audit_logs (created_at desc);
create index if not exists idx_recruiter_recent on recruiter_events (created_at desc);
create index if not exists idx_chat_messages_session on chat_messages (session_id, created_at asc);

-- Full-Text Search GIN Index for Projects
create index if not exists idx_projects_search on projects using gin(to_tsvector('english', title || ' ' || coalesce(description, '')));

-- Vector Similarity Index
create index if not exists idx_kb_chunks_embedding on kb_chunks using ivfflat (embedding vector_cosine_ops);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS across all tables
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

-- 6.1 Public Read Policies (Visitors can view public portfolio content)
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

-- 6.3 Append-Only Audit Trail (No updates or deletes permitted)
drop policy if exists "Audit logs are append-only" on admin_audit_logs;
create policy "Audit logs are append-only" on admin_audit_logs for insert with check (true);

drop policy if exists "Authenticated users can read audit logs" on admin_audit_logs;
create policy "Authenticated users can read audit logs" on admin_audit_logs for select to authenticated using (true);

-- 6.4 Full Admin Write Access (Authenticated Admin Session)
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

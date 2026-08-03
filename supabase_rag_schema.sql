-- Enable Vector Extension in Supabase
create extension if not exists vector;

-- 1. Vector-native knowledge base chunks
create table if not exists kb_chunks (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  section text,
  content text not null,
  embedding vector(512), -- match voyage-3-lite dimensions
  created_at timestamptz default now()
);

-- Index for fast cosine similarity search
create index if not exists kb_chunks_embedding_idx on kb_chunks using ivfflat (embedding vector_cosine_ops);

-- 2. Retrieval Feedback Loop
create table if not exists retrieval_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  query text not null,
  rewritten_query text,
  retrieved_sources text[],
  top_score float,
  created_at timestamptz default now()
);

-- Index for session queries
create index if not exists retrieval_logs_session_idx on retrieval_logs (session_id);

-- 3. Knowledge Base Gaps (Low-Confidence Queries)
create table if not exists kb_gaps (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  top_score float,
  session_id text,
  reviewed boolean default false,
  created_at timestamptz default now()
);

-- 4. Session Context & Conversational Memory
create table if not exists session_context (
  session_id text primary key,
  detected_mode text default 'general', -- 'recruiter' | 'developer' | 'general'
  entities jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 5. Generative UI Event Log
create table if not exists ui_events (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  token_type text not null, -- 'NAVIGATE' | 'RENDER_SKILLS' | 'RENDER_PROJECTS' | 'BENTO'
  payload jsonb,
  created_at timestamptz default now()
);

create index if not exists ui_events_session_idx on ui_events (session_id, token_type);

-- 6. Security Anomaly Log
create table if not exists flagged_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  reason text not null, -- 'rate_limit_repeat' | 'prompt_injection_pattern'
  detail jsonb,
  created_at timestamptz default now()
);

-- 7. Request Ops Telemetry
create table if not exists request_telemetry (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  prompt text,
  persona text default 'general',
  input_tokens int default 0,
  output_tokens int default 0,
  latency_ms int default 0,
  top_score float,
  model text default 'llama-3.3-70b-versatile',
  created_at timestamptz default now()
);

create index if not exists request_telemetry_session_idx on request_telemetry (session_id);

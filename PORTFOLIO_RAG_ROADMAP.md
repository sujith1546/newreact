# Portfolio RAG Chatbot — Architecture Breakdown & Upgrade Roadmap

Files: `api/chat.js`, `ChatBot.jsx`  
Stack: Voyage AI, Groq, Supabase, Upstash Redis, React

---

## 1. Current Architecture

### 1.1 Hybrid Retrieval Engine (Vector + Keyword Search)
- **Embedding Model:** Voyage AI (`voyage-3-lite`) generates vector representations for the portfolio knowledge base (`src/data/embeddings.json`).
- **Cosine Similarity Search:** Measures semantic distance between visitor queries and knowledge chunks.
- **Keyword Matching:** Tokenized keyword scoring run in parallel with vector search.
- **Reciprocal Rank Fusion (RRF):** Merges vector rankings and keyword rankings (`rrfMerge`) to produce the top 5 most relevant context chunks.

### 1.2 Query Rewriting Agent
- **Context-Aware Follow-ups:** A fast Groq call (`rewriteQuery`) rewrites vague multi-turn follow-ups (e.g. "What about his CGPA?") into standalone contextual queries (e.g. "What is Sujith Thota's CGPA at VIT University?") before retrieval runs.

### 1.3 Generative UI & "Screen Director" Navigation
- **Live UI Control Tokens** emitted by the LLM in real time:
  - `[NAVIGATE:sectionId:keyword]` — scrolls the portfolio, switches tabs, highlights specific UI cards (e.g. jumping to the Financial Sentiment project).
  - `[RENDER_SKILLS]` / `[RENDER_PROJECTS]` — dynamically injects interactive React charts and carousels inside the chat window.
  - `[BENTO_START] ... [BENTO_END]` — renders dynamic 4-card metric bento boxes inside the AI response.

### 1.4 Multimodal Vision Agent
- **Image Recognition:** Supports base64 image uploads; routes to `llama-3.2-11b-vision-preview` to inspect visual inputs alongside text prompts.

### 1.5 Adaptive Personality Protocol
- **Tone Detection:**
  - *Recruiter Mode* — formal, bullet-pointed summaries highlighting metrics and business impact.
  - *Developer Mode* — detects casual tech queries ("yo, how did u build this?") and shifts to an enthusiastic tone with code snippets.

### 1.6 Enterprise Security & Rate Limiting
- **Upstash Redis:** Durable sliding-window rate limiting (10 requests/min), with a stateful in-memory fallback.
- **Session Leasing:** Crypto-random session tokens (`x-portfolio-session`).
- **Input Capping:** 2,000-character limit as prompt-injection protection.
- **PII Redaction:** Regex filters for phone, email, and account numbers.

### 1.7 Telemetry & Admin Analytics
- Streams execution steps (`data: { type: "step", node: "rag" }`) via Server-Sent Events (SSE).
- Logs session history to Supabase (`chat_sessions`, `chat_messages`) for the admin dashboard.

---

## 2. Where the Architecture Is Over-Built (Trim Candidates)

At the scale of a single-person portfolio KB (dozens to low-hundreds of chunks), a few components are doing more engineering than the problem needs:

| Component | Why it may be overkill | What to do instead |
|---|---|---|
| Hybrid Retrieval + RRF | Cosine similarity alone will likely surface the same top-5 chunks at this corpus size. RRF earns its keep on large corpora with exact-term ambiguity (acronyms, IDs). | Check retrieval logs — if keyword search rarely changes the outcome, drop it and keep pure vector search. |
| Multimodal Vision Agent | Adds a model dependency for a feature visitors may never trigger on a portfolio site. | Log usage (`used_vision=true`) for a few weeks; retire if near-zero. |
| Upstash Redis rate limiting | Enterprise-grade sliding-window infra for personal-site traffic levels. | In-memory rate limiting alone is likely sufficient unless traffic scales significantly. |
| Separate Query Rewriting call | Adds a network round-trip + latency to every follow-up message. | Consider folding last 1–2 turns of history directly into the main generation prompt instead of a dedicated rewrite step, unless rewriting is measurably improving retrieval quality. |

**Keep as-is (genuine differentiators):**
- Generative UI / Screen Director tokens — the most portfolio-impressive piece; real frontend+LLM integration skill on display.
- Adaptive tone detection — cheap, high perceived value.
- Input capping + PII redaction — low cost, real safety value.
- SSE step streaming + Supabase logging — cheap and useful for analytics.

---

## 3. Upgrade Roadmap (Using Existing Supabase Connection)

Since Supabase is already wired in, it can become the backbone for a much more advanced system without adding new vendors.

### 3.1 Retrieval → Self-Improving Retrieval
- Move `embeddings.json` into a Supabase **pgvector** column instead of a static file. Enables SQL-native similarity search (`<=>` operator) and lets you update the KB without redeploying.
- Log every query + retrieved chunk IDs + an implicit "was this helpful" signal (e.g. no immediate rephrase) into a `retrieval_logs` table — turns retrieval into a feedback loop instead of a static pipeline.
- Add a confidence threshold: if the top cosine score is below a set value, skip generation and either respond with a graceful "I don't have that info yet" or auto-flag the query into a `kb_gaps` table for later review.

### 3.2 Query Rewriting → Persistent Conversational Memory
- Store rewritten queries alongside originals in Supabase per session — over time this becomes a labeled dataset for improving the rewrite prompt using real visitor phrasing.
- Add lightweight entity memory: cache key facts already established in a session (e.g. "currently discussing VIT") in a `session_context` table so the rewriter doesn't need a full transcript replay each turn.

### 3.3 Generative UI → Analytics-Driven UI
- Log every `[NAVIGATE]`, `[RENDER_SKILLS]`, `[BENTO_START]` emission with session + timestamp into Supabase — gives a literal heatmap of what visitors ask the AI to surface, which is useful signal for what to feature more prominently on the site itself.
- Consider a new `[COMPARE]` token to render a side-by-side bento for two projects/skills when a visitor asks comparative questions, reusing the existing bento renderer.

### 3.4 Multimodal Vision → Usage-Gated Feature
- If kept, log uploads (privacy-safe, not storing raw images) with a `used_vision=true` flag. Use dashboard data to decide whether to keep or retire the feature.

### 3.5 Adaptive Personality → Segmented Analytics
- Store detected mode (`recruiter` / `developer` / `general`) per session in Supabase. This becomes real visitor-segmentation data — who's visiting (hiring managers vs. engineers vs. casual browsers) and what each segment asks about most.
- Use segmentation to A/B different system prompts per mode and track engagement (session length, follow-up count) by variant.

### 3.6 Security → Supabase-Backed Option
- Optionally unify rate-limiting into a `rate_limits` table with TTL logic via a scheduled Postgres function, removing the Upstash dependency for a single-datastore architecture.
- Add anomaly logging: flag sessions that repeatedly hit rate limits or send prompt-injection-pattern strings into a `flagged_sessions` table.

### 3.7 Telemetry → Real Product Analytics (highest leverage)
- **Funnel view:** sessions → messages sent → NAVIGATE triggers → project-page conversions.
- **Query clustering:** periodically embed logged queries and cluster them (k-means on existing Voyage embeddings) to auto-discover FAQ themes without manual tagging.
- **Latency + cost tracking:** log token counts and response times per request for p95 latency and Groq/Voyage spend over time — turns telemetry into a real ops dashboard.
- **Live session replay:** a simple admin-panel session viewer (search by session, view full transcript + which UI tokens fired) to audit tone-detection accuracy and retrieval quality on real transcripts.

---

## 4. Suggested Supabase Schema Additions

```sql
-- Vector-native knowledge base
create table kb_chunks (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(512), -- match voyage-3-lite dimension
  section text,
  created_at timestamptz default now()
);

-- Retrieval feedback loop
create table retrieval_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text references chat_sessions(id),
  query text,
  rewritten_query text,
  retrieved_chunk_ids uuid[],
  top_score float,
  created_at timestamptz default now()
);

-- Knowledge base gaps (low-confidence queries)
create table kb_gaps (
  id uuid primary key default gen_random_uuid(),
  query text,
  top_score float,
  session_id text,
  reviewed boolean default false,
  created_at timestamptz default now()
);

-- Session-level conversational memory
create table session_context (
  session_id text primary key references chat_sessions(id),
  entities jsonb default '{}'::jsonb,
  detected_mode text, -- 'recruiter' | 'developer' | 'general'
  updated_at timestamptz default now()
);

-- Generative UI event log
create table ui_events (
  id uuid primary key default gen_random_uuid(),
  session_id text references chat_sessions(id),
  token_type text, -- 'NAVIGATE' | 'RENDER_SKILLS' | 'RENDER_PROJECTS' | 'BENTO'
  payload jsonb,
  created_at timestamptz default now()
);

-- Security anomaly log
create table flagged_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text references chat_sessions(id),
  reason text, -- 'rate_limit_repeat' | 'prompt_injection_pattern'
  detail jsonb,
  created_at timestamptz default now()
);

-- Ops telemetry
create table request_telemetry (
  id uuid primary key default gen_random_uuid(),
  session_id text references chat_sessions(id),
  input_tokens int,
  output_tokens int,
  latency_ms int,
  model text,
  created_at timestamptz default now()
);
```

Indexes worth adding:
```sql
create index on kb_chunks using ivfflat (embedding vector_cosine_ops);
create index on retrieval_logs (session_id);
create index on ui_events (session_id, token_type);
```

---

## 5. Suggested Priority Order

1. **Telemetry/Admin Dashboard upgrades (3.7)** — highest leverage, uses data you're already logging.
2. **pgvector migration (3.1)** — unlocks live KB updates without redeploy.
3. **UI event logging (3.3)** — cheap to add, immediately useful for content decisions.
4. **Segmented analytics (3.5)** — reuses existing tone-detection logic.
5. **Confidence-threshold fallback (3.1)** — improves visitor experience directly.
6. Everything else (session memory, comparison token, security consolidation) as time allows.

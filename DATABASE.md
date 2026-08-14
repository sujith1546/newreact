# 🗄️ Master Database Architecture & Schema Specification (Supabase PostgreSQL)

This document is the authoritative database architecture reference for the **Sujith Thota Portfolio & AI Assistant** application. It details every table, column, trigger, RLS policy, vector embedding configuration, and frontend hook mapping.

---

## 📑 Table of Contents
1. [Overview & Core Architecture](#1-overview--core-architecture)
2. [Master Entity-Relationship (ER) Map](#2-master-entity-relationship-er-map)
3. [Table Schemas & Column Dictionaries](#3-table-schemas--column-dictionaries)
   - [3.1 Content & CMS Tables](#31-content--cms-tables)
   - [3.2 Telemetry, Leads & Security Tables](#32-telemetry-leads--security-tables)
   - [3.3 AI ChatBot & Vector RAG Tables](#33-ai-chatbot--vector-rag-tables)
4. [PostgreSQL Triggers & Stored Functions](#4-postgresql-triggers--stored-functions)
5. [Row-Level Security (RLS) Matrix](#5-row-level-security-rls-matrix)
6. [High-Performance Indexes](#6-high-performance-indexes)
7. [Frontend Hooks & Codebase Table Consumption](#7-frontend-hooks--codebase-table-consumption)
8. [Migration & Update Guidelines for Agents & Developers](#8-migration--update-guidelines-for-agents--developers)

---

## 1. Overview & Core Architecture

* **Database Engine**: PostgreSQL 15+ (hosted on Supabase)
* **Extensions Enabled**:
  * `uuid-ossp` & `pgcrypto` — Primary key UUID generation & cryptography.
  * `vector` (`pgvector`) — 512-dimensional vector embeddings for AI semantic search.
* **Sync & Cache Engine**:
  * **SWR Client Caching**: `useRealtimeData.js` with `localStorage` fallback for 0ms initial paint.
  * **P2P Broadcast Channel**: `broadcastSyncEngine.js` (`pcms_realtime_sync`) across browser tabs.
  * **Postgres Realtime Subscriptions**: `supabase.channel(...)` on mutations.

---

## 2. Master Entity-Relationship (ER) Map

```
┌─────────────────────────┐       ┌─────────────────────────┐
│      site_settings      │       │     contact_messages    │
│  (Single-row CMS state) │       │  (Leads & Recruiter)    │
└─────────────────────────┘       └─────────────────────────┘
             │                                 │
             ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│        projects         │       │    recruiter_events     │
│ (AI/ML & Web portfolio) │       │ (Resume downloads, etc) │
└─────────────────────────┘       └─────────────────────────┘
             │                                 │
             ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│   skills / experience   │       │   portfolio_analytics   │
│  education / certs      │       │ (Visitor geo & pages)   │
└─────────────────────────┘       └─────────────────────────┘
             │                                 │
             ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│         updates         │◄──────┤    admin_audit_logs     │
│ (System Changelog Feed) │       │  (Immutable Audit Log)  │
└─────────────────────────┘       └─────────────────────────┘
             │
             ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│        kb_chunks        │       │      chat_sessions      │
│ (512d Vector Knowledge) │       │            │            │
└─────────────────────────┘       │            ▼            │
                                  │      chat_messages      │
                                  └─────────────────────────┘
```

---

## 3. Table Schemas & Column Dictionaries

### 3.1 Content & CMS Tables

#### `site_settings`
Global configuration and feature flags (strictly 1 single row with `id = 1`).
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `int` (PK) | `1` | Primary key |
| `site_disabled` | `boolean` | `false` | Global website kill-switch |
| `maintenance_mode` | `boolean` | `false` | Shows maintenance shield if `true` |
| `maintenance_message` | `text` | `'Under scheduled...'` | Text displayed during maintenance |
| `hero_headline` | `text` | `'Full-Stack Developer...'` | Primary headline on Home page |
| `short_bio` | `text` | `'B.Tech CSE...'` | Short introduction bio |
| `avatar_url` | `text` | `null` | Profile avatar image link |
| `resume_url` | `text` | `null` | PDF resume link |
| `theme_color` | `text` | `'#3b82f6'` | Accent hex color |
| `feature_experience` | `boolean` | `true` | Toggles Experience section |
| `feature_certifications` | `boolean` | `true` | Toggles Certifications section |
| `feature_ai_assistant` | `boolean` | `true` | Toggles Floating AI ChatBot |
| `updated_at` | `timestamptz` | `now()` | Last modification timestamp |

#### `projects`
Portfolio projects showcase with architecture pipelines and statistics.
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `text` (PK) | — | Unique project slug/ID (e.g. `'ai-financial-advisor'`) |
| `title` | `text` | `NOT NULL` | Display title |
| `description` | `text` | `null` | Project overview |
| `image` | `text` | `null` | Thumbnail image URL |
| `tags` | `text[]` | `'{}'` | Array of technology tags (e.g. `['Python', 'LangChain']`) |
| `category` | `text` | `'AI / ML'` | Classification category |
| `github_url` | `text` | `null` | GitHub source repository URL |
| `live_url` | `text` | `null` | Live deployment URL |
| `featured` | `boolean` | `false` | Highlighted on homepage bento |
| `display_order` | `int` | `0` | Ascending sort index |
| `stats` | `jsonb` | `'[]'` | Metric chips `[{"label": "Accuracy", "value": "98%"}]` |
| `pipeline` | `jsonb` | `'[]'` | RAG / ML pipeline steps |
| `architecture` | `jsonb` | `'[]'` | Architecture block items |
| `code` | `text` | `null` | Code snippet for interactive preview |
| `created_at` | `timestamptz` | `now()` | Creation timestamp |

#### `skills`
Technical proficiencies and tools.
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `text` (PK) | — | Skill identifier (e.g. `'pytorch'`) |
| `name` | `text` | `NOT NULL` | Skill name (e.g. `'PyTorch'`) |
| `category` | `text` | `NOT NULL` | `'Languages'`, `'AI & ML'`, `'Frameworks'`, `'Cloud & Tools'` |
| `proficiency_level` | `int` | `85` | Percentage proficiency (0–100) |
| `order_index` | `int` | `0` | Sort order index |
| `icon` | `text` | `null` | Lucide icon name or SVG link |
| `related_tools` | `text[]` | `'{}'` | Sub-tools (e.g. `['CUDA', 'TensorBoard']`) |
| `projects` | `text[]` | `'{}'` | Associated project IDs |
| `created_at` | `timestamptz` | `now()` | Creation timestamp |

#### `experience`
Work history and academic milestones.
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `text` (PK) | — | Experience ID |
| `role` | `text` | `NOT NULL` | Job role or title |
| `company` | `text` | `NOT NULL` | Company or organization name |
| `location` | `text` | `'Remote'` | Physical or remote location |
| `start_date` | `text` | `NOT NULL` | e.g. `'June 2024'` |
| `end_date` | `text` | `'Present'` | e.g. `'Present'` or `'Aug 2024'` |
| `is_education` | `boolean` | `false` | Flag if academic entry |
| `description_bullets` | `text[]` | `'{}'` | Key achievements bullet points |
| `display_order` | `int` | `0` | Sort order index |
| `created_at` | `timestamptz` | `now()` | Creation timestamp |

#### `education`
Academic degrees and institutional credentials.
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `text` (PK) | — | Education ID |
| `institution` | `text` | `NOT NULL` | e.g. `'VIT University'` |
| `degree` | `text` | `NOT NULL` | e.g. `'B.Tech Computer Science'` |
| `field_of_study` | `text` | `null` | Specialization (e.g. `'Data Science'`) |
| `cgpa` | `text` | `null` | e.g. `'8.7 / 10.0'` |
| `year` | `text` | `NOT NULL` | e.g. `'2022 - 2026'` |
| `location` | `text` | `null` | Campus location (e.g. `'Vellore, India'`) |
| `highlights` | `text[]` | `'{}'` | Key coursework and honors |
| `back_stats` | `jsonb` | `'[]'` | Stats displayed on card flip |
| `display_order` | `int` | `0` | Sort order index |
| `created_at` | `timestamptz` | `now()` | Creation timestamp |

#### `certifications`
Verified licenses and certifications.
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `text` (PK) | — | Certification ID |
| `name` | `text` | `NOT NULL` | Certification title |
| `issuer` | `text` | `NOT NULL` | Issuing body (e.g. `'DeepLearning.AI'`) |
| `issue_date` | `text` | `null` | Date issued |
| `credential_url` | `text` | `null` | External verification URL |
| `badge_image` | `text` | `null` | Badge thumbnail |
| `display_order` | `int` | `0` | Sort order index |
| `created_at` | `timestamptz` | `now()` | Creation timestamp |

#### `updates` (Changelog & System Releases)
Live changelog entries consumed by the visitor `UpdatesModal` and `NotificationCenter`.
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `serial` (PK) | auto | Integer sequence ID |
| `version` | `text` | `'v1.3.0'` | Semantic version |
| `label` | `text` | `null` | Badge label (e.g. `'v1.3.0 Release'`) |
| `title` | `text` | `NOT NULL` | Headline title |
| `description` | `text` | `null` | Release summary |
| `impact` | `text` | `'Minor'` | `'Major'`, `'Minor'`, `'Patch'` |
| `category` | `text` | `'feature'` | `'feature'`, `'improvement'`, `'fix'` |
| `items` | `text[]` | `'{}'` | Bulleted release changes |
| `reactions` | `jsonb` | `{"rocket":0,...}` | Reaction counters `{rocket, party, heart, thumbs}` |
| `published` | `boolean` | `true` | Public visibility flag |
| `created_at` | `timestamptz` | `now()` | Publication timestamp |

---

### 3.2 Telemetry, Leads & Security Tables

#### `contact_messages`
Inquiries submitted via the Contact form with automated lead scoring.
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` (PK) | `gen_random_uuid()` | Unique UUID |
| `name` | `text` | `NOT NULL` | Sender full name |
| `email` | `text` | `NOT NULL` | Sender email |
| `subject` | `text` | `null` | Subject line |
| `message` | `text` | `NOT NULL` | Inquiry text body |
| `inquiry_type` | `text` | `'General'` | Category dropdown selection |
| `lead_score` | `int` | `50` | AI/Trigger-calculated intent score (0–100) |
| `intent_tier` | `text` | `'General'` | `'Recruiter (High)'`, `'Corporate / Collab'`, `'General'` |
| `company_detected`| `text` | `null` | Extracted corporate domain |
| `is_read` | `boolean` | `false` | Read status |
| `is_archived` | `boolean` | `false` | Archive status |
| `is_spam` | `boolean` | `false` | Spam filter flag |
| `spam_score` | `int` | `0` | Spam probability score |
| `ip_address` | `text` | `null` | Submitter IP address |
| `location` | `text` | `null` | Geo-located city/country |
| `created_at` | `timestamptz` | `now()` | Submission timestamp |

#### `admin_audit_logs`
Immutable audit ledger recording all administrative mutations.
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` (PK) | `gen_random_uuid()` | Unique log UUID |
| `action` | `text` | `NOT NULL` | Action code (e.g. `'ADMIN_INSERT_PROJECTS'`) |
| `entity_type` | `text` | `null` | Target table (e.g. `'projects'`) |
| `entity_id` | `text` | `null` | Target ID or slug |
| `details` | `jsonb` | `'{}'` | Metadata payload |
| `ip_address` | `text` | `null` | Admin IP |
| `created_at` | `timestamptz` | `now()` | Timestamp |

#### `recruiter_events`
Visitor engagement telemetry for recruiter interactions.
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` (PK) | `gen_random_uuid()` | Event UUID |
| `event_type` | `text` | `NOT NULL` | `'resume_download'`, `'contact_click'`, `'project_demo'`, `'github_click'` |
| `event_detail` | `text` | `null` | Detail payload |
| `session_id` | `text` | `null` | Visitor session ID |
| `created_at` | `timestamptz` | `now()` | Event timestamp |

#### `portfolio_analytics`
Page views, referrers, and visitor demographics.
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` (PK) | `gen_random_uuid()` | Event UUID |
| `page_path` | `text` | `NOT NULL` | e.g. `'/projects'`, `'/skills'` |
| `referrer` | `text` | `null` | Inbound referrer URL |
| `user_agent` | `text` | `null` | Browser user-agent |
| `country_code` | `text` | `'US'` | Geo country code |
| `session_id` | `text` | `null` | Session token |
| `created_at` | `timestamptz` | `now()` | Timestamp |

---

### 3.3 AI ChatBot & Vector RAG Tables

#### `kb_chunks` (Vector Store)
Vector-native knowledge base chunks for RAG search.
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` (PK) | `gen_random_uuid()` | Chunk UUID |
| `source` | `text` | `NOT NULL` | Document source (`'projects.json'`, `'resume.pdf'`) |
| `section` | `text` | `null` | Section heading |
| `content` | `text` | `NOT NULL` | Text content chunk |
| `embedding` | `vector(512)` | `null` | 512-dim embedding vector (`voyage-3-lite` / `text-embedding-3-small`) |
| `created_at` | `timestamptz` | `now()` | Ingestion timestamp |

#### `kb_gaps` (AI Knowledge Gap Log)
Logs queries where the AI ChatBot had low confidence (< 0.65 similarity), allowing the author to expand their portfolio.
| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` (PK) | `gen_random_uuid()` | Gap UUID |
| `query` | `text` | `NOT NULL` | Recruiter/Visitor query string |
| `top_score` | `float` | `null` | Best similarity score obtained |
| `session_id` | `text` | `null` | Session ID |
| `detected_persona`| `text` | `'general'` | `'recruiter'`, `'developer'`, `'general'` |
| `reviewed` | `boolean` | `false` | Marked as reviewed by admin |
| `created_at` | `timestamptz` | `now()` | Timestamp |

#### `chat_sessions` & `chat_messages`
Chat conversation persistence for the floating Groq LLM Assistant.

---

## 4. PostgreSQL Triggers & Stored Functions

### 1. `score_incoming_lead()` Trigger
* **Target**: `BEFORE INSERT ON contact_messages`
* **Purpose**: Automatically scans message and subject for hiring/salary keywords (`hire`, `interview`, `job`, `ctc`, `role`) and corporate email domains, automatically setting `lead_score` (boosted by +40) and `intent_tier = 'Recruiter (High)'`.

### 2. `auto_log_project_mutation()` Trigger
* **Target**: `AFTER INSERT ON projects`
* **Purpose**: Automatically synthesizes and inserts a new release record into `updates` when a project is added, keeping the changelog synchronized at the database level.

### 3. `match_kb_chunks(...)` RPC Function
* **Purpose**: Executes cosine similarity search (`1 - (embedding <=> query_embedding)`) on `kb_chunks` and returns top matching chunks above threshold.

### 4. `get_db_health_ping()` RPC Function
* **Purpose**: Lightweight round-trip latency and health verification function called by `useOperationsSyncCenter`.

---

## 5. Row-Level Security (RLS) Matrix

| Table | `SELECT` (Public) | `INSERT` (Public) | `UPDATE` (Public) | `DELETE` (Public) | Admin Access (`authenticated`) |
|---|---|---|---|---|---|
| `site_settings` | ✅ Allowed | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Full CRUD |
| `projects` | ✅ Allowed | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Full CRUD |
| `skills` | ✅ Allowed | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Full CRUD |
| `experience` | ✅ Allowed | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Full CRUD |
| `education` | ✅ Allowed | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Full CRUD |
| `certifications` | ✅ Allowed | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Full CRUD |
| `updates` | ✅ (`published=true`) | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Full CRUD |
| `contact_messages` | ❌ Blocked | ✅ (Validation Check) | ❌ Blocked | ❌ Blocked | ✅ Full CRUD |
| `admin_audit_logs`| ❌ Blocked | ✅ Append-only | ❌ Blocked | ❌ Blocked | ✅ Read-only (Immutable) |
| `recruiter_events`| ❌ Blocked | ✅ Allowed | ❌ Blocked | ❌ Blocked | ✅ Full CRUD |
| `portfolio_analytics`| ❌ Blocked | ✅ Allowed | ❌ Blocked | ❌ Blocked | ✅ Full CRUD |
| `kb_chunks` | ✅ Allowed | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Full CRUD |
| `kb_gaps` | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Full CRUD |

---

## 6. High-Performance Indexes

* **Content Ordering**:
  * `idx_projects_order` ON `projects (display_order, created_at desc)`
  * `idx_skills_order` ON `skills (order_index)`
  * `idx_experience_order` ON `experience (display_order)`
  * `idx_education_order` ON `education (display_order)`
  * `idx_certifications_order` ON `certifications (display_order)`
  * `idx_updates_published` ON `updates (published, created_at desc)`
* **Full-Text Search**:
  * `idx_projects_search` ON `projects USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')))`
* **Vector Semantic Index**:
  * `idx_kb_chunks_embedding` ON `kb_chunks USING ivfflat (embedding vector_cosine_ops)`

---

## 7. Frontend Hooks & Codebase Table Consumption

| Hook / Service | Primary Tables Interacted With | Role |
|---|---|---|
| `useRealtimeData.js` | `site_settings`, `projects`, `skills`, `experience`, `education`, `certifications` | Global SWR caching, instant 0ms state, realtime table listeners. |
| `useOperationsSyncCenter.js` | `updates`, `recruiter_events`, `admin_audit_logs`, `contact_messages` | Realtime Operations Center, latency monitoring, cloud re-sync. |
| `useUpdates.js` | `updates`, GitHub Commits API | System changelog modal, reaction counters, unread notification badge. |
| `syncDispatcher.js` | All CMS tables | Realtime dispatcher triggering same-tab CustomEvents, P2P BroadcastChannel, and audit logging. |
| `auditLogger.js` | `admin_audit_logs` | Security & mutation logging. |
| `conversionTracker.js` | `recruiter_events` | Logs resume downloads, GitHub clicks, and contact clicks. |

---

## 8. Migration & Update Guidelines for Agents & Developers

1. **Always Use Resilient Column Patching**:
   * When creating or modifying tables, always write:
     `ALTER TABLE <table_name> ADD COLUMN IF NOT EXISTS <col> <type> DEFAULT <val>;`
   * Never assume a column exists before running an `INDEX` creation.
2. **Preserve RLS Integrity**:
   * Never disable RLS on `contact_messages` or `admin_audit_logs`.
   * Public visitors must only access published content and insert validated telemetry.
3. **Keep Realtime Sync Active**:
   * Whenever creating a new content table, ensure it is added to the subscription list in `useRealtimeData.js` and `broadcastSyncEngine.js`.
4. **Applying New Migrations**:
   * Run migrations through Supabase SQL Editor via `supabase_schema_enhancement_v2.sql`.

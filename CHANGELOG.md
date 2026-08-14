# 📜 Changelog

All notable changes to the **Sujith Thota Portfolio & AI Platform** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.3.0] — 2026-08-14

### 🚀 Added
- **Live Database Operations & Sync Center (`useOperationsSyncCenter.js`)**: Real-time Supabase telemetry, round-trip latency indicator badge (`🟢 24ms Live`), and parallel table cloud re-sync.
- **Automated System Updates & Changelog (`autoChangelogEngine.js`)**: Real-time changelog synthesizing database mutations, live GitHub commit streaming (`sujith1546/newreact`), and visitor emoji reactions.
- **AI Release Synthesizer (`UpdatesPanel.jsx`)**: 1-Click "✨ Auto-Synthesize Release" button in Admin Console that converts recent audit activity into formatted release bullet points.
- **Database Schema Enhancement v2.0 (`supabase_schema_enhancement_v2.sql`)**: Resilient SQL migration script including Row-Level Security (RLS) policies, automated lead scoring trigger, and ivfflat vector indexes.
- **Master Database Architecture Specification (`DATABASE.md`)**: Comprehensive column dictionaries, ER diagrams, triggers, and frontend hook mappings.

### ⚡ Changed
- **Modular Directory Architecture**: Refactored entire codebase into domain-driven structure (`src/app/`, `src/features/`, `src/core/`, `src/shared/`, `src/styles/`).
- **Heavy Bundle Code-Splitting**: Code-split `react-pdf` and `pdfjs-dist` into isolated lazy chunks, shrinking production build time to under 6.0s.
- **Defensive String & Null Safety**: Added defensive optional chaining across all project cards, mobile rows, chat panels, and education year splitting.

### 🛡️ Security & Fixes
- Added session check protection on `contact_messages` queries in the public navigation bar.
- Implemented append-only immutable audit trail rules in Supabase RLS.

---

## [v1.2.4] — 2026-08-10

### 🚀 Added
- **Groq Llama 3 AI Conversational Assistant**: Streaming LLM chat with persona switcher (`Developer`, `Recruiter`, `General`) and real-time token telemetry.
- **1-Click Full CMS Backup**: JSON data export and restore engine in Admin Settings.
- **SaaS Dark Mode Design System**: 60% high-density responsive control center with glassmorphism aesthetics.

### 🛡️ Security
- Unified site lockdown and maintenance shield controls in `site_settings`.

---

## [v1.2.0] — 2026-08-05

### ⚡ Performance & Polish
- Standardized global 80px desktop viewport height formulas (`calc(100vh - 80px)`).
- Optimized pull-to-refresh mobile viewport animations.
- Implemented Apple-style Dynamic Island feedback toasts (`useIsland`).

---

## [v1.1.0] — 2026-07-28

### 🚀 Initial Release
- Multi-page React 18 portfolio showcasing Data Science, Machine Learning, and Web projects.
- Interactive Skills radar, Experience timeline, and B.Tech VIT coursework highlights.
- Supabase PostgreSQL integration with real-time subscriptions.

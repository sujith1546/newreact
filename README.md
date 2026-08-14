# ⚡ Sujith Thota — Enterprise Portfolio & Intelligent AI Platform

<div align="center">

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Groq AI](https://img.shields.io/badge/Groq_Llama_3-F05032?style=for-the-badge&logo=openai&logoColor=white)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-10B981?style=for-the-badge&logo=pwa&logoColor=white)
![Zero Crash](https://img.shields.io/badge/Zero--Crash-Error_Boundaries-3B82F6?style=for-the-badge)

**A modern, production-grade portfolio and AI platform built for Data Science, Machine Learning, and Full-Stack Engineering.**

[Live Demo](https://sujiththota.dev) • [Architecture Docs](PROJECT_DOCUMENTATION.md) • [Database Reference](DATABASE.md) • [Changelog](CHANGELOG.md)

</div>

---

## 🌟 Key Platform Capabilities

- **⚡ Instant 0ms Paint & SWR Caching**: Optimistic rendering with `localStorage` fallback and sub-millisecond P2P inter-tab synchronization via `BroadcastChannel`.
- **🗄️ Database-Connected Operations & Sync Center**: Live latency heartbeat monitor (`🟢 24ms Live`), one-click parallel cloud re-sync, and audit trail export.
- **🤖 Groq LLM Conversational Assistant**: Interactive AI assistant with real-time vector RAG memory, persona switching (`Developer`, `Recruiter`, `General`), and lead qualification.
- **📢 Automated System Updates & Changelog (v1.3.0)**: Real-time changelog synthesizing database mutations, live GitHub commit streaming, and visitor emoji reactions.
- **🛡️ Enterprise Multi-Layer Security**: Admin MFA with authenticator PIN, DevTools anti-tamper traps, append-only immutable audit logs, and Supabase Row-Level Security (RLS).
- **📱 Responsive High-Density SaaS UI**: Fixed 80px viewport architecture on desktop, smooth pull-to-refresh mobile shell, dark/light themes, and Apple-style Dynamic Island feedback.

---

## 🏗️ Modern Directory Architecture

```
src/
├── app/                        # Root application setup & provider composition
│   ├── App.jsx                 # App shell & router wrapper
│   ├── AppProviders.jsx        # Unified Theme, Auth, Toast & Query providers
│   └── routes.jsx              # Centralized route definitions & lazy loaders
│
├── core/                       # Global infrastructure & system hooks
│   ├── hooks/                  # useOperationsSyncCenter, useRealtimeData, etc.
│   ├── lib/                    # Supabase client, broadcast engine, audit logger
│   └── utils/                  # autoChangelogEngine, sanitizers, conversion tracker
│
├── features/                   # Domain-driven feature modules
│   ├── admin/                  # CMS panels, telemetry dashboard, MFA security
│   ├── portfolio/              # Projects, Skills, About, Experience, Education
│   ├── resume/                 # Code-split PDF viewer and quick-look modal
│   ├── scheduling/             # Meeting scheduler & calendar integration
│   └── widgets/                # Updates modal, timezone bar, network signal
│
├── shared/                     # Reusable shared UI primitives
│   ├── feedback/               # React ErrorBoundary & route crash fallbacks
│   ├── layout/                 # Sidebar, Dynamic Island, Shells
│   └── ui/                     # Badges, buttons, modals, dropdowns
│
└── styles/                     # CSS design system (tokens, typography, animations)
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**

### 2. Clone & Install
```bash
# Clone the repository
git clone https://github.com/sujith1546/newreact.git

# Navigate to project directory
cd newreact

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Assistant
GROQ_API_KEY=your-groq-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key

# Security & Admin Access
ADMIN_EMAIL=your-email@domain.com
ADMIN_PASSCODE=your-secure-passcode
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### 4. Run Development Server
```bash
# Starts both Vite client (port 5173) and local API proxy (port 3001)
npm run dev
```

Visit **`http://localhost:5173/`** in your browser.

---

## 📚 Complete Documentation Index

| Document | Description |
|---|---|
| 🗄️ **[`DATABASE.md`](DATABASE.md)** | Master Supabase schema, table dictionaries, RLS matrix, triggers, and indexes. |
| 📐 **[`PROJECT_DOCUMENTATION.md`](PROJECT_DOCUMENTATION.md)** | Complete component specifications, viewport offset formulas, and UI rules. |
| 🤖 **[`AI_CONTEXT.md`](AI_CONTEXT.md)** | Quick-reference manual for AI coding assistants. |
| 🚀 **[`DEPLOYMENT.md`](DEPLOYMENT.md)** | Production hosting, Vercel/Netlify CI/CD, and SSL setup guide. |
| 🛡️ **[`SECURITY.md`](SECURITY.md)** | Security architecture, rate limiting, and threat mitigation models. |
| 📜 **[`CHANGELOG.md`](CHANGELOG.md)** | Version history and release notes archive. |
| 🧠 **[`PORTFOLIO_RAG_ROADMAP.md`](PORTFOLIO_RAG_ROADMAP.md)** | AI vector embeddings and semantic search roadmap. |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v7, Framer Motion, Vanilla CSS Design System, Lucide & Tabler Icons.
- **Backend & Database**: Supabase PostgreSQL 15, `pgvector`, Realtime WebSocket Channels, Node.js Express.
- **AI & ML**: Groq SDK (Llama 3.3 70B), Google Gemini SDK, Vector Embeddings.
- **Bundler & Build Tools**: Vite 8, Rollup Visualizer, TypeScript, vite-plugin-pwa.

---

## 👨‍💻 Author

**Sujith Thota**  
*B.Tech Computer Science (Data Science), VIT University*  
- **GitHub**: [@sujith1546](https://github.com/sujith1546)
- **LinkedIn**: [Sujith Thota](https://linkedin.com/in/sujiththota)

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

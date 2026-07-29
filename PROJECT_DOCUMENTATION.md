# Portfolio Web Application — Complete Technical Documentation & AI Reference Manual

## 1. Executive Summary & Architecture Overview

This project is a state-of-the-art, high-performance **Personal Portfolio & Data Science Showcase** built for **Sujith Thota** (B.Tech Computer Science student at VIT Vellore, specializing in Data Science & Machine Learning).

The application is engineered as a **Single-Page Application (SPA)** with zero-latency section switching, real-time Supabase telemetry, PWA offline capability, interactive AI assistance, and strict viewport layout constraints for a desktop native-app feel.

### Key Architecture Stack
* **Frontend Framework**: React 18+ (Vite build system, JSX, React Router v7)
* **Animation & Motion**: Framer Motion (page transitions, staggered reveals, 3D card tilt, SVG draws)
* **Styling & CSS**: Vanilla CSS Design System with CSS Custom Properties (`--bg-primary`, `--bg-secondary`, `--primary-blue`, `--border-color`, `--text-primary`, `--text-secondary`), dark/light theme switching, and zero utility framework pollution.
* **Database & Realtime Backend**: Supabase (PostgreSQL, Realtime WebSockets for presence & view counts, RPCs for atomic counter increments, Auth, MFA).
* **AI & Natural Language**: Groq SDK (`@google/generative-ai` / Groq client) powering an in-app interactive portfolio AI chatbot (`ChatBot.jsx`).
* **Node Backend / Serverless API**: Express server (`dev-server.js` / `/api` routes) handling contact submissions, Upstash Redis rate limiting (`@upstash/ratelimit`), Nodemailer email dispatch, and PDFKit resume generation.
* **PWA & Offline Capability**: Service worker registered via `vite-plugin-pwa` with prompt-based update strategy (`registerType: 'prompt'`) to protect uncommitted form inputs.
* **Global Layout**: Fixed 300px Sidebar navigation (left) + 1fr Content area (right). Strict non-scrollable viewport calculation on desktop (`height: calc(100vh - 80px)`).

---

## 2. Global Layout System & Design Rules

### 2.1 Spatial Grid & Desktop Constraints
- **Main Layout Shell (`PortfolioLayout.jsx`)**: The outer wrapper `.layout` uses `position: fixed; width: 100%; top: 0; bottom: 0; left: 0;` (100vh viewport lock).
- **Sidebar Width**: 300px fixed width on desktop (`.sidebar`). Hidden on mobile (`max-width: 900px`).
- **Desktop Zoom Offset**: Desktop viewports (`min-width: 1025px`) apply `html { zoom: 0.75 }` for ultra-crisp density.
- **Content Area Height Rule**: All main page sections (`About`, `Skills`, `Projects`, `Blog`, `Experience`, `Certifications`, `Contact`) are strictly non-scrollable on the document body level. The page root containers enforce `height: calc(100vh - 80px); overflow: hidden;`.
  - *80px Calculation Breakdown*: 20px top + 20px bottom padding from `.scroll-container` + 20px top + 20px bottom padding from `.text-content.wide-content`.
  - Scrollable sub-containers (e.g. blog reader panel, skill radar grid, contact form) use internal `overflow-y: auto` with custom thin scrollbars.

### 2.2 Top Utility Bar & Global Divider Line
- **Utility Bar**: Fixed at `top: 20px; right: 28px; z-index: 2000` containing:
  1. `Ctrl + K` Command Palette hint trigger (`cmdk-hint-pill`).
  2. 3D Globe Locator trigger (`GlobeLocator.jsx`).
  3. Dark/Light Theme Toggle (`DarkModeToggle.jsx`).
  4. Settings & Persona Switcher dropdown (`SettingsDropdown.jsx`).
- **Global Divider Line (`index.css` `main-content::before`)**:
  - Full-width 1px hairline divider positioned at `top: 66px; left: 300px; right: 0;` (spanning the content column directly below the utility bar).
  - Styled with `background: var(--border-color)` to automatically adjust across dark/light modes without hardcoded colors.
  - Automatically hidden on mobile viewports (`@media (max-width: 900px)`).

---

## 3. State Management & Context System

### 3.1 `ThemeContext.jsx`
- Manages `theme` ('dark' | 'light') with system preference auto-detection (`prefers-color-scheme`).
- Sets `data-theme` attribute on `document.documentElement`.
- Controls `reduceMotion` accessibility toggle and font scaling.

### 3.2 `PersonaContext.jsx`
- Features a **Persona Switcher** allowing visitors (Recruiters, Software Engineers, Founders, Hiring Managers) to customize the site presentation.
- Dynamically re-orders page section priorities, highlights relevant skills, and adjusts CTA targets based on the active persona.

### 3.3 `IslandContext.jsx`
- Implements an Apple-style **Dynamic Island** notification engine floating top-center (`DynamicIsland.jsx`).
- Exposes `triggerIsland({ title, subtitle, icon, color, duration })` for real-time feedback (e.g., "Copied to clipboard!", "Message sent!", "Resume downloaded").

### 3.4 `AuthContext.jsx`
- Manages Supabase admin session state, JWT tokens, login flow, MFA status check, and route protection for `/admin/*` dashboards.

---

## 4. Real-time Telemetry & PWA Integration

### 4.1 Supabase Realtime Visitor Presence (`useSupabasePresence.js`)
- Tracks live active visitors across the site using Supabase Realtime WebSockets (`presence` channels).
- Inlined directly into the sidebar location row:
  `Vellore, India · 5:32 pm · 3 online`
- Features a green pulsing live indicator dot next to the count.

### 4.2 Progressive Web App (PWA)
- Managed by `vite-plugin-pwa`.
- **Registration Strategy**: `registerType: 'prompt'` (shows explicit update prompt `PWAInstallPrompt.jsx` rather than auto-refreshing, preventing silent data loss during contact form typing).
- **Cache Strategy**: `NetworkFirst` for HTML/API calls, `CacheFirst` for images and static bundles.
- Icons generated in `public/icons/` (192x192, 512x512, maskable 512x512).

---

## 5. Detailed Page-by-Page Feature Specifications

### 5.1 Home Page (`src/pages/Home.jsx`)
- **Hero Section**: Introduces Sujith with animated glitch text effect (`useGlitchText`), role titles cycling (Data Scientist, ML Engineer, Full-Stack Developer), and persona status pill.
- **Quick Action Bar**: Direct buttons to view Resume, Hire Me, Contact, and Featured Projects.
- **Spotlight Banner**: Highlighting key achievements and quick stats.

### 5.2 About Page (`src/pages/About.jsx`)
- **Layout**: 3-Row non-scrollable grid layout (`height: calc(100vh - 80px)`).
- **Row 1 (Bio & Stats)**:
  - Profile photo with status ring.
  - Headline: "Hi, I'm Sujith — B.Tech student at VIT Vellore (8.7 CGPA) specializing in Data Science."
  - **Live "Days Coding" Badge**: Dynamic counter calculating days since `2021-06-01` (`useDaysCoding`).
  - **Skill Badge Cloud**: Interactive pills for top technologies (Python, TensorFlow, React, FastAPI, SQL) with hover elevation.
  - **Animated Stat Cards (2x2)**: `requestAnimationFrame`-driven count-up cards for:
    - *Years coding*: 3.5+
    - *Projects*: 10+
    - *DSA solved*: 200+
    - *CGPA*: 8.7
  - Contact chips for Email, LinkedIn, GitHub.
- **Row 2 (Career Timeline)**:
  - Milestone nodes: Gudivada (Schooling) → Vijayawada (Intermediate) → VIT Vellore (B.Tech CS) → Data Science (Specialization) → What's next? (Opportunities).
  - Animated CSS `scaleX` connector line draw-on with staggered Framer Motion node pop-ins (`useInView`).
- **Row 3 (CTA & Actions)**:
  - "Let's build something great" card with interest pills (*Data science*, *Machine learning*, *Full-stack*).
  - 2x2 Action Button Grid: *Email*, *Schedule call*, *Resume*, *GitHub*.
  - **Download Toast**: Animated portal toast showing "Preparing resume..." → "Downloaded!".

### 5.3 Skills Page (`src/pages/Skills.jsx`)
- **Layout**: 2-Column Desktop view (Category grid left / Dynamic details & proficiency radar right).
- **Features**:
  - Search filter bar filtering skills by name or keyword.
  - Proficiency level bars with animated fill percentages on reveal.
  - Hover progress rings and detail tooltips (`SkillTooltip.jsx`).
  - Categories covered: Data Science & ML, Frontend & UI Development, Backend & Database Architecture, Core CS & DevOps.

### 5.4 Projects Page (`src/pages/Projects.jsx`)
- **Layout**: 3D-tilt project card grid with tag-based category filtering (All, Machine Learning, Full Stack, Computer Vision).
- **Features**:
  - Live GitHub star tracking integrations.
  - Interactive project detail modal for deep architectural breakdown, tech stack badges, key highlights, and external demo/repo links.

### 5.5 Blog Page (`src/pages/Blog.jsx`)
- **Layout**: 2-Panel desktop view (Searchable article index left / Full markdown preview reader right).
- **Features**:
  - Integrated `react-markdown` viewer.
  - Real-time article view counters calling Supabase RPC `increment_blog_views`.
  - Estimated read time badges, category tags, and publish dates.

### 5.6 Education Page (`src/pages/Education.jsx`)
- Academic timeline showcasing VIT Vellore B.Tech Computer Science (Data Science specialization, 8.7 CGPA).
- Highlighted coursework: Data Structures & Algorithms, Machine Learning, Deep Learning, Database Management Systems, Operating Systems, Computer Networks.

### 5.7 Experience Page (`src/pages/Experience.jsx`)
- Horizontal interactive timeline carousel showcasing internships, project roles, leadership, and technical experience.
- Company avatar badges, duration chips, technology tags, and animated accomplishment bullets.

### 5.8 Certifications Page (`src/pages/Certifications.jsx`)
- Holographic shimmer card design.
- Issuer filter tabs (All, Coursera, DeepLearning.AI, AWS, NPTEL).
- Verification status badges ("Active", "Verified Credential"), issue date trackers, and credential verification links.

### 5.9 Contact Page (`src/pages/Contact.jsx`)
- **Layout**: 2-Column dark navy card layout (`--cn-bg: #0b1622`, `--cn-card: #0f1f30`).
- **Left Panel (Info)**:
  - "Available for opportunities" live pulse badge.
  - **Live IST Clock**: Real-time clock updating every 1s via `Intl.DateTimeFormat` with `Asia/Kolkata` timezone.
  - **Dynamic Response Estimate**: Computes "Usually replies within a few hours" (9am–10pm IST) vs "Usually replies by morning IST".
  - **Copy-to-Clipboard Rows**: One-click copy for Email (`sujithreddy1546@gmail.com`) and Phone (`+91 8501889996`) with checkmark animation and Dynamic Island toast.
  - Social buttons for GitHub, LinkedIn, and single-click **vCard download** (`Thota_Sujith_Reddy.vcf`).
- **Right Panel (Interactive Form)**:
  - **3-Pill Message Type Selector**: `General` | `Job opportunity` | `Collaboration` (active pill turns blue, payload passed to submission API).
  - Real-time inline field validation (name, email format, HTML sanitization).
  - **Live Character Counter**: Textarea with `maxLength={500}`, live count `{n} / 500` turning amber at 380+ and red at 450+.
  - **Live Message Preview Strip**: Real-time preview showing sender name, email, selected type, and truncated message.
  - **Inline Success State**: On submit, form smoothly transitions to an inline checkmark success view ("Message sent! I'll reply within a few hours.") without page navigation or modal popups.
  - **Anti-Spam & Rate Limiting**: Honeypot input (`_catch`), 60-second rate-limiting badge, session token validation (`x-portfolio-session`), and multi-color confetti burst on success.
  - **Mobile Swipe-to-Send**: Touch-enabled draggable knob (`SwipeToSend`) for mobile viewports.

### 5.10 Admin & Security Suite (`AdminLogin.jsx`, `AdminDashboard.jsx`, `AdminMfaSetup.jsx`)
- Protected admin routes (`ProtectedRoute.jsx`) with MFA TOTP setup (QR code generation via `qrcode.react`).
- Management dashboards for reviewing incoming contact messages, updating site settings, inspecting analytics, and auditing system events (`auditLogger.js`).

---

## 6. API Services & Server Logic (`dev-server.js` / `/api`)

- **`/api/contact`**: POST endpoint handling form validation, rate-limiting check via Upstash Redis, saving messages to Supabase DB, and sending notification emails via Nodemailer.
- **`/api/groq`**: POST endpoint forwarding user queries to Groq AI API with system prompt context about Sujith's skills and availability.
- **`/api/resume`**: GET endpoint dynamically compiling a styled PDF resume stream using `pdfkit`.

---

## 7. Instructions for AI & Developers Working on this Project

1. **Preserve Viewport Constraints**: When modifying any main page component, ensure the root container uses `height: calc(100vh - 80px); overflow: hidden;`. Do NOT allow the outer document body to scroll on desktop.
2. **Theme Consistency**: Use CSS variables (`var(--bg-primary)`, `var(--bg-secondary)`, `var(--primary-blue)`, `var(--border-color)`, `var(--text-primary)`, `var(--text-secondary)`) rather than hardcoded hex values to maintain light/dark mode parity.
3. **Dynamic Island Integration**: When adding new user actions (e.g. copying text, downloading files, saving settings), invoke `triggerIsland()` for instant user feedback.
4. **Form Safety**: Never force auto-refreshes or unannounced route changes while form inputs are dirty.
5. **SEO & Accessibility**: All pages include `<SEOHelmet />` metadata, proper heading hierarchies (`<h1>` -> `<h2>`), ARIA labels for icon-only buttons, and keyboard accessibility (`Ctrl+K` palette).

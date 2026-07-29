# AI Context & Rapid Reference Manual

This file serves as a rapid context index for AI coding assistants (Gemini, Claude, GPT, Cursor, Copilot) working on this repository.

> **Full Documentation File**: Refer to [`PROJECT_DOCUMENTATION.md`](file:///c:/Users/Sujith%20Thota/OneDrive/Desktop/reactportfolio-main/PROJECT_DOCUMENTATION.md) for exhaustive page specifications, schema designs, and component mechanics.

---

## 1. Quick Project Cheat Sheet

- **Owner**: Sujith Thota (B.Tech Computer Science student at VIT Vellore, 8.7 CGPA, Data Science & ML Specialist).
- **Stack**: React 18 (Vite, JSX), React Router v7, Framer Motion, Vanilla CSS Design System, Supabase (Realtime WebSockets, Auth, RPCs), Groq AI API, Node/Express (`dev-server.js`), Upstash Redis, vite-plugin-pwa.
- **Primary Entry Point**: `src/App.jsx` -> `src/pages/PortfolioLayout.jsx`.
- **Global Theme & Variables**: Defined in `src/index.css` (`--bg-primary`, `--bg-secondary`, `--primary-blue`, `--border-color`, `--text-primary`, `--text-secondary`).

---

## 2. Critical Layout Rules (DO NOT BREAK)

1. **Non-Scrollable Viewport Rule (Desktop)**:
   - Body & main layout are fixed (`position: fixed; width: 100%; top: 0; bottom: 0`).
   - Every active page component (`About`, `Skills`, `Projects`, `Blog`, `Experience`, `Certifications`, `Contact`) MUST use:
     ```css
     height: calc(100vh - 80px);
     overflow: hidden;
     ```
   - The 80px offset accounts for 20px top + 20px bottom padding from `.scroll-container` plus 20px top + 20px bottom padding from `.text-content.wide-content`.
   - Inner containers needing scrolling must use local `overflow-y: auto`.

2. **Global Utility Bar Hairline Divider**:
   - Fixed below the top utility bar (`Ctrl+K`, Globe, Theme toggle, Settings) in `index.css`:
     ```css
     .main-content::before {
       content: '';
       position: fixed;
       top: 66px;
       left: 300px;
       right: 0;
       height: 1px;
       background: var(--border-color);
       z-index: 1500;
       pointer-events: none;
     }
     ```
   - Hidden on mobile (`@media (max-width: 900px)`).

3. **No Hardcoded Hex Colors**:
   - Always use CSS variables so themes (Dark / Light) switch seamlessly without visual defects.

4. **Dynamic Island Feedback**:
   - Import `useIsland` from `../context/IslandContext` and call `triggerIsland({ title, subtitle, icon, color, duration })` for feedback toast notifications.

---

## 3. Page Structure Summary

| Route | Component | Key Highlights |
|---|---|---|
| `/home` | `Home.jsx` | Hero with role glitch animation, persona switch, spotlight. |
| `/about` | `About.jsx` | 3-row grid: Bio+Stats (count-up cards, days coding badge, skill badge cloud), Timeline (scaleX draw-on connector), CTA (2x2 action grid). |
| `/skills` | `Skills.jsx` | 2-col desktop layout: Category grid + Radar/proficiency details & live search. |
| `/projects` | `Projects.jsx` | 3D-tilt cards, tag filter, GitHub star tracking, architecture modals. |
| `/blog` | `Blog.jsx` | 2-panel reader with `react-markdown`, Supabase RPC view increment, search. |
| `/education` | `Education.jsx` | Timeline of VIT CS B.Tech + Data Science specialization & coursework. |
| `/experience` | `Experience.jsx` | Horizontal interactive carousel, duration chips, staggered bullet reveal. |
| `/certifications` | `Certifications.jsx` | Holographic shimmer cards, issuer filters, active/verified badges. |
| `/contact` | `Contact.jsx` | 2-col dark navy: Live IST clock (`Intl.DateTimeFormat`), dynamic response estimate, email/phone copy, 3-pill message selector, live char counter, inline success state, mobile swipe-to-send. |

---

## 4. Key Contexts & Services

- **`ThemeContext`** (`src/context/ThemeContext.jsx`): Manages dark/light mode toggle & user motion preferences.
- **`PersonaContext`** (`src/context/PersonaContext.jsx`): Re-orders and tailors sections per visitor persona (Recruiter, Engineer, Founder).
- **`IslandContext`** (`src/context/IslandContext.jsx`): Triggers floating notification toasts.
- **`useSupabasePresence`** (`src/hooks/useSupabasePresence.js`): Websocket active viewer tracker in sidebar (`● 3 online`).
- **`dev-server.js`**: Node API server for form submit, rate limits, Nodemailer emails, resume PDF streaming, and AI responses.

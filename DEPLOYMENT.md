# 🚀 Production Deployment & Hosting Guide

This guide covers deploying the **Sujith Thota Portfolio & AI Platform** to production environments like **Vercel**, **Netlify**, or **Cloudflare Pages**, along with Supabase database migrations and custom domain configurations.

---

## 📑 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Vercel Deployment (Recommended)](#2-vercel-deployment-recommended)
3. [Netlify Deployment](#3-netlify-deployment)
4. [Environment Variables Matrix](#4-environment-variables-matrix)
5. [Supabase Database Setup in Production](#5-supabase-database-setup-in-production)
6. [PWA & Offline Service Worker Configuration](#6-pwa--offline-service-worker-configuration)
7. [Post-Deployment Verification Checklist](#7-post-deployment-verification-checklist)

---

## 1. Prerequisites

- A [GitHub](https://github.com/) repository with the latest commits on `main`.
- A [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) account.
- A [Supabase](https://supabase.com/) project with PostgreSQL.
- API keys for **Groq** (`https://console.groq.com/`) and **Upstash Redis** (for rate limiting).

---

## 2. Vercel Deployment (Recommended)

The project includes pre-configured [`vercel.json`](file:///c:/Users/Sujith%20Thota/OneDrive/Desktop/reactportfolio-main/vercel.json) rules supporting single-page app (SPA) routing, serverless API proxies, and cache headers.

### Steps:
1. Go to your **Vercel Dashboard** and click **Add New Project**.
2. Select and import your GitHub repository: `sujith1546/newreact`.
3. Configure Build Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add the [Environment Variables](#4-environment-variables-matrix) in the Vercel Project Settings.
5. Click **Deploy**.

---

## 3. Netlify Deployment

For Netlify, ensure redirects are handled:
1. Connect your repository in **Netlify Dashboard**.
2. Build Settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Add environment variables under **Site Configuration > Environment variables**.
4. Deploy the site.

---

## 4. Environment Variables Matrix

Add these keys in your production hosting platform:

| Variable Name | Required | Target | Description |
|---|---|---|---|
| `VITE_SUPABASE_URL` | **Yes** | Client (`Vite`) | Your Supabase project URL (e.g. `https://xyz.supabase.co`). |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | Client (`Vite`) | Public anonymous client API key. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Server (`api/`) | Privileged service key for admin operations. |
| `GROQ_API_KEY` | **Yes** | Server (`api/`) | Groq SDK key for Llama 3 AI chatbot responses. |
| `VITE_GEMINI_API_KEY` | Optional | Client / Server | Google Gemini API key for multimodal vision/text. |
| `UPSTASH_REDIS_REST_URL` | Optional | Server (`api/`) | Redis URL for distributed IP rate limiting. |
| `UPSTASH_REDIS_REST_TOKEN`| Optional | Server (`api/`) | Redis authorization token. |
| `ADMIN_EMAIL` | Optional | Server / Client | Superadmin login email. |
| `ADMIN_PASSCODE` | Optional | Server | Master admin passcode for dashboard login. |

---

## 5. Supabase Database Setup in Production

Before public release, apply the database enhancements to your Supabase instance:

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project and navigate to **SQL Editor**.
3. Copy and run [`supabase_schema_enhancement_v2.sql`](supabase_schema_enhancement_v2.sql).
4. Verify that:
   - Row Level Security (RLS) is enabled on all tables.
   - The `site_settings` default row (`id = 1`) exists.
   - The `kb_chunks` table and `vector` extension are active.

---

## 6. PWA & Offline Service Worker Configuration

The application uses `vite-plugin-pwa` with automatic Workbox precaching:
- Assets (`.js`, `.css`, `.woff2`, `.png`, `.svg`) are precached on the visitor's device.
- Service workers update automatically on new releases (`sw.js`).
- Manifest file: `dist/manifest.webmanifest`.

---

## 7. Post-Deployment Verification Checklist

After deploying, verify the following:
- [ ] **Home Page**: Loads in < 1s with smooth role glitch animations.
- [ ] **Operations Center**: Click the bell icon in top bar; verify latency badge shows `🟢 xx ms Live`.
- [ ] **Changelog Modal**: Click the Sparkles icon on the sidebar; check that `v1.3.0` and Git commits appear.
- [ ] **Contact Form**: Submit a test message; check that it scores in `contact_messages`.
- [ ] **AI ChatBot**: Open floating assistant, ask a technical question, and test streaming output.
- [ ] **Admin Login**: Navigate to `/admin` and verify login + MFA controls work.

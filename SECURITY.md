# 🛡️ Security Architecture & Threat Mitigation Model

This document outlines the security controls, authentication safeguards, Row-Level Security (RLS) policies, and anti-tamper mechanisms implemented across the **Sujith Thota Portfolio & AI Platform**.

---

## 📑 Table of Contents
1. [Security Principles](#1-security-principles)
2. [Multi-Layer Defense Architecture](#2-multi-layer-defense-architecture)
3. [Authentication & Admin Access Controls](#3-authentication--admin-access-controls)
4. [Row-Level Security (RLS) Enforcement](#4-row-level-security-rls-enforcement)
5. [Anti-Tamper & DevTools Detection](#5-anti-tamper--devtools-detection)
6. [Rate Limiting & DDoS Mitigation](#6-rate-limiting--ddos-mitigation)
7. [Vulnerability Disclosure Policy](#7-vulnerability-disclosure-policy)

---

## 1. Security Principles

- **Zero-Trust Client Boundary**: The frontend is considered untrusted; all critical mutations, database reads, and private communications are guarded by database-level Row-Level Security (RLS).
- **Least Privilege Access**: Public visitors can only view published portfolio records and insert validated telemetry/inquiries.
- **Immutable Security Auditing**: All administrative actions are recorded in an append-only ledger (`admin_audit_logs`).

---

## 2. Multi-Layer Defense Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Edge & Network (Vercel / Cloudflare / Upstash)     │
│   • DDoS Mitigation & Global SSL/TLS Termination            │
│   • IP-Based Sliding Window Rate Limiting (Redis)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Client-Side Defense (React 18 / DevTools Shield)   │
│   • Anti-Tamper DevTools Debugger Traps                     │
│   • XSS Input Sanitization via DOMPurify                    │
│   • SHA-256 Proof-of-Work Form Spam Defense                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Database & Access Control (Supabase PostgreSQL)    │
│   • Strict Row-Level Security (RLS) Policies                │
│   • JWT Auth Tokens with Session Expiration & MFA           │
│   • Append-Only Audit Trail (No UPDATE/DELETE on logs)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Authentication & Admin Access Controls

1. **Admin Session Guard**:
   - Access to `/admin` routes requires an authenticated Supabase auth session token.
   - Unauthorized attempts automatically redirect to `/admin/login`.
2. **Multi-Factor Authentication (MFA)**:
   - Admin panel supports Time-Based One-Time Passwords (TOTP) and custom PIN verification.
3. **Session Lockout on Failed Attempts**:
   - 5 consecutive failed login attempts trigger an automatic temporary lockout and log an event into `login_history`.

---

## 4. Row-Level Security (RLS) Enforcement

Every table in Supabase has RLS enabled with strict policies:

- **Public Data (`projects`, `skills`, `experience`, `education`, `certifications`, `updates`)**:
  - `SELECT`: Allowed for everyone (`published = true`).
  - `INSERT` / `UPDATE` / `DELETE`: Restricted to authenticated admins only.
- **Private Data (`contact_messages`)**:
  - `SELECT`: Restricted to authenticated admin sessions only.
  - `INSERT`: Open to public with validation constraints (`length(email) > 3`, `length(message) > 3`).
- **Audit Logs (`admin_audit_logs`)**:
  - Append-only. No user (including admin) has `UPDATE` or `DELETE` permissions.

---

## 5. Anti-Tamper & DevTools Detection

The application incorporates subtle runtime anti-tamper mechanisms:
- **DevTools Open Detection**: Detects inspection anomalies and logs warnings to the Operations Center.
- **DOM Guard**: Ensures sensitive administration UI elements are never rendered into public DOM trees.

---

## 6. Rate Limiting & DDoS Mitigation

- **Contact Form & ChatBot API**:
  - Rate-limited via Upstash Redis sliding-window algorithm (10 requests/minute per IP).
  - Client-side SHA-256 Proof-of-Work (PoW) computational challenge to prevent automated bot spam.
- **Spam Scoring Trigger**:
  - Incoming messages are scanned for known spam patterns, disposable email domains, and malicious links.

---

## 7. Vulnerability Disclosure Policy

If you discover a security vulnerability within this repository, please disclose it responsibly:
- **Contact**: Send an email directly to the project maintainer at `sujiththota.dev@gmail.com` with reproduction steps.
- **Response Time**: Issues are acknowledged and investigated within 24–48 hours.

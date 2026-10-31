# ReposIT — Wesleyan University Philippines CECT Research Repository (CREST)

## Overview

A full-stack **academic research repository** web application for the **Wesleyan University Philippines – College of Engineering and Computer Technology (CECT)**. Migrated from an Express + Prisma/SQLite backend to a **Supabase Cloud-native architecture** — React 19 + Vite + Tailwind CSS 4 + Supabase (PostgreSQL, Auth, Storage).

The design aesthetic is **Academic Minimalism with Glassmorphism** — a light-mode, blue-centric palette using the Wesleyan BSIT Digital Repository design system.

**Repository:** `MarksIT23/ReposIT-testing` (GitHub)  
**Repository:** `MarksIT23/ReposIT-testing` (GitHub)  
**Active Branch:** `testing` (Supabase Cloud-native architecture active — synchronized with `origin/main`)

---

## Current Status: ✅ Supabase Migration & Branch Sync Complete

| Component | Status |
|---|---|
| Supabase Schema (PostgreSQL) | ✅ Applied & Verified |
| Row Level Security (RLS) | ✅ All tables active |
| Supabase Auth & GoTrue Compatibility | ✅ Live accounts seeded, token columns patched to non-NULL |
| Faculty Student Approval Flow | ✅ Active (email confirmation disabled in Supabase, managed via `profiles.account_status`) |
| Supabase Storage (`capstones` bucket) | ✅ Configured & public manuscript URL operational |
| Data Migration (SQLite → Supabase) | ✅ 12 cats, 9 faculty, 11 papers migrated |
| Frontend Supabase client | ✅ `src/services/supabase.js` |
| `AuthContext.jsx` → Supabase Auth | ✅ Complete with real-time profile sync |
| `data.js` → Supabase PostgREST | ✅ Complete with filtering, pagination, and FTS |
| `ProfilePage.jsx` → `supabase.auth.updateUser()` | ✅ |
| Analytics (`byYear`, `byCategory`, `byProgram`, `topPapers`) | ✅ |
| Main Branch Synchronization | ✅ Merged `origin/main` (About page, hero copy updates, docs) into `testing` |
| Build & Lint (Vite + Oxlint) | ✅ 0 errors |

---

## Design System

| Token | Value |
|---|---|
| **Primary Color** | `#004ac6` |
| **Primary Container (Active)** | `#2563eb` |
| **Secondary** | `#4059aa` |
| **Background** | `#faf8ff` |
| **Surface** | `#faf8ff` |
| **Font** | Inter (all weights) |
| **Roundness** | 8–12px (rounded-lg) |
| **Glassmorphism** | `rgba(255,255,255,0.4)` + `backdrop-blur(12px)` |
| **Icons** | Google Material Symbols Outlined |
| **Mode** | Light only |

---

## Architecture (Current)

```
ReposIT CREST (React 19 + Vite SPA — Client-direct Supabase)
│
├── Supabase Cloud (unaxchblqookqxmlxmyk)
│   ├── PostgreSQL (public schema)
│   │   ├── profiles         ← extends auth.users (role, program, account_status)
│   │   ├── categories       ← 12 research tracks (BSIT/BSCpE/BSECE)
│   │   ├── faculty          ← 9 faculty members
│   │   ├── research_records ← 11 capstone papers (+ FTS GIN index)
│   │   ├── activities       ← audit trail
│   │   └── drafts           ← student draft submissions
│   ├── Supabase Auth        ← JWT sessions, onAuthStateChange (Email confirm disabled for faculty approval)
│   └── Supabase Storage     ← capstones/ bucket (public PDFs)
│
├── Frontend (Vite Dev Server :5173)
│   ├── src/services/supabase.js   ← Supabase JS client
│   ├── src/services/data.js       ← All data functions (PostgREST)
│   ├── src/contexts/AuthContext.jsx ← Supabase Auth + profiles sync
│   └── src/pages/               ← All routes (public + protected)
│
├── Legacy Backend (server/ — SQLite/Express, superseded by Supabase)
└── GitHub → origin/testing branch (synchronized with origin/main)
```

## Routes

| Route | Roles | Component |
|---|---|---|
| `/` | Public | `HomePage.jsx` |
| `/browse` | Public | `BrowsePage.jsx` |
| `/research/:id` | Public | `ResearchDetailPage.jsx` |
| `/faculty` | Public | `FacultyPage.jsx` |
| `/faculty/:id` | Public | `FacultyDetailPage.jsx` |
| `/about` | Public | `AboutPage.jsx` |
| `/auth` | Public | `AuthPage.jsx` |
| `/dashboard` | student | `StudentDashboard.jsx` |
| `/submit` | student | `SubmitResearch.jsx` |
| `/profile` | student, faculty | `ProfilePage.jsx` |
| `/admin` | admin | `AdminDashboard.jsx` |
| `/admin/papers` | admin | `AdminPapers.jsx` |
| `/admin/faculty` | admin | `AdminFaculty.jsx` |
| `/admin/students` | admin | `AdminStudents.jsx` |
| `/admin/categories` | admin | `AdminCategories.jsx` |
| `/admin/analytics` | admin | `AdminAnalytics.jsx` |
| `/portal` | faculty | `FacultyStudents.jsx` |

---

## Supabase Schema Summary

See [`docs/database_cloud_infrastructure.md`](docs/database_cloud_infrastructure.md) for full DDL.

### Tables

| Table | Key Fields | RLS |
|---|---|---|
| `profiles` | `id` (auth FK), `name`, `email`, `role`, `program`, `student_id`, `year`, `section`, `account_status`, `bio` | ✅ |
| `categories` | `id`, `name`, `slug`, `program`, `color`, `description` | ✅ |
| `faculty` | `id`, `name`, `email`, `department`, `specialization`, `bio`, `initials` | ✅ |
| `research_records` | `id`, `title`, `thesis_number`, `program`, `category`, `abstract`, `authors[]`, `keywords[]`, `year`, `advisor`, `source_url`, `pdf_url`, `status`, `views`, `citations`, `fts` (GIN) | ✅ |
| `activities` | `id`, `type`, `detail`, `user_name`, `timestamp` | ✅ |
| `drafts` | `id`, `submitted_by`, `title`, `abstract`, `authors[]`, `keywords[]` | ✅ |

### Functions / Triggers

| Name | Purpose |
|---|---|
| `trigger_set_timestamp()` | Auto-updates `updated_at` on all tables |
| `handle_new_user()` | Syncs `auth.users` INSERT → `public.profiles` |
| `increment_paper_views(paper_id)` | Atomic view count RPC |

### Seed & Test Accounts (password: `password123`)

| Email | Role | Status / Notes |
|---|---|---|
| `admin@wesleyan.edu.ph` | admin | Active |
| `maria.reyes@wesleyan.edu.ph` | faculty | Active |
| `aris.mendoza@wesleyan.edu.ph` | faculty | Active |
| `sofia.delgado@wesleyan.edu.ph` | faculty | Active |
| `alice.bautista@wesleyan.edu.ph` | student | Active |
| `joshua.ramos@wesleyan.edu.ph` | student | Active |
| `miguel.torres@wesleyan.edu.ph` | student | Active |
| `clark.mason@wesleyan.edu.ph` | student | `pending` (Test account for faculty approval flow) |

### Important Auth Configuration & Gotchas

1. **GoTrue Go Scanner Null-Safety:**
   Direct SQL operations in `auth.users` must ensure that all character varying / text token columns (`confirmation_token`, `recovery_token`, `email_change`, `email_change_token_new`, `email_change_token_current`, `phone_change`, `phone_change_token`, `reauthentication_token`) are set to empty strings `''` rather than `NULL`. GoTrue's internal database driver fails with `"Database error querying schema"` when attempting to scan `NULL` values into string variables during login.

2. **Faculty-Managed Student Approval Workflow:**
   In the Supabase project Auth settings, email confirmation is disabled (`Enable email confirmations = OFF`). New student sign-ups automatically enter the repository with `account_status: pending` in `public.profiles`. The faculty or admin reviews and approves student registrations via the Faculty Portal (`/portal`) or Admin Console (`/admin/students`), setting `account_status = 'active'`, which gates login in `AuthContext.jsx`.

---

## How to Run

### Frontend Only (Supabase cloud — no backend required)
```bash
npm install
npm run dev:client
# → http://localhost:5173
```

### Full Stack (includes legacy Express server)
```bash
# Terminal 1: Backend (legacy — no longer primary)
cd server && npm install
node index.js

# Terminal 2: Frontend
npm run dev:client

# Or both at once (requires concurrently)
npm install
npm run dev
```

### Utilities
```bash
# One-time data migration from SQLite → Supabase
node scripts/migrate-to-supabase.js

# Verify Supabase connection & data integrity
node scripts/verify-supabase.js
```

---

## Key Files Changed (Supabase Migration)

| File | Change |
|---|---|
| `.env` | Supabase URL + Anon Key |
| `.env.example` | Template for env vars |
| `.mcp.json` | Supabase MCP server config |
| `src/services/supabase.js` | NEW — Supabase client init |
| `src/services/data.js` | Migrated from Axios → Supabase PostgREST |
| `src/contexts/AuthContext.jsx` | Migrated from JWT/Express → Supabase Auth |
| `src/pages/user/ProfilePage.jsx` | Password change → `supabase.auth.updateUser()` |
| `src/pages/admin/AdminPapers.jsx` | Removed unused `categoryList` state |
| `scripts/migrate-to-supabase.js` | NEW — one-time data migration script |
| `scripts/verify-supabase.js` | NEW — integration verification script |
| `docs/database_cloud_infrastructure.md` | NEW — full DB & infra plan |
| `package.json` | Added `@supabase/supabase-js@2.48.0` |

---

## Homepage Background Video Strategy (Zero-Egress CDN)

Per [`docs/database_cloud_infrastructure.md`](docs/database_cloud_infrastructure.md), background videos are **served from the Vite `/public` directory** (CDN-delivered), **not Supabase Storage**. This eliminates egress fees.

```
public/
└── videos/
    ├── hero-1.mp4   (44.9 MB)
    ├── hero-2.mp4   (16.4 MB)
    ├── hero-3.mp4   (7.2 MB)
    └── hero-4.mp4   (2.2 MB)
```

These are referenced in `HomePage.jsx` as `/videos/hero-N.mp4` and served with `muted`, `playsinline`, and `loop` attributes.

**For production deployment (Vercel/Netlify), add these cache headers:**
```json
// vercel.json
{
  "headers": [
    {
      "source": "/videos/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

---

## Verification Results

```
--- Verifying Supabase Integration ---
✔ Categories: 12 loaded.
✔ Faculty: 9 loaded.
✔ Research Papers: 11 loaded.
✔ Full-Text Search for "blockchain": 1 match(es).
✔ Storage Capstones Bucket: 1 file(s) found: [ 'sample-manuscript.pdf' ]
✔ Auth Sign-in successful for: admin@wesleyan.edu.ph (Role: admin)
--- ALL CHECKS PASSED SUCCESSFULLY ---

Vite production build: ✓ 0 errors, built in 444ms
Oxlint: ✓ 0 errors on 47 files
```

---

## Git Branches

| Branch | State |
|---|---|
| `main` | Production branch with core UI and documentation |
| `testing` | **Active working branch** — Supabase Cloud-native migration, synced with `main` |

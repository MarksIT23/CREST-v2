# ReposIT CREST — Wesleyan University Philippines CECT Research Repository

[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud_PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

**CREST (Capstone Research Electronic Storage and Tracking)** is the official academic research repository and digital archive designed for the **College of Engineering and Computer Technology (CECT), Wesleyan University Philippines**, covering **BS Information Technology (BSIT)**, **BS Computer Engineering (BSCpE)**, and **BS Electronics Engineering (BSECE)**.

The interface follows **Academic Minimalism with Glassmorphism** — an ink-editorial aesthetic with Fraunces display serif, Karla body typography, and smooth micro-animations.

---

## 🚀 Architecture Overview

The `testing` branch is structured as a cloud-native Single-Page Application (SPA) backed directly by **Supabase Cloud**:

- **Database (PostgreSQL):** Stores profiles, research records, categories/tracks, faculty directory, activity logs, and drafts.
- **Search (GIN FTS):** Full-Text Search generated column on research titles, abstracts, and keywords.
- **Authentication (Supabase Auth):** Role-based access control (Student, Faculty, Admin) synced with `public.profiles`.
- **File Storage (Supabase Storage):** Secure `capstones` bucket for academic PDF manuscripts.
- **Zero-Egress Media (Frontend CDN):** High-definition background videos are served directly from `/public/videos/` with immutable caching headers via `vercel.json` and Netlify headers, bypassing cloud database egress costs.

---

## 🌟 Features

### Public Discovery (No login required)
- **Home Page:** Hero showcase, video loop, discipline collection browser, how-it-works, programs, and archive story.
- **Browse Repository (`/browse`):** Full-text search plus filters for program (BSIT, BSCpE, BSECE), category/track, year, adviser filter, and client-side sorting (newest, oldest, most viewed, most cited, title A–Z).
- **Research Detail Page (`/research/:id`):** Manuscript metadata, abstract, view tracking, related papers.
  - **Citation Picker:** One-click APA, MLA, IEEE, and BibTeX formatting with copy-to-clipboard and `.bib` / `.txt` file export.
  - **Manuscript Preview:** Collapsible on-demand PDF preview iframe with loading and error fallbacks, direct download, and open-in-new-tab actions.
- **Faculty Directory (`/faculty`, `/faculty/:id`):** Searchable index with department/program filters plus rich profile pages (masthead hero, advised-paper list, skeleton loaders).
- **About Page (`/about`):** System pipeline, programs, and college chapters.

### Student Portal (`/dashboard`, `/submit`, `/profile`)
- **Student Dashboard:** Time-aware greeting, submission status line, stat cards (Approved / Pending / Drafts / Saved), submissions feed with views and citations, drafts rail, reading-list teaser.
- **Multi-Step Submission Wizard:** Details → authors → manuscript upload.
  - **Thesis Number Required:** Standardized format (e.g. `WU-CECT-IT-2025-001`).
  - **Live Adviser Selection:** Research adviser picked directly from the faculty directory.
- **Saved Papers (Bookmarks):** Account-scoped reading list persisted in `localStorage` (`crest_saved_<userId>`), synced across tabs with automatic dead-entry pruning. Guests are redirected to sign in.
- **Profile Page:** Identity header with monogram and role chips; sliding-pill tabs for **Profile** (details, student ID, bio), **Library** (saved reading list), and **Security** (password update via Supabase Auth).

### Faculty Portal (`/portal`)
- Dashboard, paper review queue, and student account approvals (approve, reject-deactivate, reinstate) utilizing a shared `ConfirmDialog`.

### Admin Console (`/admin`)
- Dashboard, paper moderation (approve, reject, archive with reviewer notes), faculty directory management, student account moderation, research track/category management, and activity feed.

---

## 🛠️ Quick Start

### 1. Prerequisites
- Node.js (v18+ or v20+)
- npm

### 2. Environment Setup
Create a `.env` file in the root directory (matching `.env.example`):
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Install & Run
```bash
# Install root dependencies
npm install

# Start Vite development server
npm run dev:client
```
The app will be accessible at `http://localhost:5173`.

### 4. Verify Supabase Cloud Integration
Run the automated integration verification suite:
```bash
node scripts/verify-supabase.js
```

---

## 👥 Seed Accounts (for Testing & Review)

All test accounts use the password: `password123`

| Role | Email | Permissions / View |
|---|---|---|
| **Admin** | `admin@wesleyan.edu.ph` | Full admin console (`/admin`), paper approval/rejection, user & track management, system analytics |
| **Faculty** | `maria.reyes@wesleyan.edu.ph` | Faculty portal (`/portal`), advisee management, profile customization |
| **Faculty** | `aris.mendoza@wesleyan.edu.ph` | Faculty portal, advisee management |
| **Faculty** | `sofia.delgado@wesleyan.edu.ph` | Faculty portal, advisee management |
| **Student** | `alice.bautista@wesleyan.edu.ph` | Student dashboard (`/dashboard`), submit capstone (`/submit`), draft saving |
| **Student** | `joshua.ramos@wesleyan.edu.ph` | Student dashboard, research submission |
| **Student** | `miguel.torres@wesleyan.edu.ph` | Student dashboard, research submission |

---

## 📂 Project Structure

```
ReposIT-testing/
├── docs/
│   ├── database_cloud_infrastructure.md  # DDL, RLS policies, & storage specification
│   └── plans/                            # Feature specifications & task tracker
├── public/
│   ├── videos/                           # Hero background video assets (Zero-Egress CDN)
│   └── _headers                          # Cloudflare/Netlify caching headers
├── scripts/
│   ├── migrate-to-supabase.js            # SQLite -> Supabase Cloud data migration tool
│   ├── verify-supabase.js                # Integration validation script
│   └── fix_auth_token_columns.sql        # Supabase GoTrue schema compatibility patch
├── src/
│   ├── components/
│   │   ├── admin/                        # Admin dialogs and review components
│   │   ├── layout/                       # Navbar, Footer, AdminLayout, FacultyLayout
│   │   └── ui/                           # CiteDialog, ConfirmDialog, SaveButton, ResearchCard, etc.
│   ├── contexts/
│   │   └── AuthContext.jsx               # Supabase Auth session & profile state
│   ├── hooks/
│   │   ├── useSavedPapers.js             # Account-scoped bookmark store + cross-tab sync
│   │   └── useDragScroll.js              # Touch/mouse drag scrolling hook
│   ├── pages/
│   │   ├── admin/                        # Admin dashboard, papers, faculty, categories, analytics
│   │   ├── faculty/                      # Faculty portal and advisee views
│   │   ├── user/                         # Student dashboard, submission form, profile
│   │   ├── AboutPage.jsx                 # About the repository & college chapters
│   │   ├── AuthPage.jsx                  # Sign in / Register modal & page
│   │   ├── BrowsePage.jsx                # Search, sorting, filtering, and catalog
│   │   ├── FacultyDetailPage.jsx         # Faculty profile & advised research list
│   │   ├── FacultyPage.jsx               # Faculty directory
│   │   ├── HomePage.jsx                  # Hero showcase, video loop, statistics, Bento grid
│   │   └── ResearchDetailPage.jsx        # Manuscript metadata, PDF view, citation picker
│   ├── services/
│   │   ├── data.js                       # PostgREST data layer functions
│   │   └── supabase.js                   # Initialized Supabase client
│   └── utils/
│       └── citations.js                  # Pure APA, MLA, IEEE, and BibTeX formatters
├── thoughts/shared/                      # Architecture plans and UI design specifications
├── netlify.toml                          # Netlify headers & SPA redirects
├── vercel.json                           # Vercel SPA rewrites & static asset caching headers
└── vite.config.js                        # Vite configuration
```

---

## 💡 Key Behaviors & Design Notes

- **Zero-Backend Bookmarks:** The reading list is an account-scoped `localStorage` feature (`useSavedPapers`), isolated per user ID so shared library workstations never leak saved papers between sessions.
- **Pure Function Citations:** `src/utils/citations.js` contains pure formatters for APA, MLA, IEEE, and BibTeX, ensuring standard bibliography conventions and zero UI coupling.
- **Destructive Action Guards:** Destructive actions (student account rejection, status changes) use the shared `ConfirmDialog` modal rather than browser-native `window.confirm`.
- **Zero-Egress Multi-CDN:** Heavy video assets in `/public/videos/` are configured with 1-year immutable caching on Vercel, Netlify, and Cloudflare to eliminate repeated bandwidth usage.

---

## 🌿 Git Workflow

- **`testing` branch:** Active development and Supabase Cloud feature branch. Every change is validated, built, and committed here.
- **`main` branch:** Protected production branch (never modified or pushed to directly during migration testing).

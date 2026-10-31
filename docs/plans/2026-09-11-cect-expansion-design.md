# ReposIT — CECT Department Digital Research Repository Design

> [!NOTE]
> **Status: Implemented & Evolved to Supabase Cloud**  
> The academic taxonomy and CECT program structures designed in this document are fully implemented. The data persistence layer has evolved from the initial SQLite prototype (`dev.db`) to **Supabase Cloud (PostgreSQL, Auth, Storage)**.  
> For the active production schema, RLS policies, and zero-egress video architecture, refer to [`docs/database_cloud_infrastructure.md`](../database_cloud_infrastructure.md).

## Overview
ReposIT is an academic research repository web application for Wesleyan University – Philippines. This design document establishes the expansion from a BSIT-only application to a college-wide repository for the **College of Engineering and Computer Technology (CECT)**, supporting both **BS in Information Technology (BSIT)** and **BS in Computer Engineering (BSCpE)**.

The system transitioned from browser-only `localStorage` through a local prototype (**Node.js/Express, Prisma ORM, SQLite**) to a scalable cloud-native solution powered by **Supabase Cloud**.

---

## 1. Academic Taxonomy & Programs

### Degree Programs Supported
1. **BSIT**: Bachelor of Science in Information Technology
2. **BSCpE**: Bachelor of Science in Computer Engineering

### Research Tracks & Categories
* **BSIT Categories:**
  * Software Engineering
  * Network Administration
  * Data Analytics
  * Cybersecurity
  * Human-Computer Interaction / Web & Mobile Systems
* **BSCpE Categories:**
  * Embedded Systems & IoT
  * Robotics & Automation
  * Computer Hardware Architecture & FPGA
  * Digital Signal Processing & Edge AI
  * Mechatronics & Control Systems

---

## 2. Database Schema (Prisma + SQLite)

Database provider: `sqlite` (`file:./dev.db`).

### Models:
1. **`User` / `Auth`**:
   * `id`: String (cuid/uuid)
   * `name`: String
   * `email`: String (unique)
   * `passwordHash`: String
   * `role`: String (`student` | `faculty` | `admin`)
   * `program`: String? (`BSIT` | `BSCpE`)
   * `studentId`: String?
   * `year`: String?
   * `section`: String?
   * `bio`: String?
   * `createdAt`: DateTime @default(now())

2. **`ResearchPaper`**:
   * `id`: String (cuid/uuid)
   * `title`: String
   * `thesisNumber`: String (e.g. `WU-CECT-IT-2024-001`, `WU-CECT-CPE-2024-002`)
   * `program`: String (`BSIT` | `BSCpE`)
   * `category`: String
   * `abstract`: String
   * `authors`: String (JSON array serialized)
   * `keywords`: String (JSON array serialized)
   * `year`: Int
   * `advisor`: String
   * `sourceUrl`: String?
   * `pdfUrl`: String? (Path to file in `/uploads/papers/`)
   * `status`: String @default("pending") (`pending` | `approved` | `rejected` | `archived`)
   * `views`: Int @default(0)
   * `citations`: Int @default(0)
   * `submittedBy`: String
   * `submittedAt`: DateTime @default(now())

3. **`Faculty`**:
   * `id`: String (cuid/uuid)
   * `name`: String
   * `email`: String
   * `department`: String (`Information Technology` | `Computer Engineering` | `CECT`)
   * `specialization`: String
   * `bio`: String
   * `initials`: String

4. **`Category`**:
   * `id`: String (cuid/uuid)
   * `name`: String
   * `slug`: String
   * `program`: String (`BSIT` | `BSCpE` | `Both`)
   * `color`: String
   * `description`: String

5. **`Activity`**:
   * `id`: String
   * `type`: String
   * `detail`: String
   * `user`: String
   * `timestamp`: DateTime @default(now())

---

## 3. Backend Architecture (`server/`)

* **Express API Server** on port `3002`.
* **Vite Proxy:** Forwards `/api` calls to `http://localhost:3002`.
* **Static Serving:** Serves `server/uploads` at `/uploads`.
* **File Upload Middleware:** `multer` saves uploaded PDF files to `server/uploads/papers/`.
* **Routes:**
  * `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
  * `/api/papers` (GET with query filters: search, program, category, status, year, author; POST; PATCH; DELETE)
  * `/api/papers/:id/status` (PATCH status to approve/reject/archive)
  * `/api/upload/pdf` (POST multipart/form-data for PDF manuscripts)
  * `/api/categories` (GET, POST, DELETE)
  * `/api/faculty` (GET, POST, DELETE)
  * `/api/students` (GET, POST, DELETE)
  * `/api/analytics` (GET aggregated metrics: total, views, citations, status counts, program breakdown)

---

## 4. Frontend User Experience Changes

1. **Branding & Layout:**
   * Update header, titles, metadata, and hero text to reflect CECT (College of Engineering and Computer Technology).
2. **Discovery & Browse (`BrowsePage.jsx`):**
   * Program selector tabs: `All CECT`, `BSIT`, `BSCpE`.
   * Program tags on paper cards.
3. **Submission Flow (`SubmitResearch.jsx`):**
   * Program selection input in Step 1.
   * Program-adaptive category selection.
   * PDF document uploader with progress and validation.
   * Review step previewing PDF file and metadata.
4. **Research Detail (`ResearchDetailPage.jsx`):**
   * Active, functional "Download PDF" button pointing to the stored manuscript.
   * Program badge displayed prominently alongside thesis number.
5. **Auth & Registration (`AuthPage.jsx`):**
   * Program selector for students registering (`BSIT` or `BSCpE`).
6. **Admin Analytics (`AdminAnalytics.jsx`):**
   * Program distribution chart (BSIT vs BSCpE paper volume and views).

---

## 5. Git Branch Rule
* All changes, commits, and tests must be isolated to branch **`testing`**.
* Never commit or push to `main`.

# CECT Expansion & Local SQLite Database Implementation Plan

> [!NOTE]
> **Status: Phase 1 Completed & Superseded by Cloud Migration (Phase 2)**  
> This plan documented the initial CECT expansion and local SQLite (`dev.db`) + Express backend prototype. The backend has since been fully migrated to **Supabase Cloud-native architecture** (`unaxchblqookqxmlxmyk.supabase.co`) with PostgreSQL, Supabase Auth, and Supabase Storage.  
> See the active architecture in [`implementation_plan_repo.md`](../../implementation_plan_repo.md) and [`docs/database_cloud_infrastructure.md`](../database_cloud_infrastructure.md).

**Goal:** Expand ReposIT into a full-stack research repository for the CECT Department (BSIT & BSCpE) backed by academic taxonomy, multi-program filtering, and functional PDF document uploads.

**Historical Architecture:** Node.js/Express backend on port 3002 with Prisma ORM querying a local SQLite file (`dev.db`), `multer` for PDF document upload into `server/uploads/papers/`, and a Vite/React 19 frontend consuming `/api` endpoints via Vite proxy.  
**Current Production Architecture:** Direct client connection to Supabase Cloud (PostgreSQL, Supabase Auth, Supabase Storage). The `server/` directory remains as an offline legacy reference.

**Tech Stack:** React 19, Vite, Tailwind CSS 4, Framer Motion, `@supabase/supabase-js` (Primary); Express, Prisma, SQLite (Legacy/Historical).

---

### Task 1: Initialize Workspace Dependencies and Concurrency

**Files:**
- Modify: `package.json`

**Step 1: Install frontend dependencies**
Run: `npm install`
Expected: Installs root node_modules.

**Step 2: Add concurrently and update dev script**
Run: `npm install -D concurrently`
Modify `package.json` scripts:
```json
"dev": "concurrently \"vite\" \"node server/index.js\""
```

**Step 3: Commit**
```bash
git add package.json package-lock.json ; git commit -m "chore: install frontend dependencies and configure concurrent dev script"
```

---

### Task 2: Initialize Express & Prisma SQLite Backend (`server/`)

**Files:**
- Create: `server/package.json`
- Create: `server/prisma/schema.prisma`

**Step 1: Create server package.json and install backend dependencies**
Dependencies: `express`, `cors`, `multer`, `@prisma/client`, `bcryptjs`, `jsonwebtoken`.
DevDependencies: `prisma`.
Run: `cd server ; npm install`

**Step 2: Define Prisma schema with SQLite provider**
In `server/prisma/schema.prisma`:
- Define models: `User`, `ResearchPaper`, `Faculty`, `Category`, `Activity`.
- Model `ResearchPaper` includes `program` (`BSIT` | `BSCpE`), `category`, `thesisNumber`, `pdfUrl`, `sourceUrl`, `status`.

**Step 3: Push schema to SQLite database**
Run: `cd server ; npx prisma db push`
Expected: SQLite database `server/prisma/dev.db` created and Prisma Client generated.

**Step 4: Commit**
```bash
git add server/ ; git commit -m "feat(server): initialize Express backend with Prisma and SQLite schema"
```

---

### Task 3: Seed CECT Data (BSIT & BSCpE)

**Files:**
- Create: `server/prisma/seed.js`

**Step 1: Write seed script**
- Seed CECT categories for both BSIT (*Software Engineering, Network Admin, Data Analytics, Cybersecurity*) and BSCpE (*Embedded Systems & IoT, Robotics & Automation, Hardware Architecture & FPGA, Mechatronics*).
- Seed sample faculty across IT and CpE departments.
- Seed sample BSIT and BSCpE research papers with thesis numbers (`WU-CECT-IT-2024-001`, `WU-CECT-CPE-2024-002`), keywords, and source code links.
- Seed default accounts (admin, student, faculty).

**Step 2: Run database seed**
Run: `node server/prisma/seed.js`
Expected: Confirms categories, faculty, papers, and users inserted into SQLite.

**Step 3: Commit**
```bash
git add server/prisma/seed.js ; git commit -m "feat(server): add seed script with CECT BSIT and BSCpE records"
```

---

### Task 4: Implement Express API Routes & PDF Upload

**Files:**
- Create: `server/routes/upload.js`
- Create: `server/routes/papers.js`
- Create: `server/routes/categories.js`
- Create: `server/routes/faculty.js`
- Create: `server/routes/students.js`
- Create: `server/routes/auth.js`
- Create: `server/routes/analytics.js`
- Create: `server/index.js`

**Step 1: Implement PDF upload route (`server/routes/upload.js`)**
- Configure `multer` disk storage saving to `server/uploads/papers/`.
- Validate file filter (`application/pdf`) and max limit (25MB).
- Return file path `/uploads/papers/<filename>`.

**Step 2: Implement REST routes**
- `server/routes/papers.js`: GET with filters (`search`, `program`, `category`, `status`, `year`), POST paper, PATCH paper, PATCH status, DELETE paper.
- `server/routes/categories.js`: GET, POST, DELETE.
- `server/routes/faculty.js`: GET, POST, DELETE.
- `server/routes/students.js`: GET, POST, DELETE.
- `server/routes/auth.js`: POST login, POST register.
- `server/routes/analytics.js`: GET stats including breakdown by program (`BSIT` vs `BSCpE`).

**Step 3: Setup `server/index.js`**
- CORS, JSON middleware.
- Serve `server/uploads` statically at `/uploads`.
- Mount all `/api/...` routes.
- Listen on port 3002.

**Step 4: Commit**
```bash
git add server/ ; git commit -m "feat(server): implement Express REST endpoints and PDF upload handler"
```

---

### Task 5: Connect Frontend Service Layer to Backend

**Files:**
- Modify: `src/services/data.js`

**Step 1: Replace localStorage mock with Axios API calls**
- Update all functions in `data.js` (`getPapers`, `getPaperById`, `submitPaper`, `updatePaperStatus`, `getCategories`, `getFaculty`, `getAnalytics`, etc.) to call `/api/...` endpoints.
- Add `uploadPdf(file)` function sending `multipart/form-data` to `/api/upload/pdf`.

**Step 2: Update AuthContext to use `/api/auth`**
- Modify `src/contexts/AuthContext.jsx` to call `/api/auth/login` and `/api/auth/register`.

**Step 3: Commit**
```bash
git add src/services/data.js src/contexts/AuthContext.jsx ; git commit -m "feat(client): connect service layer and auth context to Express API"
```

---

### Task 6: Update Frontend UI for CECT (BSIT + BSCpE)

**Files:**
- Modify: `index.html`
- Modify: `src/components/layout/Navbar.jsx`
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/pages/BrowsePage.jsx`
- Modify: `src/components/ui/ResearchCard.jsx`
- Modify: `src/pages/ResearchDetailPage.jsx`
- Modify: `src/pages/user/SubmitResearch.jsx`
- Modify: `src/pages/AuthPage.jsx`
- Modify: `src/pages/admin/AdminAnalytics.jsx`

**Step 1: Update branding and metadata**
- Update page title, hero text, and descriptions to *"ReposIT — Wesleyan University Philippines CECT Digital Research Repository"* (covering BSIT and BSCpE).

**Step 2: Add Program filter and badges**
- In `BrowsePage.jsx`: Add Program filter tab segment (`All CECT`, `BSIT`, `BSCpE`).
- In `ResearchCard.jsx`: Display program badge (e.g. `BSIT` / `BSCpE`).

**Step 3: Enhance submission wizard (`SubmitResearch.jsx`)**
- Step 1: Add Program radio/dropdown (`BS Information Technology` or `BS Computer Engineering`).
- Filter category options according to chosen program.
- Add file input for attaching `.pdf` manuscript with live name & size feedback.
- Step 3: Show review summary with attached PDF details.

**Step 4: Connect PDF download button (`ResearchDetailPage.jsx`)**
- Connect **Download PDF** button to the real `paper.pdfUrl`, allowing users to open/download the manuscript.

**Step 5: Commit**
```bash
git add src/ index.html ; git commit -m "feat(ui): add CECT multi-program support, PDF upload UI, and branding"
```

---

### Task 7: Full System Verification

**Step 1: Start full-stack application**
Run: `npm run dev`
Verify: Port 5173 (Vite) and Port 3002 (Express) start without errors.

**Step 2: Verify End-to-End User Flow**
1. Open `http://localhost:5173` on browser.
2. Filter repository by `BSCpE` and `BSIT` on `/browse`.
3. Log in as a student and submit a new research paper with an actual PDF attachment.
4. Verify the PDF is saved in `server/uploads/papers/`.
5. Log in as admin, approve the paper in `/admin/papers`.
6. Navigate to the approved paper on `/research/:id` and click **Download PDF** to verify download.

**Step 3: Final Commit on `testing` branch**
```bash
git status ; git commit -am "chore: complete verification of CECT expansion and local SQLite backend"
```

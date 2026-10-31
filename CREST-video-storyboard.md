# CREST — 5-Minute Promotional Video Storyboard

**Project:** CREST (Capstone Research Electronic Storage and Tracking)
**Institution:** College of Engineering and Computer Technology (CECT), Wesleyan University Philippines
**Runtime:** 5:00 (300 seconds)
**Format:** 1920×1080, 16:9, 30 fps, H.264 + AAC
**Tone:** Calm, institutional, confident. Not a startup ad — an archive that outlives its batch.
**Narrative spine:** *The research already exists. CREST is where it survives.*

---

## 1. One-Line Pitch

Every capstone CECT produces is real research — and most of it disappears. CREST is the college's permanent, searchable, citable archive, backed by a review workflow that keeps it trustworthy.

---

## 2. Runtime Map

| # | Scene | Start | Duration | Cumulative |
|---|-------|-------|----------|------------|
| 1 | Cold Open — The Disappearing Archive | 0:00 | 0:20 | 0:20 |
| 2 | The Problem | 0:20 | 0:35 | 0:55 |
| 3 | Introducing CREST | 0:55 | 0:20 | 1:15 |
| 4 | Public Discovery — Browse & Search | 1:15 | 0:45 | 2:00 |
| 5 | Research Detail — Citations & Manuscript | 2:00 | 0:35 | 2:35 |
| 6 | Faculty Directory | 2:35 | 0:20 | 2:55 |
| 7 | Student Portal — Dashboard & Submission | 2:55 | 0:45 | 3:40 |
| 8 | Faculty Review Portal | 3:40 | 0:25 | 4:05 |
| 9 | Admin Console — Governance & Analytics | 4:05 | 0:30 | 4:35 |
| 10 | Why It Matters — Close | 4:35 | 0:25 | 5:00 |

---

## 3. Visual & Audio Language

**Look**
- Ink-editorial palette: warm off-white paper (`#FCFCF7`), near-black ink (`#171717`), thin hairlines.
- Fraunces display serif for headlines, Karla for body, IBM Plex Mono for thesis numbers and citations.
- The site's own motion is the aesthetic: cursor glow, soft floating orbs, glass cards, 200–400 ms fades. **Do not add zoom-punch or whip-pan edits** — let the UI's own restraint carry the tone.

**Screen capture**
- Capture at 1920×1080, 60 fps, then conform to a 30 fps timeline.
- Disable browser bookmarks bar, extensions, and OS notifications.
- Use a clean browser profile with the site in light mode (Archive theme).
- Slow every cursor movement to ~60% speed and hold 1.5 s on any result before cutting.
- Where a click triggers a modal (citation picker, confirm dialog), hold 2 s after it opens.

**Audio**
- Music: sparse piano + soft room tone, 60–70 BPM, no percussion until Scene 7. Lift gently at Scene 9, resolve and fade under the final line.
- Voiceover: warm, unhurried, ~140 words per minute. Record dry, add a short plate reverb only on the closing line.
- Mix: VO at −6 dBFS peak, music −22 dBFS under speech, −14 dBFS in gaps.
- Every scene ships with burned-in or toggleable captions.

---

## 4. Scene-by-Scene Storyboard

---

### SCENE 1 — Cold Open: The Disappearing Archive
**0:00 – 0:20 · 20s**

| | |
|---|---|
| **VISUAL** | Black. A single line of Fraunces type fades in, centered, no logo: *"Every year, this college writes hundreds of capstones."* Beat (1.5 s). It dissolves. Second line: *"Most of them are never read again."* Hold 2 s. Cut to hard white. |
| **CAMERA** | Static. No motion. Typography only. |
| **ON-SCREEN TEXT** | Line 1 → Line 2, then a 0.5 s white flash into Scene 2. |
| **AUDIO** | Silence, then a single low piano note as the second line appears. |
| **VO** | "Every year, this college produces hundreds of capstone projects. Original research, real engineering, real answers to real problems. And every year, most of that work disappears into a filing cabinet, a laptop, or a hard drive nobody will ever open again." |
| **CUT** | Hard cut to black → Scene 2. |

---

### SCENE 2 — The Problem
**0:20 – 0:55 · 35s**

| | |
|---|---|
| **VISUAL** | A slow montage of *implied* loss — no stock-photo clichés. Shoot real, local: a shelf of bound theses gathering dust (slow dolly right), a laptop with a cracked screen (static, shallow focus), a group chat scrolling with the words "pa-send ng PDF" (screen recording, blurred). Intercut with the CREST site's empty search state. |
| **CAMERA** | Slow dolly (shelf), static macro (laptop hinge), screen capture (chat). 3–4 s per shot. |
| **ON-SCREEN TEXT** | Lower-third keywords appear one at a time: `filed away` → `lost` → `rebuilt from scratch` → `unverifiable`. |
| **AUDIO** | Room tone, keyboard clicks, a hard-drive spin-up. Music enters quietly at 0:42. |
| **VO** | "Papers live in group chats. Hard drives fail. Graduating students leave, and the knowledge leaves with them. Faculty who want to reference a past study can't find it. Juniors rebuild solutions that already exist. And when accreditation season comes, the evidence of years of research is scattered across departments, in formats nobody can search. The problem isn't that the research doesn't exist. It's that there's no single place to keep it, find it, and trust it." |
| **CUT** | Cut to white → Scene 3. |

---

### SCENE 3 — Introducing CREST
**0:55 – 1:15 · 20s**

| | |
|---|---|
| **VISUAL** | The CREST homepage hero loads: background video loop, the wordmark resolving over it. Slow scroll starts (10 px/frame equivalent) to reveal the hero headline and the discipline cards below. |
| **URL** | `/` |
| **ON-SCREEN TEXT** | Lower-left: **CREST** / *Capstone Research Electronic Storage and Tracking* / *College of Engineering and Computer Technology · Wesleyan University Philippines* |
| **AUDIO** | Music opens up — piano plus a soft pad. |
| **VO** | "This is CREST — the Capstone Research Electronic Storage and Tracking system for the College of Engineering and Computer Technology at Wesleyan University Philippines. One archive. Three programs. Every approved capstone, in one searchable place." |
| **CUT** | Match-cut: the hero's dark video area → the Browse page's dark header band. |

---

### SCENE 4 — Public Discovery: Browse & Search
**1:15 – 2:00 · 45s**

| | |
|---|---|
| **VISUAL** | (1) `/browse` loads with the full catalog. (2) Type "embedded" into the search field — results collapse instantly. (3) Open the **Program** filter → select **BS Information Technology**. (4) Open **Track/Category** → select a track. (5) Set **Year** → 2024. (6) Open **Adviser** → pick a faculty name. (7) Open the sort menu → hover *Most Cited* → select it. Hold on the reordered grid. |
| **URL** | `/browse` |
| **ON-SCREEN TEXT** | Small labels fade in beside each interaction: `Full-text search` → `Program` → `Research track` → `Year` → `Adviser` → `Sort: most cited`. |
| **AUDIO** | Soft UI ticks on each selection. Music steady. |
| **VO** | "Discovery starts here. Anyone can search the full repository — no account required. Search across titles, abstracts, and keywords. Then narrow it down: by program — Information Technology, Computer Engineering, or Electronics Engineering — by research track, by year, or by adviser. Find a paper from 2019 on embedded systems? Filter to it in seconds. Sort by newest, oldest, most viewed, most cited, or title. The archive is alive: the more the college uses it, the more the most valuable work rises to the top." |
| **CUT** | Click a result card → Scene 5 (cut on the card's scale-down). |

---

### SCENE 5 — Research Detail: Citations & Manuscript
**2:00 – 2:35 · 35s**

| | |
|---|---|
| **VISUAL** | (1) `/research/:id` loads — headline, authors, adviser, program, track, thesis number, abstract. (2) Scroll to the metadata block and hold. (3) Click **Cite** → the citation dialog opens. (4) Click each style pill in turn: **APA**, **MLA**, **IEEE**, **BibTeX** — the formatted block changes. (5) Click **Copy** → the checkmark confirmation. (6) Click **Export .bib**. (7) Close the dialog, expand **Manuscript Preview** — the PDF iframe loads — then click **Download**. |
| **URL** | `/research/:id` |
| **ON-SCREEN TEXT** | `Thesis no. WU-CECT-IT-2025-001` (mono) → `APA · MLA · IEEE · BibTeX` → `Copied` → `Manuscript preview`. |
| **AUDIO** | A crisp copy confirmation tone. Music dips under dialogue. |
| **VO** | "Every paper has a permanent home. Open a manuscript to see the full metadata — authors, adviser, program, track, thesis number, abstract, and how many times it's been viewed. Need to reference it? CREST generates the citation for you, in APA, MLA, IEEE, or BibTeX. Copy it with one click, or export a .bib file straight into your reference manager. Preview the PDF in the browser, or download it. No more broken links. No more 'can you send me the file?'" |
| **CUT** | Cut on the PDF preview closing → Scene 6. |

---

### SCENE 6 — Faculty Directory
**2:35 – 2:55 · 20s**

| | |
|---|---|
| **VISUAL** | (1) `/faculty` — the directory grid. (2) Type a surname into search — grid filters. (3) Apply a **Program** filter. (4) Click a faculty card → `/faculty/:id` opens with the masthead hero. (5) Scroll to the advised-papers list and hold. |
| **URL** | `/faculty` → `/faculty/:id` |
| **ON-SCREEN TEXT** | `Faculty directory` → `Filter by department / program` → `Advised research`. |
| **AUDIO** | Music softens; no UI ticks. |
| **VO** | "Behind every paper is a person. The faculty directory profiles every adviser in the college — their department, their program, and the research they've guided. Find a mentor. See their body of work. Understand who to talk to before you start yours." |
| **CUT** | Cut to `/auth` — sign-in field typing → Scene 7. |

---

### SCENE 7 — Student Portal: Dashboard & Submission
**2:55 – 3:40 · 45s**

| | |
|---|---|
| **VISUAL** | (1) Sign in as a student on `/auth` (show the email typing, mask the password). (2) `/dashboard` loads — time-aware greeting, status line, stat cards: **Approved / Pending / Drafts / Saved**. Hold on the stat row. (3) Scroll to the submissions feed — show views and citations on a row. (4) Click **Submit research** → `/submit`. (5) Step 1 **Paper Details**: type a title, enter thesis number `WU-CECT-IT-2025-001`, select program, select track, pick adviser from the live faculty dropdown. (6) Step 2 **Authors**: add a second author. (7) Step 3 **Review & Submit**: upload a PDF → show the filename and size; click **Save draft** first, then **Submit**. |
| **URL** | `/auth` → `/dashboard` → `/submit` |
| **ON-SCREEN TEXT** | `Approved · Pending · Drafts · Saved` → `1 Paper Details → 2 Authors → 3 Review & Submit` → `PDF · max 25 MB` → `Draft saved` → `Submitted for review`. |
| **AUDIO** | Light percussion enters here — a gentle pulse. Upload progress is silent; confirmation is a single soft chime. |
| **VO** | "For students, CREST is the shortest path from finished capstone to permanent record. Sign in and your dashboard tells you exactly where you stand — approved, pending, drafts, and saved papers, alongside views and citations for your own work. Submitting takes three steps. Paper details: title, thesis number, abstract, program, track, adviser — pulled live from the faculty directory. Authors: add every member of the team. Review and submit: upload your final PDF, up to twenty-five megabytes, and send it for review. You can save a draft at any point and come back later. Nothing is lost." |
| **CUT** | Cut on the success state → Scene 8. |

---

### SCENE 8 — Faculty Review Portal
**3:40 – 4:05 · 25s**

| | |
|---|---|
| **VISUAL** | (1) Sign in as faculty. (2) `/portal` dashboard. (3) Go to the **review queue** — a list of pending submissions. (4) Open one paper. (5) Click **Approve** (or **Reject**) → the review dialog appears with a notes field. (6) Type a short note, confirm. (7) Switch to **Students** — show the approve / deactivate / reinstate actions and the shared **ConfirmDialog** appearing. |
| **URL** | `/portal` → `/portal/papers` → `/portal/students` |
| **ON-SCREEN TEXT** | `Review queue` → `Reviewer notes` → `Approve · Reject · Archive` → `Confirm` modal. |
| **AUDIO** | Music tightens slightly. Confirm dialog gets a low, deliberate click. |
| **VO** | "Faculty review in the portal. Every submission assigned to them arrives in one queue — no email threads, no shared folders. Open a paper, read the manuscript, and decide. Approve it, or reject it with written notes so the student knows exactly what to fix. Student accounts are handled the same way: approve, deactivate, or reinstate, with a confirmation step so nothing happens by accident." |
| **CUT** | Cut on the confirm dialog closing → Scene 9. |

---

### SCENE 9 — Admin Console: Governance & Analytics
**4:05 – 4:35 · 30s**

| | |
|---|---|
| **VISUAL** | (1) Sign in as admin. (2) `/admin` dashboard. (3) **Papers** — moderate: approve / reject / archive with reviewer notes. (4) **Faculty** — add or edit a directory entry. (5) **Students** — moderate accounts. (6) **Categories** — show the research track/color management. (7) **Analytics** — hold on the charts: research growth, program activity, most viewed/cited. |
| **URL** | `/admin` → `/admin/papers` → `/admin/faculty` → `/admin/students` → `/admin/categories` → `/admin/analytics` |
| **ON-SCREEN TEXT** | Left-rail labels appear in sequence: `Papers` · `Faculty` · `Students` · `Categories` · `Analytics`. |
| **AUDIO** | Music at its fullest — still restrained. UI ticks only on navigation. |
| **VO** | "Administrators see the whole system. Moderate every paper — approve, reject, or archive, always with a reviewer note. Manage the faculty directory. Moderate student accounts. Maintain the research tracks and categories that keep the archive organized. And read the analytics: how research is growing, which programs are most active, which papers are being found and cited. Governance isn't an afterthought here — it's built into every screen." |
| **CUT** | Slow dissolve from the analytics charts → black → Scene 10. |

---

### SCENE 10 — Why It Matters: Close
**4:35 – 5:00 · 25s**

| | |
|---|---|
| **VISUAL** | Black. Three lines of Fraunces type, one at a time: *"Preserved."* → *"Discoverable."* → *"Citable."* Then the CREST wordmark centers, with a slow fade-up of the key numbers if available (papers archived, programs, advisers). Hold on the wordmark for 3 s. |
| **ON-SCREEN TEXT** | `CREST` / *Capstone Research Electronic Storage and Tracking* / *College of Engineering and Computer Technology · Wesleyan University Philippines* |
| **AUDIO** | Music resolves on a single sustained piano note and fades. Final line delivered dry. |
| **VO** | "Five years from now, the capstone submitted this semester should still be findable, citable, and readable. That's what CREST is for. It preserves the college's intellectual output, makes it discoverable to the next batch of students, and gives faculty and the institution the evidence of scholarship they need. Not a folder. Not a hard drive. An archive. CREST — the Capstone Research Electronic Storage and Tracking system." |
| **CUT** | Fade to black over 1 s. End card. |

---

## 5. Full Voiceover Script (continuous read)

> Every year, this college produces hundreds of capstone projects. Original research, real engineering, real answers to real problems. And every year, most of that work disappears into a filing cabinet, a laptop, or a hard drive nobody will ever open again.
>
> Papers live in group chats. Hard drives fail. Graduating students leave, and the knowledge leaves with them. Faculty who want to reference a past study can't find it. Juniors rebuild solutions that already exist. And when accreditation season comes, the evidence of years of research is scattered across departments, in formats nobody can search. The problem isn't that the research doesn't exist. It's that there's no single place to keep it, find it, and trust it.
>
> This is CREST — the Capstone Research Electronic Storage and Tracking system for the College of Engineering and Computer Technology at Wesleyan University Philippines. One archive. Three programs. Every approved capstone, in one searchable place.
>
> Discovery starts here. Anyone can search the full repository — no account required. Search across titles, abstracts, and keywords. Then narrow it down: by program — Information Technology, Computer Engineering, or Electronics Engineering — by research track, by year, or by adviser. Find a paper from 2019 on embedded systems? Filter to it in seconds. Sort by newest, oldest, most viewed, most cited, or title. The archive is alive: the more the college uses it, the more the most valuable work rises to the top.
>
> Every paper has a permanent home. Open a manuscript to see the full metadata — authors, adviser, program, track, thesis number, abstract, and how many times it's been viewed. Need to reference it? CREST generates the citation for you, in APA, MLA, IEEE, or BibTeX. Copy it with one click, or export a .bib file straight into your reference manager. Preview the PDF in the browser, or download it. No more broken links. No more "can you send me the file?"
>
> Behind every paper is a person. The faculty directory profiles every adviser in the college — their department, their program, and the research they've guided. Find a mentor. See their body of work. Understand who to talk to before you start yours.
>
> For students, CREST is the shortest path from finished capstone to permanent record. Sign in and your dashboard tells you exactly where you stand — approved, pending, drafts, and saved papers, alongside views and citations for your own work. Submitting takes three steps. Paper details: title, thesis number, abstract, program, track, adviser — pulled live from the faculty directory. Authors: add every member of the team. Review and submit: upload your final PDF, up to twenty-five megabytes, and send it for review. You can save a draft at any point and come back later. Nothing is lost.
>
> Faculty review in the portal. Every submission assigned to them arrives in one queue — no email threads, no shared folders. Open a paper, read the manuscript, and decide. Approve it, or reject it with written notes so the student knows exactly what to fix. Student accounts are handled the same way: approve, deactivate, or reinstate, with a confirmation step so nothing happens by accident.
>
> Administrators see the whole system. Moderate every paper — approve, reject, or archive, always with a reviewer note. Manage the faculty directory. Moderate student accounts. Maintain the research tracks and categories that keep the archive organized. And read the analytics: how research is growing, which programs are most active, which papers are being found and cited. Governance isn't an afterthought here — it's built into every screen.
>
> Five years from now, the capstone submitted this semester should still be findable, citable, and readable. That's what CREST is for. It preserves the college's intellectual output, makes it discoverable to the next batch of students, and gives faculty and the institution the evidence of scholarship they need. Not a folder. Not a hard drive. An archive. CREST — the Capstone Research Electronic Storage and Tracking system.

**Word count:** ~680 · **Target read time at 140 wpm:** ~4:51, leaving ~9 s of pauses for a 5:00 cut.

---

## 6. Capture Checklist (Pre-Production)

**Environment**
- [ ] `npm run dev:client` running; open in a clean browser profile at 1920×1080.
- [ ] Bookmarks bar hidden, extensions disabled, OS notifications off.
- [ ] Theme set to **Archive** (the default), `localStorage['crest_theme'] = 'archive'`.
- [ ] Seed data present so every screen has realistic results (not empty states).

**Accounts**

| Role | Email | Password | Screens |
|---|---|---|---|
| Public | — | — | `/`, `/browse`, `/research/:id`, `/faculty`, `/faculty/:id`, `/about` |
| Student | `alice.bautista@wesleyan.edu.ph` | `password123` | `/dashboard`, `/submit`, `/profile` |
| Faculty | `maria.reyes@wesleyan.edu.ph` | `password123` | `/portal`, `/portal/papers`, `/portal/students` |
| Admin | `admin@wesleyan.edu.ph` | `password123` | `/admin`, `/admin/papers`, `/admin/faculty`, `/admin/students`, `/admin/categories`, `/admin/analytics` |

**Beats to capture (do not skip)**
- [ ] Browse: search term typed live; each of the four filters applied; sort changed.
- [ ] Research detail: citation dialog with all four styles; copy confirmation; `.bib` export; PDF preview expanded.
- [ ] Submit: all three steps; live adviser dropdown; PDF upload with filename + size; draft save; submit success.
- [ ] Faculty: reject with written notes visible in the dialog.
- [ ] Admin: one approve, one archive, one reviewer note; analytics charts.
- [ ] Every destructive action shows the `ConfirmDialog` — capture it at least twice.

**Assets**
- [ ] `/public/videos/hero-*.mp4` — reuse the site's own hero loop for Scene 3 (no extra footage needed).
- [ ] B-roll (Scene 2): thesis shelf, laptop, group chat screen recording.
- [ ] Logo/wordmark export at 2× for the end card.

---

## 7. Post-Production Notes

- **Pacing:** cut on action, not on beats. Let each result land before moving on — the credibility of the video comes from the UI actually responding.
- **Legibility:** if any UI text is under 16 px on screen, punch in to 110–125% rather than adding a callout. Keep the browser chrome out of frame where possible.
- **Do not speed up** the submission wizard — the three-step rhythm is the point.
- **Cursor:** never let the cursor sit idle mid-screen. Park it bottom-right between interactions.
- **Transitions:** hard cuts and dissolves only. No zooms, no spins, no glitch effects.
- **Colour:** do not add a LUT. The paper/ink palette is the identity.
- **End card:** wordmark + full system name + college. No URL unless the deployment is public.

---

## 8. Accessibility & Deliverables

- Burned-in captions for the full VO (English), plus a `.srt` sidecar.
- Contrast: keep all on-screen text at ≥ 4.5:1 against its background — the ink-on-paper palette already satisfies this.
- No flashing content; Scene 1's white flash is a single 0.5 s cut, within WCAG limits.
- Deliver 1920×1080 H.264 master, a 1080p web version (≤ 80 MB), and a vertical 9:16 cutdown (60 s) for social if required.

---
date: 2026-09-23
topic: "Discovery Batch — Saved Papers, Citations, Browse Filters, PDF Preview"
status: validated
---

## Problem Statement

The core loop (submit → review → browse → read) works, but nothing brings readers back. There are no bookmarks (zero infrastructure exists), citations are a single freeform format, Browse has no adviser or sort controls, and PDFs are download-only with `'#'` marking "no file." Detail pages are dead ends.

This batch ships four frontend-only upgrades that make the archive feel like a real research home: save papers, cite properly, slice the collection, and read in place.

## Constraints

- **Frontend-only** — no Prisma migrations, no new API routes; all four ride on data the client already holds
- **Stack locked** — React + framer-motion + Tailwind + existing tokens; no PDF libraries (native iframe), no new deps at all
- **Routes preserved** — `/browse`, `/research/:id`, profile/dashboard layouts unchanged in structure
- **Authors shape** — list/detail endpoints return parsed arrays, but faculty-sourced rows may carry JSON strings; formatters normalize defensively (see `authorsToArray` precedent in ResearchCard)
- **Motion safety** — `viewportOnce` reveals, popLayout for list changes, plain fades under reduced motion

## Approach

Chosen per feature:

- **Saved papers → localStorage first.** Key `crest_saved` holding paper ids. Guests included, zero backend, shippable fast. A backend saves table is the documented upgrade path for cross-device later.
- **Citations → format-picker dialog.** Replace the single-format `handleCite` with a `CiteDialog` (APA 7th / MLA 9th / IEEE tabs + BibTeX download), styled like ConfirmDialog. Pure `formatCitation(paper, style)` module, memoized per paper.
- **Browse → client-side adviser + sort.** Browse fetches full results and paginates in memory, and the list endpoint has no adviser/sort params — so filter and sort in memory with zero backend changes. Adviser options come from existing `getFaculty()`.
- **PDF preview → native iframe.** Zero bundle cost vs pdfjs/react-pdf, no worker setup, fine mobile fallback (open/download buttons). Rendered only for real URLs (`pdfUrl && pdfUrl !== '#'`).

Rejected:

- **Backend saves table now** — correct long-term, but migration + endpoints + authz for a v1 when localStorage proves the UX first
- **pdfjs / react-pdf** — custom rendering power we don't need; heavy bundle + worker config for no visible gain
- **Backend sort/adviser params** — unnecessary while Browse pages client-side; revisit if the collection outgrows in-memory paging

## Architecture

- `useSavedPapers` hook owns the id list (toggle, lookup, prune dead ids); `SaveButton` mounts on ResearchCard (lean + full) and the detail sidebar
- Saved section in the profile area resolves ids against the existing list endpoint and intersects
- `CiteDialog` + `formatCitation` module replace `handleCite` on ResearchDetailPage
- Browse toolbar gains adviser select + sort dropdown reusing `selectClass`/`toolbarLabelClass`, stamps, and clear-all
- `PdfPreview` section on the detail main column, conditional on a real file URL

## Components

- **useSavedPapers** — localStorage-backed `[ids, toggle, has, prune]`; corrupt JSON resets to empty; private-mode write failure degrades silent
- **SaveButton** — bookmark affordance with spring-pop fill; stops propagation so card links still navigate
- **CiteDialog** — APA/MLA/IEEE tabs, copy button with copied-feedback, `.bib` blob download; 1/2/3+-author rules per style; missing advisor/thesis degrade gracefully
- **Browse controls** — adviser select (faculty names) + sort (Newest, Oldest, Most viewed, Most cited, Title A–Z); page resets to 1 on change; stamps extended
- **PdfPreview** — framed iframe with header actions (open, download); skeleton until `onLoad`; error swaps to download + notice

## Data Flow

- Save: click → hook writes localStorage → all mounted buttons re-render from shared hook state
- Saved list: read ids → fetch via list endpoint → intersect → grid; misses pruned
- Cite: dialog open → memoize formats → copy (clipboard, prompt fallback) or `.bib` download
- Browse: fetch per filter set (unchanged) → adviser substring + sort in memory → slice page
- Preview: detail load → URL check → iframe mounts

## Error Handling

- Bookmarks: corrupt storage resets; dead ids pruned silently; write failures never break UI
- Citations: clipboard denial → prompt fallback; missing authors → "Anonymous"
- Browse: empty faculty list disables adviser select with hint; sort applies before slicing so pages stay consistent
- Preview: load error → download fallback + note; `'#'` never mounts an iframe

## Testing Strategy

- `npm run lint` + `npm run build` green, no new warnings
- Manual: save persists across reload, unsave works; each citation tab copies correct text, `.bib` downloads; adviser+sort combine with existing filters, stamps clear them; detail with PDF shows preview, without keeps empty state
- Responsive: dialog fits mobile, frame collapses, toolbar wraps
- Motion: no shift on toggle/sort, no unstyled flash

## Open Questions

- Backend saves table timing — after localStorage v1 proves usage? (Default: yes, migrate on demand)
- Saved section home: ProfilePage tab vs StudentDashboard block? (Default: profile area, visible to all roles)
- Citation default tab: APA first? (Default: APA, matches current behavior)

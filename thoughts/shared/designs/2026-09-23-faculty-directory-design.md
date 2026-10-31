---
date: 2026-09-23
topic: "Faculty Directory Revamp"
status: validated
---

## Problem Statement

The Faculty Directory at `/faculty` reads like an admin table — a uniform 3-column grid of small initials cards with no hierarchy, no personality, and no sense of who the advisers are. It undersells the people behind the research.

We want a showcase: a memorable entrance, a featured face, and editorial roster rows with orchestrated motion — while keeping search, department filter, and `/faculty/:id` detail routing intact.

## Constraints

- **No backend changes** — payload from `GET /faculty` and `GET /faculty/:id` stays as-is (id, name, initials, department, specialization, bio, email, papers/paperCount)
- **No photos yet** — monogram initials carry the design; layout must accept images later with no reflow
- **Stack locked** — React + framer-motion + Tailwind + existing `font-display` / ink-ivory-neutral tokens; no new animation libraries
- **Routes preserved** — `/faculty` and `/faculty/:id` keep working; search + dept filter remain functional
- **Motion safety** — `whileInView` with `viewportOnce`; reduced-motion falls back to plain fades

## Approach

Chosen: **Editorial Adviser Index** — treat advisers like authors on a journal masthead, not database rows.

Why this over the alternatives:

- Reuses the proven AboutPage masthead language (ink block, rail rise + rule draw) — cohesive, zero new dependencies
- Needs no photos — oversized monograms + index numbers carry visual weight
- Scales with small/uneven faculty counts — featured section hides under 3 advisers, roster carries the page

Rejected:

- **Department wings** (one immersive section per program) — triples page weight, breaks with uneven dept sizes
- **Physics card gallery** (tilt-on-hover 3D) — fights the restrained editorial tone, needs portraits to land

## Architecture

Two-route structure, elevated on both ends:

- `FacultyPage` owns discovery: masthead + featured lead + filterable roster
- `FacultyDetailPage` owns depth: profile hero + specialization + advised papers grid
- Client-side enrichment only: derive departments, counts, featured pick, and initials fallback from the existing payload

The directory becomes a two-act showcase with a continuous hero echo into the detail page.

## Components

- **FacultyMasthead** — ink hero-echo block (eyebrow, display title, live stats: adviser count, departments, papers advised); fade + rail rise + rule draw entrance; subtle count-up on stats
- **FeaturedAdviser** — most-published adviser as large editorial spread (oversized monogram, bio excerpt, paper-count chip, profile CTA); hidden when fewer than 3 advisers
- **FilterBar** — ivory control strip (SearchBar + dept pills); active pill uses `layoutId` slide; sticky under masthead on scroll
- **AdviserRoster** — editorial rows on desktop (index number, monogram, name, dept tag, specialization, paper count, arrow); whole row links to detail; hover shifts row + slides arrow
- **AdviserCard (mobile)** — compact card variant under `md` breakpoint
- **ProfileHero (detail)** — masthead-echo header upgrade (larger monogram, chips, bio, contact strip) + staggered papers grid entrance

## Data Flow

- `getFaculty()` loads once → derive departments, totals, featured pick, initials fallback
- Search + dept filter apply in memory → `AnimatePresence` + `layout` animates add/remove
- Row select → navigate `/faculty/:id` → `getFacultyById(id)` loads profile + papers
- Missing fields degrade: generated initials, fallback specialization copy, zero-paper empty state

## Error Handling

- Loading: skeleton rows in roster shape (no lone spinner, no layout jump)
- Empty filter result: editorial empty state with clear-filter action
- Missing faculty: restyled not-found block matching masthead
- Short lists: featured hides, roster carries the page
- Motion: `viewportOnce` everywhere; reduced-motion → plain fades

## Testing Strategy

- `npm run lint` + `npm run build` green, no new warnings
- Manual QA: search narrows, dept pills animate, row click reaches correct detail, back preserves filter
- Responsive: rows → cards under `md`, masthead stacks cleanly
- Motion: no shift on filter change, no flash of unstyled content

## Open Questions

- Featured pick rule: most papers vs. hand-picked flag from admin? (Default: most papers; revisit if admins want curation)
- Photo field shape when portraits arrive (URL vs. upload)? Layout is ready either way

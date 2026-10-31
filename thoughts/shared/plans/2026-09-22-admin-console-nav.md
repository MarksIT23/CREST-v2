---
date: 2026-09-22
topic: "Admin Console Navigation Implementation Plan"
design: "thoughts/shared/designs/2026-09-22-admin-console-nav-design.md"
status: completed
completed_date: 2026-09-22
---

## Goal

Replace the sidebar + mobile drawer in the admin and faculty shells with a stacked header + tab strip, per the locked design. Presentation-only; no routing, guard, data, or page changes.

## Scope

- **In scope:** `src/components/layout/AdminLayout.jsx`, `src/components/layout/FacultyLayout.jsx`.
- **Out of scope:** All pages, `Navbar`, auth logic, routes in `App.jsx`, theming tokens.

## Build Order

Execute top-to-bottom. Admin first, then mirror to faculty.

### 1. AdminLayout — header

- Replace the whole sidebar column and drawer with a single sticky top header using the existing ivory blur + hairline border treatment.
- Header left: brand block (logo tile, ReposIT wordmark, Admin Console / Faculty Portal eyebrow) linking home — reuse the current brand markup.
- Header right: profile chip (avatar initials, name, role) linking to `/profile`, plus the existing sign-out action restyled as a quiet inline button.
- Delete the `mobileOpen` state, the hamburger button, the desktop aside, and the mobile overlay entirely.

### 2. AdminLayout — tab strip

- Render `NAV_SHARED` as a horizontal `NavLink` row directly beneath the header, sticky, on the same ivory background with a bottom hairline.
- Active tab: black pill with white text and icon; inactive: neutral text, hover wash. Keep icons + labels.
- Render `NAV_ADMIN_ONLY` in the same row after an inline divider with the existing Administration eyebrow label; keep the `user?.role === 'admin'` gate exactly as-is.
- Row scrolls horizontally on narrow screens using the existing `hide-scrollbar` utility; tabs never wrap.

### 3. AdminLayout — content

- Keep the `Outlet` wrapper and its existing padding.
- Move the page title out of the shell header into the content area as a ruled editorial header (thick ink top rule, display title) driven by the unchanged `PAGE_TITLES` map with its existing fallback.

### 4. FacultyLayout — mirror

- Repeat steps 1–3 with `NAV_ITEMS` (4 tabs, no admin group) and the portal title map. Same treatments, no new decisions.

## Verification

- [x] Desktop `/admin`: header one row, 6 tabs, correct black-pill active state per route, Administration group visible.
- [x] Faculty role: Administration group absent, eyebrow reads Faculty Portal.
- [x] Mobile 360px: tab strip scrolls, no page-level horizontal scroll, no hamburger, no overlay.
- [x] Click-through: every tab, profile chip, sign-out, brand home-link.
- [x] Portal shell: same checks with 4 tabs.
- [x] Gates: lint shows 0 errors; build succeeds (exit 0).

## Risks

- Six tabs plus the admin divider on small tablets could feel tight — the scroll row absorbs it; no wrapping allowed.
- Sticky stacking (header + strip) must not cover anchored content — content keeps its current top padding rhythm.

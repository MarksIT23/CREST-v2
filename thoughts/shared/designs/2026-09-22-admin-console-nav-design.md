---
date: 2026-09-22
topic: "Admin Console Navigation - Top Tab Bar Replacing Sidebar"
status: validated
---

## Problem Statement

The Admin Console (and identical Faculty Portal shell) anchors navigation in a 280px sidebar plus a mobile drawer. We want every section accessible without any sidebar — a lighter console that matches the editorial system.

## Constraints

- **No sidebar, no drawer:** Neither desktop aside nor mobile overlay may remain; the `mobileOpen` pattern is deleted, not adapted.
- **Same information architecture:** All 6 admin tabs (3 shared + 3 admin-only) and 4 portal tabs survive with identical paths, labels, icons, and role gating.
- **No behavior changes:** Routing, `ProtectedRoute` guards, auth flows, and page components are untouched — presentation-only change to the two layout shells.
- **Editorial fit:** Active/inactive treatments reuse existing tokens (black pill, neutral washes); no new palette.

## Approach

Chosen approach is a stacked shell: sticky compact header, sticky horizontal tab strip, full-width content.

- **Why this wins:** Reuses proven in-codebase patterns (BrowsePage pill filters, AdminPapers underline tabs), kills all overlay state, and keeps the nav definitions verbatim so the diff is purely presentational.
- **Rejected section-switcher dropdown:** Hides 6 destinations behind a click and destroys at-a-glance orientation.
- **Rejected hub-cards with no persistent nav:** Every section change becomes two clicks plus back-navigation; you lose your place.

## Architecture

Shell changes from side-anchored (`flex` row: 280px aside + main) to stacked (header → tab strip → content).

- **Nav data untouched:** `NAV_SHARED`, `NAV_ADMIN_ONLY`, `NAV_ITEMS`, and `PAGE_TITLES` move over unchanged.
- **Header:** Brand block (logo tile + ReposIT / Admin Console eyebrow, links home) left; profile chip + quiet sign-out right. Sticky with the existing ivory blur treatment.
- **Tab strip:** Sticky beneath header, horizontal `NavLink` row with icons + labels. Administration group keeps an inline divider + eyebrow label. Mobile scrolls horizontally via existing `hide-scrollbar` utility.
- **Content:** `Outlet` full-width; page title renders as a ruled editorial header (`border-t-2 border-neutral-900`) inside the content area instead of the shell header.

## Components

Key pieces and responsibilities:

- **Console Header:** Brand home-link, role eyebrow, profile chip to `/profile`, sign-out action. Single row on all breakpoints.
- **Tab Strip:** Active tab is a black pill (`bg-neutral-900 text-white rounded-full`); inactive tabs are neutral text with hover wash. Role gate still hides the Administration group for non-admins.
- **Content Wrapper:** Existing `p-6 md:p-10` padding kept; title + ruled header per section.

## Data Flow

No data changes. `useAuth` (`user`, `logout`) feeds the header as it fed the sidebar. Role checks render the same conditional group. `useLocation` still drives the title map.

## Error Handling

Strategy for failures:

- **Unknown path:** Title falls back to `Admin` / `Faculty Portal`; no tab shows active — identical to current behavior.
- **Narrow screens:** Strip scrolls; tabs never wrap, page never scrolls sideways.
- **Reduced motion:** No new animation introduced.

## Testing Strategy

How we'll verify correctness:

- **Desktop:** All tabs visible, correct active pill per route, admin-only group hidden for faculty.
- **Mobile 360px:** Strip scrolls, header stays one row, no page-level horizontal scroll.
- **Regression:** Sign-out, profile link, every tab route, and the mirrored portal shell with 4 tabs.

## Open Questions

- Faculty Portal mirrors the change by default (same pattern, 4 tabs) — keep sidebar there instead if preferred.

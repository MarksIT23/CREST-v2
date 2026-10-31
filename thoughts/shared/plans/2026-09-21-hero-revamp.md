---
date: 2026-09-21
topic: "Hero Revamp Implementation Plan"
design: "thoughts/shared/designs/2026-09-21-hero-revamp-design.md"
status: completed
completed_date: 2026-09-23
---

## Goal

Implement fullscreen media hero with floating transparent header per locked design.

## Scope

- **In scope:** HomePage hero restructure, Navbar transparent mode, App shell layering, hero-only media switch, removal of stat cards.
- **Out of scope:** Other pages, API changes, global theming changes, new assets beyond existing hero media.

## File Changes

- **HomePage:** Extract fullscreen hero as first sibling outside max-width wrapper, add media switch handling, centered content, scroll cue, remove stats and featured blocks.
- **Navbar:** Shift from sticky solid to fixed transparent with scroll threshold flip, white text on hero and dark text on solid, solid fallback for drawer and dropdown.
- **App Shell:** Keep global orbs below hero layer, ensure navbar renders over hero without layout gap.
- **Styles:** Add hero-owned neutral palette and scrim utilities independent of existing theme tokens, add viewport height and scroll cue motion with reduced-motion guard.
- **Media:** Default to local hero image, allow GIF as image mode, allow video with poster fallback and muted loop inline behavior.

## Implementation & Optimization (Completed)

- **Bandwidth & Video Guard:** Multi-CDN caching configured in `vercel.json` and `netlify.toml` with `Cache-Control: public, max-age=31536000, immutable`. Video preloading set to lazy to prevent excessive egress.
- **IntersectionObserver:** Background video auto-pauses when scrolled out of view.
- **Hero Copy & Trust Bar:** Merged from main (`435f305`), presenting institutional trust indicators and clear CTAs.

## Verification

- [x] Viewport fill on desktop, tablet, and mobile with no gaps.
- [x] Scroll transition flips header cleanly and hero fully exits.
- [x] Media swap across image, GIF, and video without layout shift.
- [x] Blocked media and throttled load remain readable.
- [x] Existing browse, auth, and admin guards unaffected.

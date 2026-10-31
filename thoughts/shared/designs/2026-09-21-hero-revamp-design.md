---
date: 2026-09-21
topic: "Hero Revamp - Fullscreen Media Hero with Floating Transparent Header"
status: validated
---

## Problem Statement

The current home hero is a constrained two-column block inside a max-width container with side stat cards.

We need a cinematic full-screen entry that fills the viewport until scroll, with a floating transparent header and centered headline reading The CECT Capstone Repository.

## Constraints

- **Fullscreen takeover:** Hero must occupy the full viewport height and fully exit on scroll with no gaps.
- **Floating header:** Transparent at top with no border or shadow, clean and floating.
- **Centered message:** Headline centered both axes with supporting actions.
- **Media choice:** Image today, GIF or video tomorrow via a hero-only switch.
- **Theme independence:** Hero disregards existing blue theme tokens and owns a neutral cinematic palette.
- **Removal locked:** Stat cards and featured-image cards are removed from the home flow in this pass.

## Approach

Chosen approach is a full-bleed breakout with an abstracted hero media layer and scroll-aware transparent navigation.

- **Why this wins:** One layout supports all three media modes without restructuring when the choice changes.
- **Rejected hard-coded image:** Would require layout surgery to support video later.
- **Rejected global media system:** Overkill since scope is hero-only for now.

## Architecture

High-level structure treats the hero as edge-to-edge viewport layers outside the constrained content wrapper.

- **Media layer:** Back-most layer rendering image, GIF-as-image, or muted looping video with poster.
- **Scrim layer:** Darkening gradient ensuring contrast independent of media brightness.
- **Content layer:** Centered eyebrow, headline, subcopy, actions, and scroll cue.
- **Header layer:** Fixed transparent overlay that transitions to solid after hero threshold.
- **Body sections:** Resume on solid background below hero to prove scroll-away effect.

## Components

Key pieces and responsibilities:

- **Floating Header:** Transparent with white text at top, solid light surface with dark text after scroll, forces solid when drawer or dropdown is open.
- **Hero Media Switch:** Single selection defining image, GIF, or video mode, local hero asset as default with remote override allowed.
- **Hero Content Block:** Centered headline, subcopy, dual calls to action linking to browse and faculty areas.
- **Scroll Cue:** Bottom-centered indicator signaling more content below, disabled under reduced motion.
- **Fallback Surface:** Neutral dark gradient shown instantly while media loads or on failure.

## Data Flow

How data moves through the system:

- **Zero data dependency:** Hero paints without API calls for instant first paint.
- **Local resolution:** Media choice resolves locally before paint to avoid flicker.
- **Below-fold data:** Existing paper and category fetches continue unchanged for sections below the hero.

## Error Handling

Strategy for failures:

- **Missing media:** Video falls back to poster, poster falls back to neutral gradient, text never strands on light background.
- **Autoplay blocked:** Poster frame persists without breaking layout or hiding actions.
- **Slow load:** Dark base renders immediately to preserve contrast.
- **Reduced motion:** Video paused with poster shown, cue animation disabled.
- **Header overlap:** Dropdown and mobile drawer force solid treatment for readability.

## Testing Strategy

How correctness will be verified:

- **Viewport fill:** Desktop, tablet, and mobile confirm exact viewport fill with no gaps or horizontal scroll.
- **Scroll transition:** Hero fully exits on scroll, header flips from transparent to solid cleanly.
- **Media swap:** Each mode fills and centers correctly without layout shift.
- **Resilience:** Blocked media and throttled load still leave readable centered content.
- **Keyboard pass:** Actions remain focusable and visible over dark scrim.

## Open Questions

No blocking questions. Design is locked for build.

- Preferred final campus photo or video source can be swapped later without redesign.
- Whether transparent header should extend to all pages remains future scope, solid elsewhere for now.

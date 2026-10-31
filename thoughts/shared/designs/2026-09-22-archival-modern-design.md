---
date: 2026-09-22
topic: "Repository Reskin - Archival Modern"
status: validated
---

## Problem Statement

The repository is clean but generic — ivory surfaces, pill filters, and geometric sans could belong to any SaaS product. We need a look that is unmistakably a university thesis archive: unique, memorable, and still clean.

## Constraints

- **Presentation only:** No routing, guard, data, or API changes. Component structure stays; tokens and motifs change.
- **Keep the foundation:** Ivory paper, ink text, hero, and editorial headers survive — the reskin builds on them, not against them.
- **One accent:** A single stamp-red joins ink on ivory. No new gradients, no extra hues in chrome (content colors like program greens stay).
- **No new dependencies:** Webfonts via link tags only; all else is CSS and existing utilities.

## Approach

Chosen approach is Archival Modern — the card catalog, rebuilt.

- **Why this wins:** It grows out of assets we already own (thesis catalog numbers, taxonomy, approval workflow) instead of importing a foreign style. The archive aesthetic is ours alone.
- **Rejected Swiss typographic brutalism:** Striking but generic-techy; any startup can wear it.
- **Rejected dark reading room:** Fights the locked ivory system and hero; massive churn for mood alone.

## Architecture

Token-led reskin, executed in layers:

1. **Tokens + type:** Display serif, mono voice, stamp-red accent, stamp/rule utilities in the design system.
2. **Cards + badges:** ResearchCard as index card; status pills become rubber stamps; catalog numbers promoted to oversized mono.
3. **Pages:** Headers, filters as index tabs, tables as ledgers, detail page as catalog record.
4. **Shells:** Tab strips and headers pick up serif titles and mono eyebrows; no structural change.

## Components

Key pieces and responsibilities:

- **Type system:** Fraunces (display serif), Karla (body, retained), Plex Mono (catalog data: numbers, eyebrows, timestamps, table figures). Serif/monospace system fallbacks if webfonts fail.
- **Rubber stamps:** Slightly rotated bordered status marks (APPROVED / PENDING / REJECTED / ARCHIVED) in stamp-red or ink; replace status pills only.
- **Catalog numbers:** Oversized mono thesis numbers as primary identifiers on cards and detail pages.
- **Index tabs:** Filter groups as catalog-drawer tabs with dividers, replacing floating pills.
- **Ruled index lines:** Hairline rules + generous whitespace for entries; ledger-style mono figures in tables.
- **Date-slip footers:** Card footers set like due-date slips (views, citations, year in mono).
- **Accent discipline:** Stamp-red reserved for stamps, one primary action per view, and active tab markers.

## Data Flow

No data changes. Thesis numbers, statuses, categories, and counts already exist and are only promoted visually.

## Error Handling

Strategy for failures:

- **Font failure:** Fallback stacks preserve hierarchy; layout never depends on webfont metrics.
- **Stamp clipping:** 1–2deg rotation max; verifiable at 360px.
- **Empty states:** Archival voice with identical ruled treatment, never blank.

## Testing Strategy

How we'll verify correctness:

- **Hierarchy glance test:** Title, catalog number, stamp legible in that order at arm's length.
- **Breakpoints:** 360/768/1280 — stamps unclipped, tabs scroll, rules align.
- **Reduced motion:** Static reveals, unrotated stamps, still complete.
- **Regression:** All routes render, filters still filter, lint + build gates pass.

## Open Questions

- Exact stamp-red hex (proposing an oxblood/vermilion around `#9a1b1e`, adjustable in tokens).
- Whether program badges (BSIT/BSCpE) also go mono or keep their current chips — defaulting to mono for consistency.

---
tags: [prompt-log]
date: 2026-10-23
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-10-23 08 - Caviezel instead of Milly Torte in services

## Prompt

> Great! Can you instead of milly torte use caviezel-cover in services tab?

## Goal

In the services page's business group, show Caviezel's wall (the project cover `projects/caviezel-cover`) as a before/after card instead of Milly Torte.

## Result

- **The pair:** `Assets/Projects/Caviezel/` now has `caviezel-cover after.jpg` (pixel for pixel the published `projects/caviezel-cover`, 1200 × 900) and `caviezel-cover before.jpg` (the same picture without the print, 2390 × 1792, added 2026-10-23 at 12:17). Outside the print they match (mean difference 2.4 at the ceiling, 0.8 at the bottom; best offset 0 px), so the split lines up.
- **No duplicate photo:** the card's "after" is the existing key `projects/caviezel-cover`; `vp run images` makes only `services/caviezel-before` (1200 × 900). Milly Torte's pair files are removed; her project stays on the Projects page.
- **The whole wall shows:** the pair is landscape (4:3), the others are portrait (4:5). A 4:5 cut would have cut the six photos in half, so a card now has its photo's shape (`BeforeAfter` sets `aspect-ratio` from the image) and, from `md`, the row's columns are in the ratio of the photos (`md:grid-cols-(--columns)`, `minmax(0, <ratio>fr)`): every card in a row is as tall. Measured: 1280 px 305 / 509 / 305 × 382; 820 px 180 / 300 / 180 × 225; 1600 px 358 / 596 / 358 × 447; phones stack (288 × 360, Caviezel 288 × 216). `sizes` follows each card's share of the row.
- **Tag:** "Storia aziendale" / "Firmengeschichte" / "Company history" / "Historija firme" (Barber House stays "Identity", Monteceneri "History"). Alt texts in four languages, from the client's story (old vehicles, equipment, the people). "Vedi il progetto" opens `/progetti#caviezel`.
- **Checks:** `vp check` clean, `vp test` 247 passed, `vp run build` passed, e2e (services, a11y, budgets, smoke, projects) 107 passed, 17 skipped by design; `e2e/services.spec.ts` now moves the split on the Caviezel card and opens its project. No horizontal scroll at 360, 820, 1280, and 1600 px.

## Changed files

- `scripts/images.ts` (Milly Torte pair out, `services/caviezel-before` in), `public/photos/services/caviezel-before.jpg` (new), `public/photos/services/milly-torte-*.jpg` (removed), `src/content/images/photos.ts`
- `src/content/services.ts`, `src/islands/BeforeAfter.tsx`, `src/features/services/Audiences.tsx`, `e2e/services.spec.ts`
- `CLAUDE.md`, `swiss-wallprinting/Development Plan.md` (4.4), `swiss-wallprinting/Specs/Services for whom - Plan.md` (Key Decision, KTD3, KTD6, U1)

## Decisions

- **Show the whole 4:3 wall, with columns in the ratio of the photos**, instead of cutting it to 4:5 (it would cut the outer photos in half) or making every card 4:3 (it would cut the portrait prints).
- **Reuse the cover key** for the "after": one file, already cached by visitors of the Projects page.

## Open items

- The Caviezel "before" is, like the others, an edited picture (the print removed); the client should confirm that it shows the real wall (Development Plan Q7).
- Q13: may Caviezel be named (already on the Projects page)?
- Committed on `main` on the author's request (author and committer Ibro02); not pushed.

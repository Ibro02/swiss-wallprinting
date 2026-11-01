---
tags: [prompt-log, hero, performance]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done (committed on main, pushed)
---
# 2026-11-01 15 - Sharper hero frames built

## Prompt

> Yes, build it

## Goal

The author's answer to [[2026-11-01 14 - Sharper hero frames]]: desktop frames at 1600 px, phone frames at 1280 px.

## Result

- **`scripts/frames.ts`:** `VARIANTS` desktop `width: 1600` (q55), mobile `width: 1280` (q50); the comments give the reason and the sizes.
- **`vp run frames`** (2.5 min):
  - Desktop: 100 frames, 1600 × 900, 6.1 MB AVIF (before 4.5 MB), poster 30 KB (before 22).
  - Mobile: 100 frames, 1280 × 720, 3.8 MB (before 2.6), poster 19 KB (before 13).
  - `src/content/images/frames.ts` regenerated. The WebP poster fallbacks are larger too (desktop 0000.webp 45 KB, mobile 27 KB).
- **Checked in the browser (production build, Chromium):** the canvas is 1600 × 900 on a desktop and 1280 × 720 on a Pixel 7; after a scroll all 100 frames load from the right folder.
- **Lighthouse mobile, home `/it`:**
  - The first three runs after the change gave 0.73–0.78 (before 0.78–0.82). They ran right after 200 new files and a build, while OneDrive was syncing.
  - A fair comparison, run alternately, five each: the old frames from a scratchpad copy with today's code (port 3002), the new frames (port 3001):

| | Performance | LCP | TBT | Hero bytes before a scroll |
|---|---|---|---|---|
| Old frames | 0.79–0.83 (median 0.81) | median 3.67 s | median 324 ms | 0.36 MB |
| New frames | 0.78–0.81 (median 0.79) | median 3.74 s | median 343 ms | 0.55 MB |

  The cost: about 0.02 of the score, and LCP about +0.07 s from the 6.6 KB larger poster. Every run stays above the CI floor of 0.75.
- **A Chrome trace** (Pixel 7, 4× CPU slowdown) shows that the frames decode on worker threads (14 decodes of 7–34 ms). Only one decode is on the main thread (22 ms, the canvas's first frame). The largest main-thread item is the page's first layout (356 ms), which the frames do not change.
- **Checks:** `vp check` clean; `vp test` 282 passed; `vp run build` passed; full `vp run e2e` 143 passed, 29 skipped, 0 failed.
- `CLAUDE.md`: the frame sizes in "Scroll hero" and in the `vp run frames` row.

## Changed files

- `scripts/frames.ts`, `src/content/images/frames.ts` (generated), `public/frames/hero/**` (generated)
- `CLAUDE.md`, this entry, [[2026-11-01 14 - Sharper hero frames]], `Prompt Log.md`

## Decisions

- Kept as built: the Lighthouse cost is small, and the hero is clearly sharper (see the crops in entry 14).
- Possible later: a smaller poster file (frame 0, the blank wall, has little detail) would take back most of the LCP cost. It needs its own file next to the frames; not done.

## Open items

- The author looks at the hero in Firefox and on a real phone, and checks the scrolling. Memory: up to about 370 MB on a phone if the browser keeps all 100 frames decoded (before about 210 MB).
- Committed on `main` with entry 14 ("Yes, commit"), not pushed.

---
tags: [prompt-log]
date: 2026-11-02
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-02 06 - Hero without lag, full height

## Prompt

> hero video is lagging on the desktop, and it's not in it's full height

## Goal

On a desktop the hero's print plays smoothly and shows the whole height of the video.

## Result

- **Lag, measured** (production build, Playwright, 1536 × 730, one wheel tick, every painted frame for 3 s): the 2 s play showed only 53 of the 78 frames, and in 33 of 104 painted frames it waited for a frame that was not decoded yet, then jumped. Decoding 1600 px AVIF reached about 23 frames a second; the play asks for 39. The phone showed 65.
- **Lag, fixed** (`PrintOnScroll.tsx`, `print-scroll.ts`):
  - While the print plays by itself, it goes no further than the frames decoded in a row (`readyThrough`, with 3 tests): it waits for the next frame instead of jumping; a frame not ready within `MAX_WAIT_MS` (150 ms) is skipped, so a failed download never stops it.
  - Desktops keep 128 MB of decoded frames (23 frames); phones keep 64 MB (18 frames), as before.
  - Measured again (two runs): laptop 70 of 78 frames, never waiting, 1.9 s; phone 70.
- **Full height:** the author chose "the card fits the video" (of three options: that, the full-width card with blurred sides, a taller card under the pill). The stage is at most as wide as the video at its height (`max-width` on `.print-scroll__stage` in `globals.css`), centred. At 1536 × 730 the card is 970 px wide and shows the whole video (before: 68 % of its height); at 1920 × 1080 the whole height (1.5 % of each side cut); phones unchanged.
- Checks: `vp check`, `vp test` (314), build, full e2e 138 passed (36 skipped).

## Changed files

- `src/islands/PrintOnScroll.tsx`
- `src/features/home/print-scroll.ts`, `src/features/home/__tests__/print-scroll.test.ts`
- `src/app/globals.css` (`.print-scroll__stage`)
- `CLAUDE.md` (the scroll hero notes)

## Decisions

- Pace the play by the decoded frames rather than slow it down for everyone: a fast computer still prints in about 2 s, a slow one a little slower, never with jumps.
- The phone's memory budget stays 64 MB (phones were smooth with it, and have less memory).

## Open items

- Another session changed the hero at the same time ([[2026-11-02 05 - Hero short scroll again]]: `140vh`, `e2e/home.spec.ts`). Both are in the files and fit together (that one: the section's length; this one: the decoding, the play's pace, the stage's width). Tested together afterwards: `vp test` 314, build, e2e `home` and `budgets` 24 passed.
- To look at in Firefox and on the author's desktop. Lighthouse not run (the phone run does not use the desktop budget).
- Not committed.

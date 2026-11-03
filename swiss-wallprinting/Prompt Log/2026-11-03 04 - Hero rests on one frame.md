---
tags: [prompt-log]
date: 2026-11-03
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-03 04 - Hero rests on one frame

## Prompt

> now when i stop scrolling, i see 2 maschines, it's not good
>
> you must now that one mouse move does not equal one frame move.

## Goal

On desktops the hero never shows two printers when the scroll stops.

## Result

- **Cause:** the blend of entry 03 draws the two frames around the progress. A scroll (a wheel notch, a touchpad) stops anywhere, mostly between two frames, so the picture came to rest on a mix of both: two printers.
- **Fix:** on desktops the picture goes to the nearest whole frame of the scroll position (`restingProgress` in `print-scroll.ts`, with a test; `restOn` in `PrintOnScroll`, used wherever the target is set). It blends only while it moves, and at rest it shows one frame. Phones do not blend, and their target is unchanged.
- **Measured** (Chromium and Firefox, 1536 × 730, nine scrolls of uneven size: 37, 53, 100, 61, −29, 100, 83, −117, 45 px): after each one the canvas rests on one frame. The motion is as smooth as before (steps of about one frame, no long frames).
- Checks: `vp check`, `vp test` 321, build, e2e `home` and `budgets`: 18 passed, 6 failed (the reviews band tests; the band is hidden since `74894a2`).

## Changed files

- `src/features/home/print-scroll.ts`, `src/features/home/__tests__/print-scroll.test.ts` (`restingProgress`)
- `src/islands/PrintOnScroll.tsx` (`restOn`)
- `CLAUDE.md`

## Decisions

- Snap the target, not the drawing: the picture still eases smoothly and lands on a frame, instead of jumping from a blend to a frame at the end.

## Open items

- Look at it in Firefox on the author's desktop. The reviews band e2e tests fail while the band is hidden. Not committed.

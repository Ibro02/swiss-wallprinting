---
tags: [prompt-log]
date: 2026-11-03
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-03 05 - Phone hero like the desktop

## Prompt

> can you apply same smoothness and scroll mechanism on the mobile? now it looks much smoother
>
> make the printer more controllable on the mobile as it's on the desktop, but just to know that I don't want an entirety of time for users to scroll to the next section. Make it fast but not TOO FAST

## Goal

On phones the printer follows the finger both ways, as smoothly as on the desktop, with a short way to the next section.

## Result

- **The same mechanism on phones** (`PrintOnScroll.tsx`): no auto play (`playSeconds` 0 for both), blended frames, rest on the nearest whole frame, the picture never ahead of the decoded frames (both ways), and as many frames decoded behind as ahead (`BEHIND_WEIGHT` 1).
- **Phone settings** (`Hero.tsx`): `mobileLength="170vh"`, about 0.7 of a screen of scroll (611 px at 412 × 839; was 140vh, 0.4 of a screen); `mobileMaxSpeed={1}` (the whole print in 1 s at the least; desktops 0.8, 1.3 s), because a fling glides on and the printer must keep up; `smoothing` 0.2 as on desktops; 4 parallel decodes (was 3).
- **No stall at the first swipe:** phones load the decode window's 18 frames in order, then every 8th (`coarseCount(count, step, leading)`, with a test), after the first paint: 27 frames (about a third of the bytes) before the first scroll, the rest on the first scroll.
- **Removed props:** `mobilePlaySeconds` and `mobileSmoothing` (both settings are the same now). New: `mobileMaxSpeed`.
- **Measured** (Chromium as a phone, 412 × 839, touch events from the DevTools protocol; this headless browser does not glide after the finger lifts, a real phone glides on): a 300 px swipe prints half the wall in 0.55 s, at about 1.3 frames per screen frame with no stalls, and rests on one frame; two swipes print nearly all of it (frame 72 of 77); a quick 600 px swipe prints it in 1 s; back and forth follows the finger. Desktops unchanged.
- `e2e/home.spec.ts`: one test for both: the print follows the scroll, forwards and back.
- Checks: `vp check`, `vp test` 322, build, e2e `home`, `budgets`, `a11y`, `smoke`: 100 passed, 6 failed (the reviews band tests; the band is hidden since `74894a2`).

## Changed files

- `src/islands/PrintOnScroll.tsx`, `src/features/home/Hero.tsx`
- `src/features/home/print-scroll.ts`, `src/features/home/__tests__/print-scroll.test.ts` (`coarseCount` `leading`)
- `e2e/home.spec.ts`
- `CLAUDE.md`

## Decisions

- 170vh: long enough to hold the printer half way with one swipe, short enough that two swipes reach the next section (a fling usually prints all of it).
- The phone's speed cap is higher than the desktop's (1 against 0.8): after a fling the page stops quickly, and a slower picture would still be printing when the hero scrolls away.
- The coarse loading stays on phones (data, Lighthouse mobile), with the first 18 frames added: about 550 KB more after the first paint.

## Open items

- Try it on a real phone (the glide after a swipe is not in the headless test). If one swipe prints too much or too little: `mobileLength` in `Hero.tsx`.
- The reviews band e2e tests fail while the band is hidden.
- Not committed.

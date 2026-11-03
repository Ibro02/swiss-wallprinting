---
tags: [prompt-log]
date: 2026-11-03
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-03 02 - Desktop hero full height

## Prompt

> better, but feel free to add full height of the video
>
> video can take full hero space (as much as it can fit and still play without laging and without any issues)

## Goal

On desktops the hero video takes as much of the screen as fits, and still plays without lag. Phones unchanged (entry 01: "don't touch mobile").

## Result

- **No header room on desktops:** the card fills the screen inside the page frame (24 px), and the header pill floats over the video. New prop `mobileHeaderRoom`; `Hero.tsx` passes `headerRoom={0}` and `mobileHeaderRoom={0.2}`. CSS: `--room-now` in `.print-scroll` is `--room`, and under 48rem `--room-mobile`.
- **A landscape desktop card always covers:** at 1920 × 1080 the card is capped at the page width (1424 px) and is taller than the video, and the phone rule (`--min-share`: at least 85 % of the width) left a dark band under the video. Now `@media (width >= 48rem)` + `@container (orientation: landscape)` covers. Upright tablets and phones keep the rule.
- **Measured:** at 1536 × 730 the card is 1424 × 682 and shows 85 % of the video's height (68 % with the header room); at 1920 × 1080 it is 1424 × 1032 and shows the whole height (the sides cut a little; the pan keeps the printer in view). Phone (412 × 839): the stage is where it was (top 175 px).
- **Lag:** unchanged. One wheel tick: the first new frame after 27–50 ms, no jumps; 4 ticks forwards and 4 back: every frame in order, no long frames. With the network throttled to 20 Mbit/s, a scroll 2.5 s after load on the dev server came before any frame arrived (0.7–1 s wait), and 5 s after load it was smooth. The dev server's scripts are much larger than production's, so this test is harsh.
- Checks: `vp check`, `vp test` 316, build, e2e `home`, `budgets`, `a11y`, `smoke`: 100 passed, 6 failed (the reviews band tests; the band is hidden since `74894a2`).

## Changed files

- `src/islands/PrintOnScroll.tsx` (`mobileHeaderRoom`)
- `src/features/home/Hero.tsx`
- `src/app/globals.css` (`.print-scroll` `--room-now`, `.print-scroll__frame` landscape cover)
- `CLAUDE.md`

## Decisions

- The page frame (the 24 px margin and rounded card) stays: it is the site's card design; without it the card would gain only 48 px.
- On a window wider than the video a little of the top and bottom is still cut: showing all of it at full width needs a card taller than the screen, which a sticky stage cannot be.

## Open items

- The pill covers the top of the video on desktops (by design: it floats over the first card). Look at it on the author's screen and in Firefox.
- The reviews band e2e tests fail while the band is hidden.
- Not committed.

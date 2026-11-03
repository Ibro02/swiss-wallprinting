---
tags: [prompt-log]
date: 2026-11-03
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-03 01 - Desktop hero scrub, full width, no initial lag

## Prompt

> Listen, hero page video is great on the mobile dimensions, but on the desktop it is soo laggy initialy
>
> then, I don't like why video does not go full width. Also, It user used to scroll initially and scroll back printing image to the wall (playing around with printer). I want that back as well
>
> But the most important part is that it's not lagging like now
>
> note: don't touch mobile, it's great

## Goal

On a desktop: no lag at the first scroll, the video across the full width, and the scroll drives the printer forwards and backwards. Phones stay as they are.

## Result

- **Initial lag, the cause** (Playwright, 1536 × 730, one wheel tick): before the first scroll only the coarse set (every 8th frame) had downloaded. The first scroll found frames 1 … 7 missing: the picture stood on frame 0 for 180–220 ms (localhost; longer on a real network), then jumped 0 → 2 → 4 → 8.
- **Initial lag, fixed** (`PrintOnScroll.tsx`, desktop frame set only): after the poster's first paint a desktop downloads all frames (3.7 MB), the decode window (the first 23 frames) first and in order (`loadOrder(count, leading)`), so they are decoded before the first scroll. Measured: the first new frame after 38–50 ms, no jumps; the same with the network throttled to 20 Mbit/s.
- **Scrub on desktops:** `playSeconds={0}` and `length="200vh"` (one screen of scroll): the printer follows the scroll forwards and backwards, and stops where the scroll stops. The scrub also never runs ahead of the decoded frames (`readyThrough` now goes both ways, `step` -1; at most `MAX_WAIT_MS`). Measured: forwards 4 ticks then back 4 ticks, every frame in order, no long frames.
- **Full width:** the `max-width` of entry 06 on `.print-scroll__stage` is removed: the card is as wide as the page again, and the video covers it (on a 1536 × 730 window about 68 % of the video's height shows, the top and bottom cut).
- **Phones unchanged:** `mobileLength="140vh"` and `mobilePlaySeconds={2}` (new props) keep the one-scroll play; the coarse loading, the 64 MB window, and the play's pacing are as before. Measured: 73 of 78 frames, played to the end.
- Checks: `vp check` (two old warnings in `Testimonials.tsx`), `vp test` 316 passed, build, e2e `home`, `budgets`, `a11y`: 70 passed. The 6 failures are the reviews band tests: the band is hidden since `74894a2` ("Hide Testemonials"), not caused by this change.

## Changed files

- `src/islands/PrintOnScroll.tsx` (props `mobileLength`, `mobilePlaySeconds`; desktop loading, paced scrub)
- `src/features/home/print-scroll.ts`, `src/features/home/__tests__/print-scroll.test.ts` (`loadOrder` `leading`, `readyThrough` `step`)
- `src/features/home/Hero.tsx`
- `src/app/globals.css` (`.print-scroll` height under 48rem, no `max-width` on the stage)
- `e2e/home.spec.ts` (a desktop scrub test; the play test is phone only)
- `CLAUDE.md` (the scroll hero notes)

## Decisions

- Desktops download the whole video after the first paint, not on the first scroll: the first scroll is the moment the visitor looks, and the files are 3.7 MB. Phones keep the coarse set (Lighthouse mobile, data).
- Scrub (not the auto play) on desktops, because the author wants to play with the printer back and forth. The play stays on phones. Changing back is one prop (`playSeconds`).
- `200vh` on desktops: the length of the scrub version the author used before (`f07027c`); with a scrub there is no idle scroll after the print.

## Open items

- Full width brings back the cut top and bottom on wide, short windows (the complaint of entry 06). If that matters: a smaller header room on desktops would show more of the height.
- The reviews band e2e tests fail while the band is hidden: skip or remove them, or show the band again.
- To look at in Firefox on the author's desktop. Not committed.

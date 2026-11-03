---
tags: [prompt-log]
date: 2026-11-03
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-03 03 - Hero blended frames, edge to edge

## Prompt

> Good, but it is not smooth enough. Printing maschine is frame dropping. You can make it move quicker, but again make it smoother
>
> also, just for the hero page video, could you ignore padding and make it full width/length?
>
> or you can add some animations on that area
>
> /find-animation-opportunities
> /no-ui-flash

## Goal

On desktops the printer moves smoothly (no visible frame steps), a little quicker, and the hero video reaches the window's edges. Phones unchanged.

## Result

- **The cause** (Playwright Firefox and Chromium, 1536 × 730): the video has 78 frames for the whole print. A scroll moved the picture 1–3 video frames per screen frame, so the printer moved in steps (16 skips of 2 frames in one flick in Firefox).
- **Blended frames** (`blendOf` in `print-scroll.ts`, with tests; `PrintOnScroll` render): on desktops the canvas draws the two frames on either side of the progress, the second over the first by its share (in 32 steps), so the printer moves between the video's frames. It costs one more `drawImage` per screen frame and no decoding. Where one of the two is not decoded yet, the nearest frame, as before.
- **Quicker, without jumps:** desktop `smoothing` 0.2 (was 0.12; phones keep 0.12 through `mobileSmoothing`), and a new `maxSpeed` (`smoothTowards`, desktops only): 0.8 of the print per second, about one video frame per 60 Hz screen frame, so the whole print takes at least 1.3 s (the video: 2.6 s).
- **Decoding for scrubbing both ways** (desktops): 5 frames decode at once (phones 3), and the decode window keeps as many frames behind the picture as ahead (`decodeWindow(…, behind)`: 1 on desktops, 2 on phones). Before, a turn back found the frames behind not decoded and stood still.
- **Measured after:** steps of at most about one frame (median 1.0) in Chromium and Firefox, forwards, back, and back and forth; no long frames; at most an odd single 2-frame step and 1–3 one-frame pauses where the scroll turns. Phone: 72 of 78 frames, played to the end, as before.
- **Edge to edge on desktops** (CSS only, so the first paint is right, no-ui-flash): the hero section leaves the page frame (`md:mx-[calc(50%-50vw)] md:-mt-6`, `--frame: 0`, square corners); `html` has `overflow-x: clip` from 48rem, so a classic scrollbar's width in `100vw` makes no horizontal scroll. The hero texts keep the page's left edge (`contentClassName`: the page frame plus 2rem), lined up with the pill and the next section (88 px at 1536). At 1536 × 730 84 % of the video's height shows, at 1920 × 1080 all of it.
- No new animations: the author offered them as an alternative to the edge-to-edge hero. `/find-animation-opportunities` is not an installed skill; `no-ui-flash` was loaded and followed.
- Checks: `vp check`, `vp test` 320, build, e2e `home`, `budgets`, `a11y`, `smoke`, `projects`, `faq`, `page-change`, `services`: 119 passed, 6 failed (the reviews band tests; the band is hidden since `74894a2`).

## Changed files

- `src/islands/PrintOnScroll.tsx` (props `mobileSmoothing`, `maxSpeed`, `contentClassName`; blended drawing; desktop decode settings)
- `src/features/home/print-scroll.ts`, `src/features/home/__tests__/print-scroll.test.ts` (`blendOf`, `smoothTowards` `maxSpeed`, `decodeWindow` `behind`)
- `src/features/home/Hero.tsx`
- `src/app/globals.css` (`html` `overflow-x: clip` from 48rem)
- `CLAUDE.md`

## Decisions

- Blend frames instead of more frames: interpolated frames (60 fps) would double the files and the decoding, and decoding is the limit.
- A speed cap instead of a longer scroll: the scroll stays one screen; a fast flick plays the print in 1.3 s.
- `100vw` with `overflow-x: clip` on `html` (desktops) instead of moving the hero out of the layout's frame: the layout stays one frame for every page.

## Open items

- Look at it in Firefox on the author's desktop (the headless runs have no GPU and no real screen refresh).
- The reviews band e2e tests fail while the band is hidden.
- Not committed.

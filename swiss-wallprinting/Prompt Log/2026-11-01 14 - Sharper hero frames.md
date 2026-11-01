---
tags: [prompt-log, hero, performance]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done (built in 15, committed on main, pushed)
---
# 2026-11-01 14 - Sharper hero frames

## Prompt

> cool, now what do you think, can we add better quality hero video instead? Is it going to slow down the website?

## Goal

Find out whether the hero can look sharper, and what that costs in speed.

## Result

No project file changed. Measurements in the scratchpad only.

- **The source is better than the frames:** `Assets/Videos/SWP_PrintVideo.mp4` is 1920 × 1080, H.264, 14.8 Mbit/s. `scripts/frames.ts` scales it down to 1280 px (desktop, AVIF q55) and 960 px (phones, q50).
- **Where it looks soft:**
  - Desktop: a 1440 px wide window at 150 % scaling shows the frame about 2,085 device pixels wide, so 1280 px frames are stretched 1.6 times.
  - Phones: the stage shows about a third of the frame's width (Pixel 7: the frame is about 3,040 device pixels wide), so the 960 px frames are stretched about 3.2 times. This is the softest place.
  - Crops of the finished picture as a screen shows them: 1280 q55 is visibly softer than 1600 or 1920 (the figures, the crack edges); on a phone, 960 q50 is blurry, 1280 q50 is clearly better, and 1920 q45 is close to the source.
- **Sizes** (sharp, effort 4 like the pipeline; every 5th frame encoded, the total estimated for 100 frames; the two "now" rows match the real files):

| Frames | All 100 frames | Poster (frame 0) | One decoded frame |
|---|---|---|---|
| Desktop now: 1280 px q55 | 4.5 MB | 22 KB | 3.7 MB |
| Desktop 1600 px q55 | 6.2 MB | 30 KB | 5.8 MB |
| Desktop 1920 px q50 | 7.0 MB | 35 KB | 8.3 MB |
| Desktop 1920 px q55 | 8.2 MB | 40 KB | 8.3 MB |
| Phone now: 960 px q50 | 2.6 MB | 13 KB | 2.1 MB |
| Phone 1280 px q50 | 3.9 MB | 19 KB | 3.7 MB |
| Phone 1920 px q45 | 5.9 MB | 28 KB | 8.3 MB |
| Phone, the visible third cut out: 720 × 1080 q45 | 3.3 MB | about 16 KB | 3.1 MB |

- **What it costs:**
  - First load: only the poster loads with the page (the LCP image), so it grows by 6–18 KB. The frames load after the poster has painted (every 8th first, all of them on the first scroll), so they do not block the page.
  - Network: on a phone with about 10 Mbit/s, all frames take about 3 s at 1280 px instead of 2 s. Until then, the nearest loaded frames stand in, so the print looks choppier for longer.
  - Memory and scrolling: every decoded frame is larger. 100 frames at 1280 px are about 370 MB if the browser keeps all of them decoded (now about 210 MB); 1920 px on a phone would be about 830 MB, too much for older phones. Every drawn frame is also uploaded to the GPU, which costs more on weak laptops.
- **The cropped phone frames** (the third that the phone shows, following the printer, cut from the 1920 source) look as sharp as 1920 px frames for 3.3 MB. But landscape phones and small tablets under 768 px see the whole width, so they would need a third frame set, and the phone's pan would move from CSS into the frames. That is more work.

## Changed files

- This entry, `Prompt Log.md`.

## Decisions

- Recommended: desktop 1600 px q55 and phones 1280 px q50 (both settings in `VARIANTS` in `scripts/frames.ts`, then `vp run frames`). Most of the visible gain for +1.7 MB (desktop) and +1.3 MB (phones). Then measure Lighthouse mobile on the home page and scrolling on a real phone.
- A better source (4K) helps only together with the cropped phone frames. On desktops, 1920 px is already about what a laptop screen shows.

## Open items

- The author chose the recommended step ("Yes, build it"): built in [[2026-11-01 15 - Sharper hero frames built]]. The cropped phone frames stay an option.

---
tags: [prompt-log]
date: 2026-10-22
agent: Claude Code (Opus 5.5)
status: waiting for the author
---
# 2026-10-22 01 - Print on scroll hero

## Prompt

> I'm building a landing page for a company that sells Wallpen wall printing machines. I want a "print on scroll" hero section: as the user scrolls down, a background video of a Wallpen printer printing a mural on an office wall plays forward in sync with the scroll. Scrolling back up plays it in reverse. The printer's movement and the appearance of the mural must be tied directly to scroll position and speed, so the user feels like they are driving the print.
>
> ## Assets
> - Video:  C:\Users\IbrahimHodžić\OneDrive - Galeyo d.o.o\Desktop\My projects\swiss-wallprinting\src\assets\videos\landingPageVideo.MP4, no audio. office; the machine moves left to right and prints a watercolor mural of a Swiss lakeside village. The first frame is a blank wall, the last frame is the finished mural.
> - Company logo: C:\Users\IbrahimHodžić\OneDrive - Galeyo d.o.o\Desktop\My projects\swiss-wallprinting\src\assets\photos\SWPLogo
> - Stack: [React + TypeScript + Vite / Next.js / plain HTML+JS]. Styling: [Tailwind / CSS modules / plain CSS].
>
> ## How it should behave
> 1. The hero section is tall (around 400vh; make this configurable). Inside it, a full-viewport sticky container shows the video, covering the screen (object-fit: cover behaviour, centered on the wall).
> 2. Scroll progress through the section (0 → 1) maps to video progress (first frame → last frame). At 0 the wall is blank; at 1 the mural is complete.
> 3. Playback must be smooth when scrolling slowly, quickly, and in reverse. No stutter, no jumps.
> 4. Smoothing: interpolate the displayed frame toward the target frame (lerp in a requestAnimationFrame loop) so fast trackpad or wheel flicks don't feel jerky, while the motion still clearly follows the scroll. Make the smoothing factor configurable.
> 5. Logo "signature": in the bottom-right corner of the mural, the company logo fades in subtly (opacity plus a slight scale or blur-to-sharp) during the last ~8% of progress, like a signature on a painting. It is an HTML overlay, not part of the video.
> 6. Optional text overlays: a headline at the start, for example "[headline]", that fades out as printing begins, and a CTA, for example "[CTA text]" with a button, that appears once the mural is complete. Use placeholders that I can edit.
> 7. After the section ends, the page scrolls normally into the next content.
>
> ## Technical approach (important)
> Do NOT scrub a <video> element with currentTime. It stutters, especially in Chrome, because of keyframe seeking. Instead:
> - Give me an ffmpeg command to extract the video into an image sequence (WebP, quality ~80, every frame at the source fps, numbered files), plus an optional command to downscale a mobile set.
> - Preload all frames into Image objects (or ImageBitmap where supported) and draw the current frame to a <canvas> with "cover" sizing. Handle devicePixelRatio and window resize.
> - Show the first frame immediately, then load the rest progressively. Show a subtle loading state if the user scrolls ahead of the loaded frames, and never show a blank canvas.
> - Use a passive scroll listener (or IntersectionObserver plus scroll) for progress, and draw only when the frame index actually changes.
> - Use a smaller frame set or lower resolution on mobile, chosen by viewport width.
> - prefers-reduced-motion: skip scrubbing, show the final frame with the logo, and keep the section short.
> - Clean up listeners and the rAF loop on unmount (if using React).
> - No heavy animation libraries unless clearly justified. If you think GSAP ScrollTrigger is a better fit than vanilla, explain the trade-off briefly and implement whichever is cleaner.
>
> ## Deliverables
> 1. The ffmpeg command(s) for frame extraction.
> 2. A self-contained, reusable component (e.g. <PrintOnScroll />) with props: frame path pattern, frame count, section height, smoothing factor, logo src, overlay content.
> 3. A short usage example showing how to drop it into the page.
> 4. Brief notes on tuning: section height vs. how "heavy" the scroll feels, and smoothing.
>
> Keep the code clean and typed, and comment only the non-obvious parts. Ask me if anything essential is missing before writing the code.

Answers of the author to the agent's questions (all the recommended options):

- Placement: replace the home hero (photo card with the CSS print pass).
- ffmpeg: install it with winget; a `vp run frames` pipeline writes the frames and a manifest.
- Phones: the crop pans with the printer.
- Texts: reuse the current hero texts (eyebrow, headline, lead; the two buttons at the end) plus a new short end headline.

## Goal

The home hero plays the client's time-lapse with the scroll: the visitor "drives" the print forwards and backwards, the logo signs the finished mural, and the call to action appears at the end.

## Result

- **Video facts** (parsed, then `ffprobe`): 1280 × 720, 5.0 s, 121 frames, variable frame rate (20 and 30 fps alternate, about 24 average), **one keyframe** (so `currentTime` scrubbing would stutter), a silent AAC track. The video is **AI-generated: a "Dreamina AI" watermark in the bottom-right corner and a small "AI" badge in the top-left corner of every frame.**
- **Frames:** ffmpeg 9.0.2 installed with `winget install Gyan.FFmpeg`. `vp run frames` (`scripts/frames.ts`) writes `public/frames/hero/desktop/0000–0120.webp` (1280 × 720, q80, 7.8 MB) and `mobile/` (960 × 540, q75, 4.4 MB), and `src/content/images/frames.ts`. The equivalent ffmpeg commands are at the top of the script. `-fps_mode passthrough` keeps every decoded frame exactly once (the source frame rate varies).
- **`PrintOnScroll`** (`src/islands/PrintOnScroll.tsx`), a reusable client island: props `frames` / `mobileFrames` (pattern with `%04d`, count, size), `mobileQuery`, `length` (default `400vh`), `smoothing` (default 0.12), `focus` (pan path), `signature` (src and place in the frame), `intro`, `hint`, `outro`, `children`, `stageClassName`.
  - The server renders frame 0 as a `<picture>` poster (LCP, `fetchpriority=high`); reduced motion gets the last frame, phones the mobile set, through `<source media>`. The canvas lies on it and only draws loaded frames: never blank.
  - A CSS "frame" box with the video's proportions covers the stage (container query units: `width: max(100cqw, 100cqh * ar)`). Poster, canvas, and signature are inside it, so they line up at every size and the signature stays on the mural. The canvas keeps the frame's native pixels and the browser scales it like the `<img>`: no devicePixelRatio maths, no redraw on resize (a frame of 720 px is never sharper on a denser canvas).
  - JavaScript: one passive scroll listener (cached geometry, `ResizeObserver` for viewport changes), a rAF loop that runs only while the shown progress moves toward the scroll, time-based lerp (the same feel on 60 and 120 Hz), `drawImage` only when the frame index changes. It writes `--p` on the stage; CSS derives the intro fade (0–10 %), the outro (88–96 %), the signature (92–100 %: opacity 0.85 and scale 0.94 → 1, `mix-blend-mode: multiply`, so the ink logo looks printed), the shade, and the phone pan (`translate: clamp(…)`). Transform and opacity only.
  - Loading: first and last frame, then every 64th, 32nd, … (`loadOrder`), 6 at a time, `fetchpriority=low`, `decode()` before the first draw. Ahead of the loaded frames, the nearest loaded one shows, and a thin bar appears after 300 ms.
  - Reduced motion: no frames load; CSS shows the last frame, the signature, the intro and the outro in a one-screen card.
  - Keyboard: the outro buttons stay in the tab order; a focus on them scrolls to the end of the section (deferred one frame, so the browser's own scroll-into-view does not cancel it).
  - Cleanup on unmount: rAF, scroll listener, observer, and pending downloads.
- **Pure logic with tests** (`src/features/home/print-scroll.ts`, 14 tests): `framePath`, `scrollProgress`, `frameAt`, `smoothTowards`, `loadOrder`, `nearestLoaded`. A content test checks that every frame of the manifest is in `public/`.
- **Content:** `src/content/hero-video.ts` (frames, `focus` [0.2, 0.75], `signature` {x 0.77, y 0.47, width 0.065}), with a Zod schema; **`mock: true`** (AI video with a third-party watermark), so the production build stops (checked: the guard names `heroVideo / hero-video`) and the hero shows an "Esempio" badge.
- **Hero** (`src/features/home/Hero.tsx`): `PrintOnScroll` in the page frame (sticky card, `--stage-top` / `--stage-h` per screen size); the signature is the client's black logo (`/brand/swp-logo-black.svg`, the same file as `src/assets/photos/SWP_LogoBlack.svg` and `Assets/`).
- **Removed:** the CSS print pass and drift, and `src/islands/PrintPass.tsx` (no other users).
- **Texts:** `Home.hero.scrollHint`, `outroTitle`, `mockBadge`, and a new `imageAlt` in all four languages.
- **Checks:** `vp check` clean, `vp test` 212 passed, `vp run build` passed. Browser (the author's dev server on port 3000): start state, scrub forward and backward, end state with signature and CTA, the phone at 375 × 812 (pan, mobile frames only: 121 requests, no desktop frames), no console errors.

## Changed files

- `scripts/frames.ts` (new), `package.json` (`frames` script), `vite.config.ts` (format ignore for the generated manifest)
- `public/frames/hero/desktop/*.webp`, `public/frames/hero/mobile/*.webp` (new, generated)
- `src/content/images/frames.ts` (new, generated), `src/content/images/types.ts` (`FrameSet`)
- `src/content/hero-video.ts` (new), `src/content/schema.ts` (`heroVideo`), `src/content/index.ts`, `src/content/__tests__/content.test.ts`
- `src/features/home/print-scroll.ts` (new), `src/features/home/__tests__/print-scroll.test.ts` (new)
- `src/islands/PrintOnScroll.tsx` (new), `src/islands/PrintPass.tsx` (deleted)
- `src/features/home/Hero.tsx`, `src/app/globals.css`
- `messages/it.json`, `messages/de.json`, `messages/en.json`, `messages/bs.json`
- `CLAUDE.md`, `swiss-wallprinting/Development Plan.md`, this log

## Decisions

- **Vanilla, not GSAP ScrollTrigger.** The work is one progress value, a lerp, and a `drawImage`; ScrollTrigger (about 40 KB with GSAP core) would replace about 30 lines of scroll code and add its own pinning, which fights the CSS `position: sticky` stage. Nothing else on the site uses GSAP.
- **`HTMLImageElement` with `decode()`, not `ImageBitmap`.** 121 decoded bitmaps of 1280 × 720 hold about 450 MB (250 MB for the phone set) for the whole visit; the browser's own image cache keeps the frames near the scroll position decoded and drops the rest.
- **The canvas is the frame's native size; CSS does the cover.** No DPR or resize code, and the poster-to-canvas change is pixel-identical.
- **The phone set has all 121 frames, 960 px wide.** A portrait phone shows only about a quarter of the frame width, so a smaller width soon looks soft; fewer frames would make slow scrolling step. Change `VARIANTS` in `scripts/frames.ts` to trade.
- **The phone pan ends at x = 0.75, not on the printer (0.85).** At the end the printer is behind the pillar; 0.75 shows the village and the signature, and the printer stays in view the whole way.
- **The signature place** is in the light foliage right of the village, above the monitors: the mural's real lower-right corner is behind the plant and the desks.
- **Mock.** The video is not the client's footage and carries a third-party watermark; by the content rules it is mock until the client approves a clean version.

## Open items

- **Author: the watermark.** Every frame has "Dreamina AI" (bottom right, visible on most screens) and an "AI" badge (top left). Export the video without the watermark (a paid Dreamina plan) or get the client's real time-lapse, check that the licence allows commercial use, then run `vp run frames`, check `focus` and `signature`, and set `mock: false`. I did not crop the watermark out.
- **Author/translator: review the drafts** of `scrollHint`, `outroTitle`, and `imageAlt` in DE, EN, and BS.
- **Not checked in a browser:** reduced motion (the pane cannot emulate it; the CSS and the `<picture>` sources are in place), a real keyboard focus (the pane had no system focus, so focus events did not fire; the handler works when called), the feel at 60/120 Hz on a visible window and on a real phone (the pane was hidden, which slows rAF), Lighthouse (LCP is now the frame-0 WebP, 54 KB).
- **Weight:** 7.8 MB of frames on desktop and 4.4 MB on phones, loaded after hydration at low priority. Options: fewer frames on phones, or a static frame when `navigator.connection.saveData` is on.
- **Git:** nothing is committed. `src/assets/videos/landingPageVideo.mp4` (5.9 MB) and the logo copies in `src/assets/photos/` are untracked (the repo is public: decide whether the AI video goes into it). `public/frames/` (242 files) is generated; commit it like `public/mock/`, or generate it in the deploy.
- A reload in the middle of the section shows frame 0 and the intro until hydration (`--p` starts at 0).

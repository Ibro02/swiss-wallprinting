---
tags: [prompt-log, hero, video, performance, avif]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done (branch feat/hero-video, not committed)
---
# 2026-11-01 09 - Implement the hero video plan

## Prompt

> let's implement the plan

## Goal

Build [[Specs/Hero video]]: the author's new video in the scroll hero, with lighter frames.

## Result

- **Plannotator:** the author approved the plan in chat. The Plannotator session (`annotate --gate --json`) was still open, with no feedback sent. The agent stopped it.
- **Videos (Q5):**
  - `SWP_PrintVideo.mp4` and the old `landingPageVideo.mp4` are now in `Assets/Videos/`, which git ignores (`.gitignore`).
  - The old video is removed from the index (`git rm --cached`), and `src/assets/videos/` is gone.
- **Pipeline (`scripts/frames.ts`):**
  - The source is `Assets/Videos/SWP_PrintVideo.mp4`. If the file is missing, the script stops with a message, and the frames stay as they are.
  - `VIDEO` holds the two facts about the video (`lastFrame: 124`, `repeatEvery: 5`), so ffmpeg runs `trim` + `decimate`. The header comment has the ffmpeg command that finds these facts in a new video.
  - Lossless PNG frames go to `node_modules/.cache/hero-frames/`. sharp turns them into AVIF: desktop q55, phone q50, effort 4, 4 in parallel.
  - The script also writes a WebP copy of the first and the last frame (q80 / q75).
  - The manifest has `fallback`. The script prints the size of each set and of its poster.
  - Effort 6 and 8 were measured: less than 2 % smaller, and 3 and 4.5 times as slow.
  - **Result:** 100 frames per set. Desktop 4.5 MB (poster 22 KB), phone 2.5 MB (poster 12 KB). Before: 121 frames, 7.8 and 4.4 MB. About 2 minutes.
- **Content:**
  - `hero-video.ts`: a new comment (the author's video, mock until the client approves it, the steps for a new video), `cropBottom: 0`, and the new `focus` track.
  - `signature` is removed from the content and from the schema.
  - `FrameSet` and the schema have an optional `fallback`.
  - A content test checks that the fallback files exist.
- **Printer track (Q4):**
  - Measured with a scratch script: each desktop frame against the finished picture, in the top 85 %, at 320 px. The left edge of the changed area is the printer's mast; each point is that edge + 0.015.
  - Result: `[0.243, 0.312, 0.396, 0.49, 0.587, 0.674, 0.762, 0.853, 0.887, 0.51, 0.51]`. From 0.8 the camera turns to the middle of the print (0.22 … 0.78).
  - The same script found no repeated frames. Only frames 97 to 99 differ a little: the end of the fade.
- **Poster (`PrintOnScroll.tsx`):**
  - Each `<source>` is AVIF (`type="image/avif"`), then WebP. The `<img>` is the WebP frame 0.
  - If the browser chose the fallback (`choseFallback`, which reads the poster's `currentSrc`; it is in `print-scroll.ts` with `imageType`, and both have tests), the island loads no frames and sets no `data-loading`, and the overlays still follow the scroll.
  - This was added during the build. Without it, a browser without AVIF would request 100 frames it cannot decode, and the loading bar would stay.
- **Signature (Q7):**
  - Removed from `PrintOnScroll` (the prop, the `<img>`, `PHASES.signatureIn`, `--signature-in`) and from `globals.css` (`--signature`, `.print-scroll__signature`).
  - The comments that named it are updated.
- **Alt text:** the poster's `Home.hero.imageAlt` described the old video (a watercolour of a Swiss lake village on an office wall). It is new in IT, DE, EN, and BS. The DE, EN, and BS versions are agent drafts for review.
- **e2e:**
  - `home.spec.ts`: the reduced-motion test reads the last frame from the manifest; before, it expected `0120.webp`.
  - New test, "a browser without AVIF keeps the WebP poster and loads no frames". It changes `type="image/avif"` in the HTML to an unknown type, on desktop and on phone.
  - Firefox ignores `image.avif.enabled=false` and Chromium has no flag for AVIF, so neither browser can turn AVIF off for a test.
- **Checks:**
  - `vp check` passes, and `vp test` passes (278 tests).
  - The full e2e suite passed before the new test (139 passed, 29 skipped, 0 failed). The home tests with the new test pass too (12 passed, 2 skipped).
  - The final run after the alt text change: the build passes, and the full e2e suite has 141 passed, 29 skipped (one-device tests), and 0 failed.
  - **Decode speed, Chromium**, all 100 frames, 6 at a time:

    | Set | CPU 1× | CPU 4× |
    |---|---|---|
    | Phone AVIF | 0.66 s | 0.94 s |
    | Phone WebP q65 | 0.57 s | 0.60 s |
    | Desktop AVIF | 0.96 s | 1.13 s |
    | Desktop WebP q70 | 1.12 s | 1.10 s |

    AVIF stays (Q1): on phones it downloads 0.8 MB less. The CPU slowdown may not reach the decoder threads.
  - **Lighthouse**, home page, mobile, 3 runs: performance 0.78 / 0.80 / 0.86 (before: 0.77–0.81), accessibility, best practices, and SEO 1.0. LCP 3.3–3.8 s, CLS 0.
  - **Screenshots** (Chromium and Firefox 1440 × 900; Chromium 1920 × 1080, 390 × 664, 360 × 740, dark, reduced motion): as planned.
- **Docs:**
  - `CLAUDE.md`: the scroll hero rule, the `vp run frames` row, and the code layout rows.
  - [[Specs/Hero video]]: the "Result" section.
  - [[Development Plan]]: 4.1 Hero.

## Changed files

- `.gitignore` (`Assets/Videos/`)
- `src/assets/videos/landingPageVideo.mp4` (removed from git; the file is now in `Assets/Videos/`)
- `scripts/frames.ts`
- `public/frames/hero/desktop/*`, `public/frames/hero/mobile/*`: 100 AVIF files and 2 WebP files per set, replacing 121 WebP files.
- `src/content/images/frames.ts` (generated), `src/content/images/types.ts`, `src/content/schema.ts`, `src/content/hero-video.ts`, `src/content/__tests__/content.test.ts`
- `src/features/home/print-scroll.ts`, `src/features/home/__tests__/print-scroll.test.ts`
- `src/islands/PrintOnScroll.tsx`, `src/app/globals.css`
- `messages/it.json`, `de.json`, `en.json`, `bs.json` (`Home.hero.imageAlt`)
- `e2e/home.spec.ts`
- `CLAUDE.md`, `swiss-wallprinting/Specs/Hero video.md`, `swiss-wallprinting/Development Plan.md`, the prompt log

## Decisions

- AVIF effort 4, because a higher effort does not make the files smaller.
- The island skips the frames when the poster shows the WebP fallback (see Result).
- Frames 97 to 99 stay in, although they differ only a little: they are the end of the fade, and removing them would change the facts in `VIDEO`.

## Open items

- **Commit:** nothing is committed. The author decides when.
- **The client's approval of the video (Q6):** until then `hero-video.ts` stays mock, and the production build stops.
- **Review:** the DE, EN, and BS alt texts.
- **Test on a real phone:** check the smoothness, and how the camera turns at the end.
- **An old problem, not changed here:** with reduced motion on a short phone (390 × 664), the intro text is taller than the hero card, and its top is cut off.
- **Later, in its own branch:** the WebCodecs video stream (Q1 c), about 1.1 MB on desktops and 0.7 MB on phones.

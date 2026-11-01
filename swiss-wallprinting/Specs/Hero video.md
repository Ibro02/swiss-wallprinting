---
tags: [spec, plan, hero, video, performance]
date: 2026-11-01
status: built (2026-11-01, branch feat/hero-video, not committed)
---
# Hero video: the SWP print video, lighter frames

Branch: `feat/hero-video`. Prompt log: [[2026-11-01 07 - New hero video and lighter frames]] (grilling), [[2026-11-01 08 - Hero video plan in Plannotator]] (this plan).

## Goal

Replace the Dreamina mock video in the scroll hero with the author's new video `SWP_PrintVideo.mp4`. Make what a visitor downloads smaller than it is today.

Visitors never download the MP4. `vp run frames` makes still frames from it, and the page downloads those frames. The weight that counts is the frames.

## Decisions from the grilling round (2026-11-01, the author accepted all seven)

| No. | Decision |
|---|---|
| Q1 | The frames are **AVIF**, with the same look as today's WebP: quality 55 on desktops, 50 on phones. Before we keep AVIF, we check that the scroll stays smooth on a slow phone. If it does not, we use WebP (q70 on desktops, q65 on phones). The video stream that the page decodes itself (WebCodecs) gets its own branch later. |
| Q2 | **100 frames.** We drop the copied frames (every 5th frame, because the video is 24 fps stretched to 30) and the still end (frames 125 to 179). We do not remove more frames. The scroll length stays 400vh. |
| Q3 | **Crop A**, `cropBottom: 0`. At full width, a 16:9 desktop hides the top tenth and the bottom tenth of the frame. |
| Q4 | **The phone camera** follows the printer (we measure it again), then moves to the middle of the print while the printer fades out. |
| Q5 | **Both videos are outside git**, in `Assets/Videos/`, which git ignores. Only the frames are committed. |
| Q6 | `hero-video.ts` stays **`mock: true`** until the client approves the video. |
| Q7 | **Remove the dead signature** from all places. |

## Expected result

| | Today (old video) | After |
|---|---|---|
| All frames, desktop | 121 WebP frames, 7.8 MB | 100 AVIF frames, about 4.5 MB |
| All frames, phone | 121 WebP frames, 4.4 MB | 100 AVIF frames, about 2.5 MB |
| The poster (frame 0, the LCP image), desktop / phone | 54 / 30 KB | about 22 / 12 KB |
| Before the first scroll (every 8th frame), desktop | about 1.06 MB | about 0.64 MB |
| Video files in git | 5.9 MB (`landingPageVideo.mp4`) | none |

The numbers come from trial encodes with effort 4. The final numbers go into the prompt log.

## Steps

### 1. Move the video files out of git

- Move `src/assets/videos/SWP_PrintVideo.mp4` to `Assets/Videos/SWP_PrintVideo.mp4`.
- Move `src/assets/videos/landingPageVideo.mp4` to `Assets/Videos/landingPageVideo.mp4` and remove it from git (`git rm --cached`). Its history stays in git.
- In `.gitignore`, add `Assets/Videos/` with a comment next to `Assets/Projects/`.
- The folder `src/assets/videos/` is then empty, and we remove it.

### 2. The frames pipeline (`scripts/frames.ts`)

- **Source:** `Assets/Videos/SWP_PrintVideo.mp4`. If the file is missing, the script stops and tells you where to put it, and `public/frames/` stays as it is. This is the same as `vp run images` does for photos.
- **Frame selection:** the two facts about this video go at the top of the script: `lastFrame: 124` (the finished picture) and `repeatEvery: 5` (a copied frame in every 5). The ffmpeg filter `trim=end_frame=125,decimate=cycle=5` then gives 100 frames. The header comment shows the ffmpeg command that finds these two facts for the next video (a list of the difference between each frame and the frame before it).
- **Encoding:**
  - ffmpeg writes lossless PNG frames at 1280 px and 960 px into a temporary folder, `node_modules/.cache/hero-frames/`. The folder is inside the project because the system temp path contains the "ž" and "ć" of the user name, and OneDrive does not sync `node_modules`.
  - sharp encodes the frames to AVIF: quality 55 on desktops, quality 50 on phones. We choose the effort during the build: the smallest file that is still made in a reasonable time.
- **Poster fallback:** the script also writes WebP copies of the first frame and the last frame of each set (4 files), for step 4.
- **Manifest (`frames.ts`):**
  - The pattern is `…/%04d.avif`, the count is 100, and the sizes are recorded.
  - A new field, `fallback`, has the value `…/%04d.webp`. Only the first frame and the last frame have a WebP file.
- **When the script ends:**
  - It deletes the temporary folder.
  - It prints the size of each set, as it does today.

### 3. The content (`src/content/hero-video.ts`, `schema.ts`, `images/types.ts`)

- **The header comment** says:
  - the video is the author's video of 2026-11-01;
  - its source is in `Assets/Videos/`, which is not in git;
  - why the video is still mock (Q6);
  - what to do for a new video: put the file in `Assets/Videos/`, check the two facts, run `vp run frames`, and measure `focus` again.
- **`cropBottom: 0`** (Q3), with the reason in a comment: the video has no watermark, and a 16:9 desktop hides the top tenth and the bottom tenth evenly.
- **`focus`:** 11 new points (step 5).
- **`signature`:** removed (Q7), from the schema too.
- **`FrameSet`:** a new optional field, `fallback`.

### 4. The poster in AVIF with a WebP fallback (`PrintOnScroll.tsx`)

Today the poster `<picture>` has three sources:
- frame 0 for phones;
- the last frame for reduced motion;
- the last frame for reduced motion on phones.

Each of these sources gets an AVIF version first (`type="image/avif"`) and the WebP version after it. The `<img>` uses the WebP frame 0.

A browser without AVIF (for example Safari 15 on an iPhone 7) therefore shows the poster, never an empty stage. The canvas frames do not decode in such a browser, so the poster stays. This is what already happens today when a frame does not load.

### 5. Measure the printer track (Q4)

- **Why a new method:** the old method looked for the violet UV lights. This printer is white and has no such lights.
- **The new method:**
  1. Compare each desktop frame with the finished picture (the last frame).
  2. Look only at the wall band, the top 85 % of the frame, so the floor rails do not count.
  3. The pixels that changed are the printer and the part of the wall that is not printed yet, which is to the right of the printer. The left edge of that area is the printer.
- **The points:**
  - 11 points, at progress 0, 0.1, … 1.
  - From progress 0.8 the points move to the middle of the print. They arrive there at 0.9, before the closing buttons appear at 0.88 to 0.96.
- **How:** we measure once with a script in the scratch folder, as we did for the old video. The method goes into the comment in `hero-video.ts`.

### 6. Remove the signature (Q7)

- **`PrintOnScroll.tsx`:**
  - the `signature` prop and its `<img>`;
  - `PHASES.signatureIn` and `--signature-in`;
  - the comments that name the signature.
- **`globals.css`:**
  - `--signature` and `.print-scroll__signature`;
  - the comments that name the signature, including the reduced-motion comment.
- **`Hero.tsx`:** no change, because it does not pass a signature.

### 7. The docs

- **`CLAUDE.md`:**
  - "Scroll hero": the video facts, the signature is gone, and the crop.
  - The `vp run frames` row: the source is in `Assets/Videos/`, the frames are AVIF, and there are 100 frames.
  - The rows of the code layout that name the signature (`src/features/home/`, `src/content/`).
- **`Development Plan.md`:** a line in 4.1 Hero for 2026-11-01, with a link to this spec.
- **The prompt log.**

### 8. Checks

1. Run `vp run frames`, then `vp check` and `vp test`. The content test checks that each frame and each fallback file exists.
2. Run `vp run build`, then `vp run e2e` on the production build: the scroll hero, axe, and the budgets.
3. Run Lighthouse on the home page, mobile. The poster is the LCP image. Compare the result with today (performance 77 to 81).
4. **Smoothness on a slow phone (Q1):**
   - Use Chromium with 4× CPU slowdown and the "Fast 4G" network.
   - From the first scroll, measure how long it takes until all frames are decoded, and whether the scroll drops frames.
   - Do the same with WebP q70 to compare.
   - If AVIF fills in clearly slower, use WebP (we agreed this in Q1).
5. **Firefox**, the author's browser: the hero looks right, scrolls right, and the AVIF frames decode. Use Playwright's Firefox in a scratch folder.
6. **Look at it by eye:**
   - desktop at 16:9 and at 16:10;
   - phone at 360 × 740 and at 390 × 844;
   - the light theme and the dark theme;
   - reduced motion.

### 9. Not in this branch

- The WebCodecs video stream (Q1 c): later, in its own branch.
- Commit and push: only when the author asks.

## Choices you may want to change

Annotate these if you want a different choice:

- **The numbers:** AVIF quality 55 on desktops and 50 on phones, and the effort.
- **The WebP fallback for the poster (step 4):** it adds 4 small files. Without it, a browser without AVIF shows an empty hero.
- **The printer track (step 5):**
  - We measure it once by hand, as before.
  - Or `vp run frames` measures it on every run and prints the points. That is more code, but the next video gets its track automatically.
- **The temporary folder** in `node_modules/.cache/`.
- **The old video:** keep it in `Assets/Videos/`, or delete it from your disk.

## Result (2026-11-01)

The author approved the plan in chat ("let's implement the plan"). The Plannotator session was closed without feedback. Built as planned, with these results and changes:

- **Frames:**
  - 100 per set: desktop 4.5 MB AVIF (poster 22 KB), phone 2.5 MB AVIF (poster 12 KB).
  - Four WebP fallback files.
  - `vp run frames` takes about 2 minutes.
- **AVIF effort 4:** effort 6 and 8 made files less than 2 % smaller and took 3 and 4.5 times as long.
- **Smoothness (Q1):**
  - Chromium decodes all 100 phone frames in 0.66 s as AVIF and 0.57 s as WebP q65. With a 4× CPU slowdown it is 0.94 s and 0.60 s.
  - The desktop sets take about 1 s either way.
  - On phones, AVIF downloads 0.8 MB less, which saves more time on a phone network than the extra decoding costs. AVIF stays.
  - The CPU slowdown may not reach the image decoder threads, so a real phone is still the final test.
- **Added (not in the plan):**
  - The island loads no frames when the poster shows the WebP fallback (`choseFallback` in `print-scroll.ts`, with tests). Without this, a browser without AVIF would request 100 frames that it cannot decode, and the loading bar would never go away. The overlays still follow the scroll.
  - An e2e test checks this. It changes the AVIF `type` to an unknown type, which a browser skips as it skips a format it lacks.
  - Neither browser can turn AVIF off any more: Firefox ignores `image.avif.enabled`, and Chromium has no flag.
- **Alt text:** the poster's alt text (`Home.hero.imageAlt`) described the old video, so it is new in all four languages. The DE, EN, and BS versions are agent drafts.
- **Printer track:**
  - Measured as planned: `[0.243, 0.312, 0.396, 0.49, 0.587, 0.674, 0.762, 0.853, 0.887, 0.51, 0.51]`.
  - The printer fades below the threshold after frame 80.
  - Frames 97 to 99 differ only a little (the end of the fade). They stay in.
- **Checks:**
  - `vp check` and `vp test` (278) pass.
  - The full e2e suite passes: 141 passed, 0 failed, with the new test, on the final build.
  - Lighthouse on the home page, mobile: performance 0.78 / 0.80 / 0.86 (before: 0.77–0.81), accessibility, best practices, and SEO 1.0, CLS 0.
  - Screenshots at 1920 × 1080, 1440 × 900, 390 × 664, and 360 × 740, light and dark, reduced motion, in Chromium and Firefox: as planned.
- **An old problem, not changed here:** with reduced motion on a short phone (390 × 664), the intro text is taller than the stage, and its top is cut off. This does not depend on the video.

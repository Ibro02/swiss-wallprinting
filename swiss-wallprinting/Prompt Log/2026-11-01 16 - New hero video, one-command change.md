---
tags: [prompt-log, hero, maintenance]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done (committed on main, not pushed)
---
# 2026-11-01 16 - New hero video, one-command change

## Prompt

> I have a new video in downloads folder, I want you to use that instead of the current one
>
> it is basically same video with just minor details changed
>
> because I'll have to maintain this website, and maybe I'll change the video again, make it easy for me to change it (give me an instructions) and write to claude.md steps how to change it with a minimal cost

## Goal

Use the new video `SWP_WebVideo2.mp4` (Downloads, 2026-11-01 16:40) in the hero, and make the next video change a short, cheap routine, documented in `CLAUDE.md`.

## Result

**The new video differs in timing:**
- It is 1920 × 1080, 30 fps, 180 frames, 6 s, like the old one, and the finished picture is the same scene (tree, family, cracked wall, drips), so the alt text stays.
- It has no repeated frames (the old one repeated every 5th).
- For about 1.3 s the printer waits at the left while the window light moves.
- The armchair and the plant appear only near the end, while the printer fades out.
- After frame 131 it hardly changes (a slow drift until 179).

**Why the old way did not fit:**
- Two video facts in `scripts/frames.ts` (`lastFrame`, `repeatEvery`) had to be set by hand, and the printer track (`focus`) was measured by hand with a scratch script.
- On this video the old method would have failed: it took the left edge of the area that differs from the finished picture, in the top 85 %, and the late armchair would have held that edge at 0.14.

**Now automatic** (`scripts/lib/hero-video.ts`, pure functions, 13 tests in `scripts/__tests__/hero-video.test.ts`):
- `distinctFrames`: drops copies. A copy is a step under 0.02, or under 0.3 × the median of the 6 steps around it.
- `printSpan`: starts 0.5 s before the picture is 2 % closer to the finished one. It ends where every later frame is within 4 % of the last.
- `sampleEvenly` / `chooseFrames`: at most 100 frames, with the video's last frame as the finished picture.
- `printerTrack`: compares each shown frame with the finished picture in the wall above the furniture (the top 60 %; a pixel differs above 32 gray levels; a column differs above 8 % of its pixels; at least 3 columns in a row). The first differing column right of the picture's left edge is the edge of the print, where the printer is. Each point is that column + 0.015. When nothing differs, the point is the middle of the picture.
- **Calibration:** on the 100 frames of the old hand measurement, the track matches it within 0.009 at all 11 points (`[0.249, 0.309, 0.393, 0.484, 0.578, 0.671, 0.759, 0.853, 0.887, 0.503, 0.503]` against `[0.243, 0.312, 0.396, 0.49, 0.587, 0.674, 0.762, 0.853, 0.887, 0.51, 0.51]`). The 85 % band failed on the new video; the 60 % band works for both.

**`scripts/frames.ts`:**
- `vp run frames "<path>"` copies the video to `Assets/Videos/hero.mp4` (the one before moves to `Assets/Videos/old/hero <date time>.mp4`). `vp run frames` without a path uses `hero.mp4`.
- It reads the size and frame rate (ffprobe), analyses all frames at 320 px gray, and extracts only the chosen frames (an ffmpeg `select` filter).
- It warns if the video is narrower than 1600 px.
- It prints what it chose and writes `heroFocus` into `src/content/images/frames.ts`.
- `VIDEO` and the hand command for repeats are gone. `hero-video.ts` uses `focus: heroFocus`.

**Run on the new video:**
- Frames 39 … 144: 100 frames, plus frame 179 as the finished picture.
- Track `[0.256, 0.306, 0.374, 0.459, 0.54, 0.628, 0.709, 0.787, 0.878, 0.511, 0.511]`.
- Desktop 1600 × 900, 4.5 MB (before 6.1), poster 22 KB. Phone 1280 × 720, 2.9 MB (before 3.8), poster 14 KB.
- Checked by drawing the track and a phone's third over 11 frames: the line is on the printer's mast from 0.0 to 0.8; at 0.9 and 1.0 it is in the middle of the picture.

**Files moved:** the old videos are now in `Assets/Videos/old/` (`SWP_PrintVideo.mp4`, `landingPageVideo.mp4`). Nothing was deleted, and the folder is not in git.

**Checks:**
- `vp check` clean; `vp test` 295 passed (13 new); `vp run build` passed; full `vp run e2e` 143 passed, 29 skipped, 0 failed.
- Lighthouse mobile home: 0.79, 0.79, 0.80 (LCP 3.66–4.09 s); before scrolling, 0.41 MB of frames (before 0.55).

**`CLAUDE.md`:**
- A new section, "Change the hero video": 5 steps for the author and for an agent, with no reading of the pipeline.
- The scroll hero rule, the `vp run frames` row, and the `scripts/` row.
- `.gitignore`: the comment on `Assets/Videos/`.

## Changed files

- `scripts/frames.ts`, `scripts/lib/hero-video.ts` (new), `scripts/__tests__/hero-video.test.ts` (new)
- `src/content/hero-video.ts`, `src/content/images/frames.ts` (generated), `public/frames/hero/**` (generated)
- `CLAUDE.md`, `.gitignore`, this entry, `Prompt Log.md`
- Not in git: `Assets/Videos/hero.mp4` (new), `Assets/Videos/old/` (the two old videos)

## Decisions

- **The still opening is cut:** the new video waits about 1.3 s before printing. The hero keeps 0.5 s of it (under the intro headline), so the print starts as the visitor begins to scroll, as with the old video. The setting is `LEAD_IN_SECONDS`.
- **At most 100 frames:** the new video would give 106 in its print span. The budget keeps the bytes and the phone memory as before.
- **The hero ends on the video's last frame**, the most settled picture. The span's end is within 4 % of it.
- **One fixed file name, `hero.mp4`,** with the old videos kept in `old/`. The author gives the path once, and the script does the rest.

## Open items

- Committed on `main` ("Yes, commit"), not pushed. The author's own change in `src/features/home/Testimonials.tsx` (the "example" badge of the mock reviews commented out, 16:48) is in the working tree too, and not part of this work. The project rule is that mock items show the badge.
- Look at the hero on a real phone. The client's approval of the video is still open (`mock: true`).

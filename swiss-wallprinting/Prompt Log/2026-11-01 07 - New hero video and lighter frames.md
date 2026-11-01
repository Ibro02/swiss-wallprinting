---
tags: [prompt-log, hero, video, performance, grilling]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done (all seven recommendations accepted)
---
# 2026-11-01 07 - New hero video and lighter frames

## Prompt

> I added a new video in C:\Users\IbrahimHodžić\OneDrive - Galeyo d.o.o\Desktop\My projects\swiss-wallprinting\src\assets\videos for hero page (with the scroll effect and I want to change the current one with this video). The only problem is that it is about 10MB, which is a lot
>
> Can you change the video on the site and see what you can do to reduce weight of the video
>
> create a new branch for this
>
> use these skills so we can come up with a good plan
> grill-with-docs: https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md
> grill-me: https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md
> grilling (under the hood): https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md

## Goal

Put the author's new video (`src/assets/videos/SWP_PrintVideo.mp4`) in the scroll hero instead of the Dreamina mock video. Make what the visitor downloads as small as possible. Agree on the plan first in a `grilling` round.

## Result

- Branch `feat/hero-video` from `main` (5cd5a79). Nothing is committed yet. The untracked `swiss-wallprinting.rar` and the missing `.claude/` folder are not part of this work: they were already like this.
- The skills: `grill-with-docs` calls `grilling` and `domain-modeling`, and `grill-me` calls `grilling` (read from GitHub). `domain-modeling` was read from git (`.claude/skills/`), because `.claude/` is still missing from the working tree.
- **The key fact:** visitors never download the MP4. `vp run frames` turns it into WebP frames, and the page downloads those frames. The MP4's size affects only the repository, which is public: a binary file stays in its history forever.
- **The new video:** 1920 × 1080, H.264, 30 fps, 6.0 s, 180 frames, no sound, 11.1 MB. The old one: 1280 × 720, about 24 fps, 121 frames, with sound, 5.9 MB, Dreamina watermark.
  - The video is 24 fps content stretched to 30 fps: every 5th frame (5, 10, …, 120) is a copy of the frame before it.
  - The printer moves from left to right (frames 0 to about 90), then fades out like a ghost (frames 90 to 120). At frame 121 the floor rails disappear. Frames 125 to 179 (1.8 s) do not change.
  - With `trim=end_frame=125,decimate=cycle=5`, 100 different frames remain. `mpdecimate` is not usable: it dropped the slow fade and the finished picture too.
  - The printer is white and has no violet UV lights. The method that measured `focus` for the old video (violet pixels) does not work on this video.
  - No watermark can be seen. The ghost fade and the rails that disappear look AI-generated.
- **Measured weight of the frames** (sharp/libwebp/libaom on this PC; SSIM = mean 8 × 8 luma SSIM against the lossless frame, every 5th frame):

| Option | Desktop (1280 px) | Phone (960 px) | Look |
|---|---|---|---|
| Today (old video, 121 frames, WebP q80/q75) | 7.8 MB | 4.4 MB | — |
| New video, today's settings (all 180 frames) | 12.5 MB | 6.8 MB | — |
| 100 frames, WebP q80/q75 | 6.7 MB | 3.7 MB | SSIM 0.986 / 0.982 |
| 100 frames, WebP q70 desktop, q65 phone | 5.3 MB | 3.3 MB | 0.980 / 0.979 |
| 100 frames, AVIF q55 desktop, q50 phone | 4.5 MB | 2.5 MB | 0.984 / 0.980 |
| 100 frames, AVIF q45 desktop | 3.2 MB | — | 0.977 |
| 100 frames as an H.264 stream (CRF 24, keyframe every 12) | 1.1 MB | 0.7 MB | ffmpeg SSIM 0.990 |

  - Decoding one frame on this PC: WebP 15 ms, AVIF 43 ms (1280 px), so AVIF is about 3 times slower.
  - When the agent compared a detail of the last frame at 100 %, WebP q80 and AVIF q55 looked the same. AVIF q45 is a little smoother in the leaves, and AVIF q35 is clearly soft.
  - Cutting the bottom 10 % off the frames saves about 13 % (5.8 instead of 6.7 MB). This applies only to a part that is never shown.
  - A trimmed copy of the source video without the repeated frames (1920 px, CRF 16, about the same look as the original) is 2.8 MB; at 1280 px it is 1.3 MB.
- **Crop:** on a 16:9 desktop the stage is 80 % of the screen height, so at full width a fifth of the frame height is always hidden. `cropBottom: 0.2` (today's value) cuts through the armchair and the plant. `cropBottom: 0` hides the top and the bottom 10 % evenly: the tips of the cracks touch the top edge, and the legs of the chair and the plant pot are cut a little.
- **Signature:** it was removed from the hero on 2026-10-24 (`Hero` does not pass it). `heroVideo.signature`, the schema field, the `PrintOnScroll` option, and its CSS are dead code, and the comment in `hero-video.ts` still tells the next agent to check it after a new video.
- **Grilling round 1** (seven questions, each with the agent's recommendation):
  1. How the frames get to the browser: (a) WebP, (b) AVIF with the same look, (c) a video stream that the page decodes itself (WebCodecs). The agent recommends (b) now and (c) later in its own branch.
  2. The frames: drop the copies and the still end, so 100 frames remain. Do not remove more.
  3. The crop: A, cut evenly (`cropBottom: 0`).
  4. The phone camera: it follows the printer (measured again with a new method), then turns to the middle of the print while the printer fades out.
  5. The source video: the original goes to `Assets/Videos/`, which git ignores (the same as the client's project photos). Only the frames go into git. The old `landingPageVideo.mp4` leaves the repo.
  6. Mock: `hero-video.ts` stays `mock: true` until the client approves the video.
  7. Remove the dead signature everywhere.
- `domain-modeling`: no new domain term so far. An ADR is necessary only if the author chooses the WebCodecs stream (Q1 c).

## Changed files

- `swiss-wallprinting/Prompt Log/2026-11-01 07 - New hero video and lighter frames.md` (this entry)
- `swiss-wallprinting/Prompt Log/Prompt Log.md` (table, current state)

The trial scripts and images are in the agent's scratch folder and are not part of the repo.

## Decisions

- Branch `feat/hero-video` (the author asked for a new branch).
- No code until the author confirms the plan (`grilling`: "do not act on it until the user confirms").

- **The author's answer (2026-11-01):** "Yes, accept the seven recommendations in round one". All seven are decided. No question is left open, so there is no round 2.

## Open items

- None for the grilling. The plan is in [[Specs/Hero video]], and the author reviews it in Plannotator: [[2026-11-01 08 - Hero video plan in Plannotator]].

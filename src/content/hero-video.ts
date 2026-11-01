// The home hero's time-lapse (README item 1, proposal P2), scrubbed by the scroll
// (PrintOnScroll). The author's video of 2026-11-01 (SWP_PrintVideo.mp4): a white room with
// an armchair and a plant; the printer prints a tree, a family, and a cracked-wall effect
// from left to right, then fades out. MOCK: it looks AI-generated (the printer fades like a
// ghost, the floor rails vanish), and the client has not approved it yet. The production
// build stops while this item is mock; the hero shows no "example" badge (the author's
// choice, 2026-10-22). Set `mock: false` once the client approves the video.
//
// The video is not in git (Assets/Videos/, .gitignore). For a new video: put it there and
// set `SOURCE` in scripts/frames.ts, check the two facts in `VIDEO` there (the last frame
// that changes, and repeated frames), run `vp run frames`, and measure `focus` again.

import { heroFrames } from './images/frames.ts'
import type { HeroVideo } from './schema.ts'

export const heroVideo: HeroVideo = {
  id: 'hero-video',
  mock: true,
  frames: heroFrames,
  // Where the printer is (x) at progress 0, 0.1, … 1 (frames 0, 10, 20, … 99), measured
  // 2026-11-01: each desktop frame against the finished picture, in the wall band (the top
  // 85 %, without the floor rails), at 320 px. The changed columns are the printer and the
  // part not printed yet, right of it, so their left edge is the printer's mast; the points
  // are that edge plus 0.015 (the print head is right of the mast). A phone shows about a
  // third of the width and follows these points (the author, 2026-10-22: "camera following
  // the printing machine"). From 0.8 the printer fades out, and the camera turns to the
  // middle of the print (0.22 … 0.78 of the width) before the call to action (0.88).
  focus: [0.243, 0.312, 0.396, 0.49, 0.587, 0.674, 0.762, 0.853, 0.887, 0.51, 0.51],
  // Nothing is always hidden: the video has no watermark, and the armchair and the plant
  // stand on the floor. Where the stage is wider than the frame's proportions (a 16:9
  // desktop), the top and the bottom tenth are cut evenly.
  cropBottom: 0,
}

// The home hero's time-lapse (README item 1, proposal P2), scrubbed by the scroll
// (PrintOnScroll). The author's video of 2026-11-01 (SWP_WebVideo2.mp4, now
// Assets/Videos/hero.mp4): a white room; the printer waits at the left, prints a tree, a
// family, and a cracked-wall effect from left to right, the armchair and the plant appear,
// and the printer fades out. MOCK: it looks AI-generated, and the client has not approved it
// yet. The production build stops while this item is mock; the hero shows no "example"
// badge (the author's choice, 2026-10-22). Set `mock: false` once the client approves it.
//
// A new video is one command, `vp run frames "<path to the video>"`: it chooses the frames
// and measures the printer's track itself (CLAUDE.md, "Change the hero video").

import { heroFocus, heroFrames } from './images/frames.ts'
import type { HeroVideo } from './schema.ts'

export const heroVideo: HeroVideo = {
  id: 'hero-video',
  mock: true,
  frames: heroFrames,
  // Where the printer is (x) at progress 0, 0.1, … 1, measured by `vp run frames`: the edge
  // between the printed part and the part not printed yet, in the wall above the furniture.
  // A phone shows about a third of the width and follows these points (the author,
  // 2026-10-22: "camera following the printing machine"); once the printer has gone, they
  // turn to the middle of the picture, before the call to action (0.88).
  focus: heroFocus,
  // Nothing is always hidden: the video has no watermark, and the armchair and the plant
  // stand on the floor. Where the stage is wider than the frame's proportions (a 16:9
  // desktop), the top and the bottom tenth are cut evenly.
  cropBottom: 0,
}

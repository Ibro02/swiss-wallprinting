// The home hero's time-lapse (README item 1, proposal P2), scrubbed by the scroll
// (PrintOnScroll). MOCK: an AI-generated video (Dreamina AI; its watermark is in the
// bottom-right corner of every frame), not the client's own footage. The production build
// stops while this item is mock; the hero shows no "example" badge (the author's choice,
// 2026-10-22). For a new video: replace
// src/assets/videos/landingPageVideo.mp4, run `vp run frames`, measure the printer's track
// again (`focus`), check `signature` against the last frame, and set `mock: false` once the
// client approves it.

import { heroFrames } from './images/frames.ts'
import type { HeroVideo } from './schema.ts'

export const heroVideo: HeroVideo = {
  id: 'hero-video',
  mock: true,
  frames: heroFrames,
  // The printer's x at every 12th frame (progress 0, 0.1, … 1), measured from its violet UV
  // lights (the median x of the violet pixels in the top half of each desktop frame). It is
  // slow at the start and the end. A phone shows about a quarter of the width and follows
  // these points (the author, 2026-10-22: "camera following the printing machine"); the
  // last one turns from the printer behind the pillar (0.85) to the signature (0.8).
  focus: [0.205, 0.256, 0.333, 0.416, 0.499, 0.583, 0.663, 0.737, 0.811, 0.821, 0.8],
  // The bottom fifth is floor (and the generator's watermark): the wall is what counts, so
  // a wide screen shows the whole width of the room instead.
  cropBottom: 0.2,
  // The mural's lower-right corner is behind the plant and the desks: the signature goes
  // in the light foliage right of the village, just above the monitors.
  signature: { x: 0.77, y: 0.47, width: 0.065 },
}

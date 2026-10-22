// The home hero's time-lapse (README item 1, proposal P2), scrubbed by the scroll
// (PrintOnScroll). MOCK: an AI-generated video (Dreamina AI; its watermark is in the
// bottom-right corner of every frame), not the client's own footage. The production build
// stops while this item is mock; the hero shows no "example" badge (the author's choice,
// 2026-10-22). For a new video: replace
// src/assets/videos/landingPageVideo.mp4, run `vp run frames`, check `focus` and
// `signature` against the first and last frames, and set `mock: false` once the client
// approves it.

import { heroFrames } from './images/frames.ts'
import type { HeroVideo } from './schema.ts'

export const heroVideo: HeroVideo = {
  id: 'hero-video',
  mock: true,
  frames: heroFrames,
  // The printer moves from x = 0.2 to 0.85 of the frame, nearly at a steady speed. Narrow
  // screens follow it, but end on the village and the signature (0.75) rather than on the
  // printer behind the pillar: a phone shows about a quarter of the width, so the printer
  // stays in view the whole way.
  focus: [0.2, 0.75],
  // The bottom fifth is floor (and the generator's watermark): the wall is what counts, so
  // a wide screen shows the whole width of the room instead.
  cropBottom: 0.2,
  // The mural's lower-right corner is behind the plant and the desks: the signature goes
  // in the light foliage right of the village, just above the monitors.
  signature: { x: 0.77, y: 0.47, width: 0.065 },
}

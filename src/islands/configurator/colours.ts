// The colours that the poster (Stage.tsx) and the 3D view (Scene.tsx) share, so the 3D
// fades in over the poster without a change of colour (`no-ui-flash`). No three.js here:
// Stage.tsx imports this file into the page bundle.

export const STAGE_COLOURS = {
  /** Indoors: the space around the room. */
  room: '#e9e5de',
  /** Outdoors: the sky behind the wall. */
  sky: '#dce8f0',
  /** Outdoors: the paving in front of the wall. */
  ground: '#b3ada3',
  /** Outdoors: the sides and top of the freestanding wall. */
  wall: '#e6e0d6',
} as const

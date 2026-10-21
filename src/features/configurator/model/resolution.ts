// Print quality warning for uploads (proposal P5): pixels per centimetre at the chosen
// size. Under the threshold (from the client, Q11) the panel says that the image may look
// soft, and gives the largest size that stays sharp.

export interface ResolutionCheck {
  /** Pixels per centimetre of print, on the weaker side. */
  pxPerCm: number
  sharp: boolean
  /** The largest printed size with enough pixels, metres (the current size when sharp). */
  maxSharp: { width: number; height: number }
}

export function printResolution(
  /** Pixels of the original file. */
  image: { width: number; height: number },
  /** The area that gets ink, metres. */
  printed: { width: number; height: number },
  /** The part of the image that is used (texture repeat from `imageCrop`). */
  repeat: readonly [x: number, y: number],
  minPxPerCm: number,
): ResolutionCheck {
  const pxPerCm = Math.min(
    (image.width * repeat[0]) / (printed.width * 100),
    (image.height * repeat[1]) / (printed.height * 100),
  )
  const factor = Math.min(1, pxPerCm / minPxPerCm)
  return {
    pxPerCm,
    sharp: pxPerCm >= minPxPerCm,
    maxSharp: {
      width: Math.floor(printed.width * factor * 100) / 100,
      height: Math.floor(printed.height * factor * 100) / 100,
    },
  }
}

// The before/after split on a services card (README: left of the pointer is the blank
// wall, right is the print). The value is the "before" part in percent of the width
// from the left: 0 shows only the print, the state when nobody points at the card.
// Same idea as `splitAt` / `splitByKey` in the author's Steakwise project.

export const SPLIT_NONE = 0
export const SPLIT_STEP = 10
export const SPLIT_PAGE = 25

const clamp = (value: number) => Math.min(100, Math.max(0, value))

/** The split under a pointer at `clientX` over a box. */
export function splitAt(clientX: number, left: number, width: number): number {
  return width > 0 ? clamp(((clientX - left) / width) * 100) : SPLIT_NONE
}

/**
 * The split after a key press, or undefined for a key the slider does not use.
 * Standard slider keys: right and up show more of the blank wall.
 */
export function splitByKey(split: number, key: string): number | undefined {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return clamp(split + SPLIT_STEP)
    case 'ArrowLeft':
    case 'ArrowDown':
      return clamp(split - SPLIT_STEP)
    case 'PageUp':
      return clamp(split + SPLIT_PAGE)
    case 'PageDown':
      return clamp(split - SPLIT_PAGE)
    case 'Home':
      return 0
    case 'End':
      return 100
    case 'Escape':
      return SPLIT_NONE
    default:
      return undefined
  }
}

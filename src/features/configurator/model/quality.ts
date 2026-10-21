// Which quality tier a device gets (Development Plan 2.5). `low` loads the smaller
// models and textures; `high` is for desktops.

import type { QualityTier } from './budget.ts'

/** Below this viewport width the device is a phone (the Tailwind `md` breakpoint). */
export const PHONE_MAX_WIDTH = 767

/** Longest side of an uploaded image after scaling, per tier (section 2.5). */
export const UPLOAD_MAX_SIDE: Record<QualityTier, number> = { high: 4096, low: 2048 }

export function pickQualityTier(device: {
  viewportWidth: number
  /** navigator.hardwareConcurrency; undefined when the browser does not tell. */
  cores?: number
}): QualityTier {
  if (device.viewportWidth <= PHONE_MAX_WIDTH) return 'low'
  if (device.cores !== undefined && device.cores <= 4) return 'low'
  return 'high'
}

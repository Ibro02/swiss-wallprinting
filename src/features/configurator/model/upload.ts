// Checks for an image that the visitor uploads (Development Plan 4.7, control 3). The image
// never leaves the browser: it is decoded and scaled down on the device (section 2.5).

/** Formats that every current browser can decode with createImageBitmap. */
export const UPLOAD_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** Larger files are slow to decode on phones. */
export const MAX_UPLOAD_BYTES = 30 * 1024 * 1024

export type UploadError = 'type' | 'tooLarge' | 'decode'
export const UPLOAD_ERRORS: readonly UploadError[] = ['type', 'tooLarge', 'decode']

/** The checks that need only the file itself, before it is decoded. */
export function checkUploadFile(file: { type: string; size: number }): UploadError | null {
  if (!(UPLOAD_TYPES as readonly string[]).includes(file.type)) return 'type'
  if (file.size > MAX_UPLOAD_BYTES) return 'tooLarge'
  return null
}

/** The size to scale an image to, so that its longest side is at most `maxSide`. */
export function scaledSize(
  size: { width: number; height: number },
  maxSide: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxSide / Math.max(size.width, size.height))
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  }
}

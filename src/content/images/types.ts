/** An image in public/ with its size and blur preview, for next/image. */
export interface ImageAsset {
  /** Path under public/, starting with "/". */
  src: string
  width: number
  height: number
  /** Tiny base64 WebP for `placeholder="blur"`. */
  blurDataURL: string
}

/** A video as numbered still frames in public/ (`vp run frames`), for PrintOnScroll. */
export interface FrameSet {
  /** Path of each frame, with `%04d` for the zero-padded frame index (as in ffmpeg). */
  pattern: string
  /**
   * The same `%04d` path of a copy in an older format (WebP), for the poster's <picture> in
   * browsers without the frames' format (AVIF). Only the first and the last frame have one.
   */
  fallback?: string
  count: number
  width: number
  height: number
}

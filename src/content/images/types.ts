/** An image in public/ with its size and blur preview, for next/image. */
export interface ImageAsset {
  /** Path under public/, starting with "/". */
  src: string
  width: number
  height: number
  /** Tiny base64 WebP for `placeholder="blur"`. */
  blurDataURL: string
}

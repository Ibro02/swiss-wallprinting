// A minimal .ico writer: each image is stored as PNG data (valid since Windows Vista,
// and in every current browser). Used for src/app/favicon.ico.

export interface IcoImage {
  /** Width and height in pixels, 1–256. */
  size: number
  png: Uint8Array
}

const HEADER = 6
const ENTRY = 16

export function icoFromPngs(images: readonly IcoImage[]): Uint8Array {
  const total = HEADER + ENTRY * images.length + images.reduce((sum, i) => sum + i.png.length, 0)
  const out = new Uint8Array(total)
  const view = new DataView(out.buffer)

  view.setUint16(2, 1, true) // type: icon
  view.setUint16(4, images.length, true)

  let offset = HEADER + ENTRY * images.length
  images.forEach((image, index) => {
    if (image.size < 1 || image.size > 256)
      throw new RangeError(`Icon size ${image.size} is not 1–256`)
    const entry = HEADER + ENTRY * index
    view.setUint8(entry, image.size % 256) // 0 means 256
    view.setUint8(entry + 1, image.size % 256)
    view.setUint16(entry + 4, 1, true) // colour planes
    view.setUint16(entry + 6, 32, true) // bits per pixel
    view.setUint32(entry + 8, image.png.length, true)
    view.setUint32(entry + 12, offset, true)
    out.set(image.png, offset)
    offset += image.png.length
  })
  return out
}

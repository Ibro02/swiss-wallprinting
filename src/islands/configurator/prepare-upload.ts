// Reads an uploaded image in the browser and scales it down (Development Plan 2.5).
// The file is not sent anywhere: the print texture is made from a local canvas.

import { pickQualityTier, UPLOAD_MAX_SIDE } from '@/features/configurator/model/quality.ts'
import {
  checkUploadFile,
  scaledSize,
  type UploadError,
} from '@/features/configurator/model/upload.ts'
import type { PrintImage } from '@/features/configurator/store.ts'

export type PreparedUpload =
  | { image: PrintImage; error?: never }
  | { error: UploadError; image?: never }

export async function prepareUpload(file: File): Promise<PreparedUpload> {
  const problem = checkUploadFile(file)
  if (problem) return { error: problem }

  let bitmap: ImageBitmap
  try {
    // Turns the image as its EXIF data says (photos from phones).
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return { error: 'decode' }
  }

  const tier = pickQualityTier({
    viewportWidth: window.innerWidth,
    cores: navigator.hardwareConcurrency,
  })
  const original = { width: bitmap.width, height: bitmap.height }
  const size = scaledSize(original, UPLOAD_MAX_SIDE[tier])
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    return { error: 'decode' }
  }
  context.imageSmoothingQuality = 'high'
  context.drawImage(bitmap, 0, 0, size.width, size.height)
  bitmap.close()

  // A local URL for the flat poster view (phones show it until the 3D view opens).
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.85),
  )
  if (!blob) return { error: 'decode' }

  return {
    image: {
      kind: 'upload',
      name: file.name,
      canvas,
      src: URL.createObjectURL(blob),
      aspect: size.width / size.height,
      px: original,
    },
  }
}

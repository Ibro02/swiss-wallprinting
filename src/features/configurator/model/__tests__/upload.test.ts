import { describe, expect, it } from 'vite-plus/test'
import { pickQualityTier } from '../quality.ts'
import { checkUploadFile, MAX_UPLOAD_BYTES, scaledSize } from '../upload.ts'

describe('checkUploadFile', () => {
  it('accepts JPG, PNG, and WebP up to the size limit', () => {
    expect(checkUploadFile({ type: 'image/jpeg', size: 1000 })).toBeNull()
    expect(checkUploadFile({ type: 'image/png', size: MAX_UPLOAD_BYTES })).toBeNull()
    expect(checkUploadFile({ type: 'image/webp', size: 1 })).toBeNull()
  })

  it('refuses other formats (SVG, PDF, HEIC) and an empty type', () => {
    expect(checkUploadFile({ type: 'image/svg+xml', size: 1000 })).toBe('type')
    expect(checkUploadFile({ type: 'application/pdf', size: 1000 })).toBe('type')
    expect(checkUploadFile({ type: 'image/heic', size: 1000 })).toBe('type')
    expect(checkUploadFile({ type: '', size: 1000 })).toBe('type')
  })

  it('refuses a file over the size limit', () => {
    expect(checkUploadFile({ type: 'image/jpeg', size: MAX_UPLOAD_BYTES + 1 })).toBe('tooLarge')
  })
})

describe('scaledSize', () => {
  it('scales the longest side down to the limit and keeps the proportions', () => {
    expect(scaledSize({ width: 8000, height: 4000 }, 4096)).toEqual({ width: 4096, height: 2048 })
    expect(scaledSize({ width: 3000, height: 6000 }, 2048)).toEqual({ width: 1024, height: 2048 })
  })

  it('does not make a small image larger', () => {
    expect(scaledSize({ width: 800, height: 600 }, 4096)).toEqual({ width: 800, height: 600 })
  })
})

describe('pickQualityTier', () => {
  it('gives phones and devices with few cores the low tier', () => {
    expect(pickQualityTier({ viewportWidth: 390, cores: 8 })).toBe('low')
    expect(pickQualityTier({ viewportWidth: 1440, cores: 4 })).toBe('low')
  })

  it('gives desktops the high tier, also when the browser hides the core count', () => {
    expect(pickQualityTier({ viewportWidth: 1440, cores: 8 })).toBe('high')
    expect(pickQualityTier({ viewportWidth: 1440 })).toBe('high')
  })
})

import { describe, expect, it } from 'vite-plus/test'
import { icoFromPngs } from '../lib/ico.ts'

const png = (length: number, fill: number) => new Uint8Array(length).fill(fill)

describe('icoFromPngs', () => {
  const ico = icoFromPngs([
    { size: 16, png: png(10, 1) },
    { size: 256, png: png(20, 2) },
  ])
  const view = new DataView(ico.buffer)

  it('writes an icon header with the image count', () => {
    expect(view.getUint16(0, true)).toBe(0)
    expect(view.getUint16(2, true)).toBe(1)
    expect(view.getUint16(4, true)).toBe(2)
  })

  it('writes each size, with 256 stored as 0', () => {
    expect(view.getUint8(6)).toBe(16)
    expect(view.getUint8(6 + 16)).toBe(0)
  })

  it('points each entry at its PNG data', () => {
    const firstOffset = view.getUint32(6 + 12, true)
    const secondOffset = view.getUint32(6 + 16 + 12, true)
    expect(firstOffset).toBe(6 + 2 * 16)
    expect(ico[firstOffset]).toBe(1)
    expect(view.getUint32(6 + 16 + 8, true)).toBe(20)
    expect(ico[secondOffset]).toBe(2)
    expect(ico.length).toBe(6 + 2 * 16 + 30)
  })

  it('refuses a size that an icon cannot store', () => {
    expect(() => icoFromPngs([{ size: 512, png: png(1, 0) }])).toThrow('512')
  })
})

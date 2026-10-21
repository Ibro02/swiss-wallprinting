import { describe, expect, it } from 'vite-plus/test'
import { SPLIT_NONE, splitAt, splitByKey } from '../split.ts'

describe('splitAt', () => {
  it('gives the pointer position in percent of the box', () => {
    expect(splitAt(150, 100, 200)).toBe(25)
    expect(splitAt(300, 100, 200)).toBe(100)
  })

  it('stays inside 0 to 100 when the pointer is outside the box', () => {
    expect(splitAt(50, 100, 200)).toBe(0)
    expect(splitAt(400, 100, 200)).toBe(100)
  })

  it('shows only the print for a box without width', () => {
    expect(splitAt(150, 100, 0)).toBe(SPLIT_NONE)
  })
})

describe('splitByKey', () => {
  it('moves by a step with the arrow keys, more blank wall to the right and up', () => {
    expect(splitByKey(50, 'ArrowRight')).toBe(60)
    expect(splitByKey(50, 'ArrowUp')).toBe(60)
    expect(splitByKey(50, 'ArrowLeft')).toBe(40)
    expect(splitByKey(50, 'ArrowDown')).toBe(40)
  })

  it('moves by a page with Page Up and Page Down, inside the limits', () => {
    expect(splitByKey(90, 'PageUp')).toBe(100)
    expect(splitByKey(10, 'PageDown')).toBe(0)
  })

  it('jumps to the ends with Home and End, and back to the print with Escape', () => {
    expect(splitByKey(50, 'Home')).toBe(0)
    expect(splitByKey(50, 'End')).toBe(100)
    expect(splitByKey(70, 'Escape')).toBe(SPLIT_NONE)
  })

  it('ignores other keys', () => {
    expect(splitByKey(50, 'Enter')).toBeUndefined()
  })
})

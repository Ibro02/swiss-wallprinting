import { describe, expect, it } from 'vite-plus/test'
import { createRateLimiter } from '../rate-limit.ts'

describe('createRateLimiter', () => {
  it('allows the limit per key in the window, then blocks, then allows again', () => {
    const allow = createRateLimiter({ perKey: 2, total: 10, windowMs: 1000 })
    expect(allow('1.2.3.4', 0)).toBe(true)
    expect(allow('1.2.3.4', 100)).toBe(true)
    expect(allow('1.2.3.4', 200)).toBe(false)
    expect(allow('5.6.7.8', 200)).toBe(true)
    expect(allow('1.2.3.4', 1100)).toBe(true)
  })

  it('stops a script that sends each request with another key', () => {
    const allow = createRateLimiter({ perKey: 5, total: 3, windowMs: 1000 })
    const results = ['a', 'b', 'c', 'd', 'e'].map((key, index) => allow(key, index))
    expect(results).toEqual([true, true, true, false, false])
    // After the window, the forms work again.
    expect(allow('f', 1003)).toBe(true)
  })

  it('does not count a blocked request', () => {
    const allow = createRateLimiter({ perKey: 1, total: 10, windowMs: 1000 })
    expect(allow('a', 0)).toBe(true)
    for (let time = 1; time < 1000; time += 100) expect(allow('a', time)).toBe(false)
    expect(allow('a', 1000)).toBe(true)
  })
})

// The send limit of the forms (question and quote). Memory only, so per server instance:
// enough against a person who clicks too often and against one script, not against a
// botnet (then add a challenge such as Turnstile).

export interface RateLimit {
  /** Requests per key (the visitor's IP address, src/lib/request.ts) in the window. */
  perKey: number
  /** Requests of all keys together in the window: the ceiling when the keys change. */
  total: number
  windowMs: number
}

/**
 * Sliding-window limit. `allow(key, now)` is true when this request may go through, and
 * counts it. The memory stays small: a key stays only while it has a request in the window,
 * and at most `total` requests are in the window.
 */
export function createRateLimiter({ perKey, total, windowMs }: RateLimit) {
  const hits = new Map<string, number[]>()
  let all: number[] = []

  return function allow(key: string, now: number): boolean {
    const inWindow = (time: number) => now - time < windowMs
    all = all.filter(inWindow)
    const recent = (hits.get(key) ?? []).filter(inWindow)

    if (recent.length >= perKey || all.length >= total) {
      if (recent.length > 0) hits.set(key, recent)
      else hits.delete(key)
      return false
    }

    if (hits.size >= total) {
      for (const [other, times] of hits) if (!times.some(inWindow)) hits.delete(other)
    }
    recent.push(now)
    all.push(now)
    hits.set(key, recent)
    return true
  }
}

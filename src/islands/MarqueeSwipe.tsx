'use client'

import { useEffect } from 'react'

// The reviews band on touch screens (Testimonials.tsx; the author, 2026-10-24: the CSS band
// was laggy on phones). It keeps running, and the visitor can take it: a finger on the band
// holds it still, a drag moves it, a swipe throws it, and on release it glides back into its
// slow run. The stop control (the `.marquee-pause` checkbox) brings it to rest. The CSS
// animation runs until this script takes over, from the same place, so nothing jumps.
//
// Screens with a mouse keep the CSS band (it pauses under the mouse); with reduced motion the
// band stands still and scrolls by hand, so this does nothing. A frame writes one transform
// to the strip, never React state; the loop stops while the band is out of view.

/** How fast a swipe fades into the band's own run: the time constant, in ms. */
const GLIDE_MS = 450
/** A release this long after the last move is the end of a hold, not a swipe. */
const STILL_MS = 80
/** The fastest swipe, in px per ms. */
const MAX_SPEED = 4
/** Below this difference (px per ms) the glide has arrived. */
const SETTLED = 0.002

interface Props {
  /** The id of the band (the scrolling region around the `.marquee` strip). */
  band: string
  /** Seconds for the strip to move by one list: the CSS animation's duration. */
  loopSeconds: number
}

export function MarqueeSwipe({ band: bandId, loopSeconds }: Props) {
  useEffect(() => {
    const band = document.getElementById(bandId)
    const strip = band?.querySelector<HTMLElement>('.marquee')
    const list = strip?.firstElementChild
    if (!band || !strip || !(list instanceof HTMLElement)) return
    if (!matchMedia('(pointer: coarse)').matches) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const pause = band.parentElement?.querySelector<HTMLInputElement>('.marquee-pause')

    // Where the CSS animation is now; `data-swipe` turns it off (globals.css).
    let x = new DOMMatrixReadOnly(getComputedStyle(strip).transform).m41
    band.toggleAttribute('data-swipe', true)
    let width = list.offsetWidth
    /** The band's own run, in px per ms (negative: to the left). */
    const run = () => (pause?.checked ? 0 : -width / (loopSeconds * 1000))
    let velocity = run()
    let finger: number | null = null
    let fingerX = 0
    let fingerTime = 0
    let fingerVelocity = 0
    let frame = 0
    let last = 0
    let drawn = Number.NaN

    // The strip is the list twice: moving by one list width looks the same, so the
    // offset stays within one list, whichever way the visitor throws it.
    const draw = () => {
      if (!width) return
      x = ((x % width) - width) % width
      if (x === drawn) return
      strip.style.transform = `translate3d(${x}px, 0, 0)`
      drawn = x
    }

    const tick = (now: number) => {
      const elapsed = last ? Math.min(now - last, 50) : 0
      last = now
      if (finger === null) {
        const target = run()
        velocity = target + (velocity - target) * Math.exp(-elapsed / GLIDE_MS)
        if (Math.abs(velocity - target) < SETTLED) velocity = target
        x += velocity * elapsed
      }
      draw()
      frame = requestAnimationFrame(tick)
    }
    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      last = 0
    }

    const down = (event: PointerEvent) => {
      if (!event.isPrimary) return
      // The moves keep coming to the band when the finger (or a pen) leaves it.
      band.setPointerCapture(event.pointerId)
      finger = event.pointerId
      fingerX = event.clientX
      fingerTime = event.timeStamp
      fingerVelocity = 0
      velocity = 0
    }
    const move = (event: PointerEvent) => {
      if (event.pointerId !== finger) return
      const dx = event.clientX - fingerX
      const dt = event.timeStamp - fingerTime
      x += dx
      if (dt > 0) fingerVelocity = 0.8 * (dx / dt) + 0.2 * fingerVelocity
      fingerX = event.clientX
      fingerTime = event.timeStamp
    }
    // A vertical swipe is the page's scroll: the browser cancels the pointer (`touch-action:
    // pan-y` on the band), and the band runs on from where it stood.
    const up = (event: PointerEvent) => {
      if (event.pointerId !== finger) return
      finger = null
      const thrown = event.type === 'pointerup' && event.timeStamp - fingerTime < STILL_MS
      velocity = thrown ? Math.max(-MAX_SPEED, Math.min(MAX_SPEED, fingerVelocity)) : 0
    }

    band.addEventListener('pointerdown', down)
    band.addEventListener('pointermove', move)
    band.addEventListener('pointerup', up)
    band.addEventListener('pointercancel', up)
    const sizes = new ResizeObserver(() => {
      width = list.offsetWidth
    })
    sizes.observe(list)
    const view = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? start() : stop()))
    view.observe(band)
    draw()

    return () => {
      stop()
      view.disconnect()
      sizes.disconnect()
      band.removeEventListener('pointerdown', down)
      band.removeEventListener('pointermove', move)
      band.removeEventListener('pointerup', up)
      band.removeEventListener('pointercancel', up)
      band.removeAttribute('data-swipe')
      strip.style.removeProperty('transform')
    }
  }, [bandId, loopSeconds])

  return null
}

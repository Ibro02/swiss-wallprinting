'use client'

import { type PointerEvent, type ReactNode, useRef } from 'react'

// A card with a light that follows the mouse, and an optional 3D tilt (home page: the steps
// of the process, lime on the dark configurator step and magenta on the others; styles:
// globals.css, .glow-card, one class per tone). A custom take on Framer's "Sleek 3D Tilt
// Card" (the same perspective tilt of up to 8° and the same spotlight), without its
// `framer` and `framer-motion` imports (about 100 KB) and without a React render per mouse
// move: the handlers write two transforms straight to the elements, at most once per frame.
//
// Mouse only: touch and pen leave the card at rest. Reduced motion: the light, no tilt.
// The server and the client render the same markup, and the light is hidden until the
// mouse is over the card, so nothing changes after hydration (no-ui-flash).

/** Tilt at the card's edges, in degrees. */
const MAX_TILT = 8

interface Props {
  children: ReactNode
  /** The card itself: background, radius, padding, layout. */
  className?: string
  /** The light's colour: lime (for dark cards) or magenta (for mist cards). */
  tone?: 'lime' | 'magenta'
  tilt?: boolean
  /** A band of light that sweeps across the card as it scrolls into view. */
  shine?: boolean
}

export function GlowCard({
  children,
  className = '',
  tone = 'lime',
  tilt = false,
  shine = false,
}: Props) {
  const areaRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLSpanElement>(null)
  const frameRef = useRef(0)
  const tiltRef = useRef(false)

  const follow = (clientX: number, clientY: number) => {
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      const area = areaRef.current
      const card = cardRef.current
      const glow = glowRef.current
      if (!area || !card || !glow) return
      // The untilted area, not the card: its box does not move with the tilt.
      const box = area.getBoundingClientRect()
      const x = clientX - box.left
      const y = clientY - box.top
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (!tiltRef.current) return
      const rotateX = (0.5 - y / box.height) * 2 * MAX_TILT
      const rotateY = (x / box.width - 0.5) * 2 * MAX_TILT
      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
    })
  }

  const onPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    tiltRef.current = tilt && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    cardRef.current?.setAttribute('data-hover', '')
    follow(event.clientX, event.clientY)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') follow(event.clientX, event.clientY)
  }

  const onPointerLeave = () => {
    cancelAnimationFrame(frameRef.current)
    const card = cardRef.current
    if (!card) return
    card.removeAttribute('data-hover')
    // Eases back to flat (the longer transition without `data-hover`).
    card.style.transform = ''
  }

  return (
    <div
      ref={areaRef}
      className="h-full"
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div
        ref={cardRef}
        className={`glow-card ${tone === 'magenta' ? 'glow-card--magenta' : ''} relative isolate h-full ${className}`}
      >
        <span aria-hidden="true" className="glow-card__clip">
          <span ref={glowRef} className="glow-card__glow" />
          {shine && <span className="glow-card__shine" />}
        </span>
        {children}
      </div>
    </div>
  )
}

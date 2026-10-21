'use client'

import type { ReactNode } from 'react'

// Intent prefetch (proposal P11): when the mouse moves onto a "Try your wall" link, or the
// keyboard focus reaches it, the 3D code and the room model start to load, so the
// configurator opens without waiting. Not on touch: on a phone, the 3D code would run right
// when the visitor taps, and the page would answer later.

let started = false

function prefetchConfigurator() {
  if (started) return
  started = true
  // The Scene module preloads the room and props models when it runs (useGLTF.preload).
  void import('@/islands/configurator/Scene.tsx')
}

export function ConfiguratorIntent({ children }: { children: ReactNode }) {
  return (
    // A wrapper for the events of the link inside; it adds no box (display: contents).
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions
    <span
      className="contents"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') prefetchConfigurator()
      }}
      onFocus={prefetchConfigurator}
    >
      {children}
    </span>
  )
}

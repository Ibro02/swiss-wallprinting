'use client'

import { useEffect } from 'react'

// The page under an open sheet (a popover such as a project's whole story, `.story-sheet`)
// does not scroll (the author, 2026-10-24). Screens with a mouse lock it in CSS: the root
// does not scroll while a sheet is open (globals.css). On a touch screen `overflow: hidden`
// on the root can resize the viewport (the address bar shows) and move the page under the
// sheet, so here the layout stays as it is and a touch move is cancelled instead, unless it
// began on a sheet that scrolls (its `overscroll-behavior: contain` keeps the page still at
// its ends). The listener that can cancel a move is there only while a sheet is open: it
// makes the browser wait for the script before it scrolls.

export function ScrollLock({ sheet: selector }: { sheet: string }) {
  useEffect(() => {
    let onSheet = false
    const begin = (event: TouchEvent) => {
      const sheet = (event.target as Element).closest(selector)
      const touch = event.touches[0]
      if (!sheet || !touch) {
        onSheet = false
        return
      }
      // A touch on the backdrop can have the sheet as its target: the point decides.
      const box = sheet.getBoundingClientRect()
      onSheet =
        sheet.scrollHeight > sheet.clientHeight &&
        touch.clientY >= box.top &&
        touch.clientY <= box.bottom &&
        touch.clientX >= box.left &&
        touch.clientX <= box.right
    }
    const hold = (event: TouchEvent) => {
      if (!onSheet && event.cancelable) event.preventDefault()
    }
    const toggle = (event: Event) => {
      if (!(event.target instanceof Element) || !event.target.matches(selector)) return
      if ((event as ToggleEvent).newState === 'open') {
        document.addEventListener('touchstart', begin, { passive: true })
        document.addEventListener('touchmove', hold, { passive: false })
      } else {
        document.removeEventListener('touchstart', begin)
        document.removeEventListener('touchmove', hold)
      }
    }
    // `toggle` does not bubble: the capture phase sees it for every sheet.
    document.addEventListener('toggle', toggle, true)
    return () => {
      document.removeEventListener('toggle', toggle, true)
      document.removeEventListener('touchstart', begin)
      document.removeEventListener('touchmove', hold)
    }
  }, [selector])

  return null
}

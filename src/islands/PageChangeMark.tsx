'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect, useRef } from 'react'

// Marks the root with `data-page-change` from the first client-side page change on, so a
// later page fades in as a whole (1 s) instead of the `data-rise` entrance (globals.css; the
// author, 2026-11-01). The first page load keeps the entrance, and the mark never changes
// how that page looks. A layout effect runs after the new page is in the DOM but before the
// browser paints it, so its first frame is the fade.

export function PageChangeMark() {
  const pathname = usePathname()
  const first = useRef(pathname)
  useLayoutEffect(() => {
    if (pathname !== first.current) document.documentElement.dataset.pageChange = ''
  }, [pathname])
  return null
}

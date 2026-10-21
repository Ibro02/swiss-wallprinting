'use client'

import type { MouseEvent, ReactNode } from 'react'
import { useRef } from 'react'
import { CloseIcon, MenuIcon } from '@/components/icons.tsx'

// Full-screen menu for small screens. The HTML popover attribute opens and closes
// it (also before hydration, with Escape and light dismiss built in). JavaScript
// only closes it after a link click, because client-side navigation keeps the page.

interface MobileMenuProps {
  openLabel: string
  closeLabel: string
  children: ReactNode
}

const PANEL_ID = 'mobile-menu'

export function MobileMenu({ openLabel, closeLabel, children }: MobileMenuProps) {
  const panel = useRef<HTMLDivElement>(null)

  const closeAfterLinkClick = (event: MouseEvent) => {
    const element = panel.current
    if (element?.matches(':popover-open') && (event.target as HTMLElement).closest('a')) {
      element.hidePopover()
    }
  }

  return (
    <>
      <button
        type="button"
        popoverTarget={PANEL_ID}
        aria-label={openLabel}
        className="grid size-10 place-items-center rounded-full text-plaster hover:bg-white/10"
      >
        <MenuIcon />
      </button>
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- delegation for link clicks; links handle the keyboard themselves */}
      <div
        id={PANEL_ID}
        ref={panel}
        popover="auto"
        onClick={closeAfterLinkClick}
        className="on-dark fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-graphite p-0 text-plaster opacity-0 transition-[opacity,display,overlay] transition-discrete duration-200 open:opacity-100 motion-reduce:transition-none starting:open:opacity-0"
      >
        <div className="flex justify-end px-4 pt-6 sm:px-6">
          <button
            type="button"
            popoverTarget={PANEL_ID}
            popoverTargetAction="hide"
            aria-label={closeLabel}
            className="grid size-10 place-items-center rounded-full ring-1 ring-white/15 hover:bg-white/10"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </>
  )
}

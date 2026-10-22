'use client'

import type { MouseEvent, ReactNode } from 'react'
import { useRef } from 'react'
import { CloseIcon, MenuIcon } from '@/components/icons.tsx'

// Full-screen white sheet for small screens. The HTML popover attribute opens and closes
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
        className="grid size-10 place-items-center rounded-xl text-graphite transition-[background-color,transform] duration-160 ease-out hover:bg-graphite/6 active:scale-[0.97]"
      >
        <MenuIcon />
      </button>
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- delegation for link clicks; links handle the keyboard themselves */}
      <div
        id={PANEL_ID}
        ref={panel}
        popover="auto"
        onClick={closeAfterLinkClick}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none translate-y-2 overflow-y-auto bg-white p-0 text-graphite opacity-0 transition-[opacity,transform,display,overlay] transition-discrete duration-200 ease-out open:translate-y-0 open:opacity-100 open:duration-300 motion-reduce:translate-y-0 motion-reduce:transition-none starting:open:translate-y-2 starting:open:opacity-0"
      >
        <div className="flex justify-end px-7 pt-9 sm:px-10 sm:pt-12">
          <button
            type="button"
            popoverTarget={PANEL_ID}
            popoverTargetAction="hide"
            aria-label={closeLabel}
            className="grid size-10 place-items-center rounded-xl ring-1 ring-graphite/12 transition-[background-color,transform] duration-160 ease-out hover:bg-graphite/6 active:scale-[0.97]"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </>
  )
}

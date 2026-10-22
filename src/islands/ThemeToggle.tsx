'use client'

import { useSyncExternalStore } from 'react'
import { MoonIcon, SunIcon } from '@/components/icons.tsx'
import { THEME_STORAGE_KEY } from '@/lib/theme.ts'

// The dark theme switch (globals.css, "Dark theme"): an icon button in the header pill on
// wide screens, a labelled switch row in the phone menu. The theme follows the device until
// the visitor chooses; the choice is saved in localStorage, and THEME_SCRIPT (layout.tsx)
// applies it before the first paint.
//
// No flash: the server cannot know the theme, so what you see (the icon, the knob) comes from
// CSS (`dark:`), right in the first frame. Only `aria-checked`, which is not visible, waits for
// the browser: it is absent in the server HTML and set after hydration.

const DARK_QUERY = '(prefers-color-scheme: dark)'

function isDark() {
  const chosen = document.documentElement.dataset.theme
  return chosen ? chosen === 'dark' : window.matchMedia(DARK_QUERY).matches
}

/** Both switches (header and menu) follow data-theme and the device setting. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributeFilter: ['data-theme'] })
  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener('change', onChange)
  return () => {
    observer.disconnect()
    media.removeEventListener('change', onChange)
  }
}

function toggleTheme() {
  const next = isDark() ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next)
  } catch {
    // Storage blocked (a private window): the choice lasts until the page is left.
  }
}

export function ThemeToggle({ label, variant }: { label: string; variant: 'icon' | 'row' }) {
  // null on the server and during hydration, so the first render matches the HTML.
  const dark = useSyncExternalStore(subscribe, isDark, () => null)

  if (variant === 'icon') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={dark ?? undefined}
        aria-label={label}
        title={label}
        onClick={toggleTheme}
        className="grid size-10 shrink-0 place-items-center rounded-xl text-ink/75 transition-[background-color,color,transform] duration-150 ease-out hover:bg-ink/6 hover:text-ink active:scale-[0.97] motion-reduce:active:scale-100"
      >
        {/* The icon of the theme it switches to. */}
        <MoonIcon className="size-5 dark:hidden" />
        <SunIcon className="hidden size-5 dark:block" />
      </button>
    )
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark ?? undefined}
      onClick={toggleTheme}
      className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-medium"
    >
      <span className="inline-flex items-center gap-3">
        <MoonIcon className="size-5 text-mute" />
        {label}
      </span>
      {/* The knob's side comes from CSS, so it is right before the switch hydrates. */}
      <span
        aria-hidden="true"
        className="relative h-7 w-12 shrink-0 rounded-full bg-plaster-200 transition-colors duration-200 ease-out dark:bg-lime"
      >
        <span className="absolute top-1 left-1 size-5 rounded-full bg-paper shadow-sm transition-transform duration-200 ease-out dark:translate-x-5 dark:bg-graphite motion-reduce:transition-none" />
      </span>
    </button>
  )
}

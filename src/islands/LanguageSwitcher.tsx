'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { ChevronDownIcon, GlobeIcon } from '@/components/icons.tsx'
import { LOCALE_NAMES } from '@/i18n/locale-names.ts'
import { Link, usePathname } from '@/i18n/navigation.ts'
import { routing } from '@/i18n/routing.ts'

// Links to the same page in each language. Plain links, so they work before
// hydration and search engines can follow them. `menu` is a disclosure for the
// header; `list` shows all languages at once (mobile menu).

export function LanguageSwitcher({ variant = 'menu' }: { variant?: 'menu' | 'list' }) {
  const t = useTranslations('Nav')
  const locale = useLocale()
  const pathname = usePathname()
  const details = useRef<HTMLDetailsElement>(null)

  // Close the disclosure on a click outside or on Escape.
  useEffect(() => {
    if (variant !== 'menu') return
    const close = (event: Event) => {
      const element = details.current
      if (!element?.open) return
      if (event instanceof KeyboardEvent) {
        if (event.key !== 'Escape') return
        element.open = false
        element.querySelector('summary')?.focus()
      } else if (!element.contains(event.target as Node)) {
        element.open = false
      }
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [variant])

  const links = routing.locales.map((target) => (
    <li key={target}>
      <Link
        href={pathname}
        locale={target}
        hrefLang={target}
        lang={target}
        aria-current={target === locale ? 'true' : undefined}
        className={
          variant === 'menu'
            ? 'flex items-center justify-between gap-6 rounded-xl px-3 py-2 text-sm text-ink hover:bg-plaster aria-[current]:font-semibold'
            : 'inline-flex h-11 items-center rounded-xl px-4 text-sm font-medium ring-1 ring-ink/12 ring-inset aria-[current]:bg-lime aria-[current]:text-graphite aria-[current]:ring-lime'
        }
      >
        {LOCALE_NAMES[target]}
        {variant === 'menu' && <span className="text-xs uppercase opacity-60">{target}</span>}
      </Link>
    </li>
  ))

  if (variant === 'list') {
    return (
      <nav aria-label={t('language')}>
        <ul className="flex flex-wrap gap-2">{links}</ul>
      </nav>
    )
  }

  return (
    <details ref={details} className="group relative">
      <summary
        className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-ink/75 transition-colors duration-150 hover:bg-ink/6 hover:text-ink [&::-webkit-details-marker]:hidden"
        // The visible code ("IT") is part of the name, for voice control (WCAG 2.5.3).
        aria-label={`${locale.toUpperCase()}, ${t('language')}: ${LOCALE_NAMES[locale]}`}
      >
        <GlobeIcon className="size-4" />
        <span className="uppercase">{locale}</span>
        <ChevronDownIcon className="size-3.5 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <ul className="absolute right-0 mt-3 w-48 rounded-2xl bg-paper p-1.5 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.3)] ring-1 ring-ink/8">
        {links}
      </ul>
    </details>
  )
}

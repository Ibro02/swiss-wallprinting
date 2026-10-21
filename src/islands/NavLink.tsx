'use client'

import type { ComponentProps } from 'react'
import { Link, usePathname } from '@/i18n/navigation.ts'
import type { Pathname } from '@/i18n/routing.ts'

// A navigation link that marks the current page (aria-current="page"). Client-side
// only because the shared layout does not know the current path; static pages
// still prerender it with the right state, so nothing changes after hydration.

type NavLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & { href: Pathname }

export function NavLink({ href, ...props }: NavLinkProps) {
  const current = usePathname() === href
  return <Link {...props} href={href} aria-current={current ? 'page' : undefined} />
}

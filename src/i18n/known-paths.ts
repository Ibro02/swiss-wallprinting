import { hasLocale } from 'next-intl'
import { type Locale, routing } from './routing.ts'

// The proxy serves unknown localized URLs (/it/missing) with the prerendered
// 404 page. A notFound() call at request time cannot do this: Next.js then
// sends an empty error document and the 404 appears only after hydration.

/** Internal route of the prerendered localized 404 page. */
export const MISSING_PAGE = '/page-not-found'

function toRegExp(pattern: string): RegExp {
  const source = pattern
    .split('/')
    .map((segment) => {
      if (segment.startsWith('[...')) return '.+'
      if (segment.startsWith('[')) return '[^/]+'
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')
  return new RegExp(`^${source || '/'}$`)
}

// Internal paths count too: next-intl redirects /de/about to /de/ueber-uns.
const KNOWN = [
  ...new Set(
    Object.entries(routing.pathnames).flatMap(([internal, localized]) => [
      internal,
      ...(typeof localized === 'string' ? [localized] : Object.values(localized)),
    ]),
  ),
].map(toRegExp)

/**
 * The locale of a URL that has a locale prefix but no page, for example
 * `/it/missing` → `it`. Undefined for known pages and for URLs without a
 * locale prefix (next-intl adds the prefix first).
 */
export function missingPageLocale(pathname: string): Locale | undefined {
  const [, first, ...rest] = pathname.split('/')
  if (!hasLocale(routing.locales, first)) return undefined
  const path = `/${rest.join('/')}`.replace(/\/+$/, '') || '/'
  return KNOWN.some((pattern) => pattern.test(path)) ? undefined : first
}

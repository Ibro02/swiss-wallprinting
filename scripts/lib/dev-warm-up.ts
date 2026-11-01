// The dev warm-up (`scripts/dev.ts`): which pages to request, and on which port the dev
// server listens. Node runs it directly, so the imports are relative.

import { PAGES } from '../../src/i18n/pages.ts'
import { type Locale, routing } from '../../src/i18n/routing.ts'

/**
 * One address per page, in the nav order of `PAGES`: a page compiles once for every locale,
 * so one locale is enough. The localized paths, so the proxy does not redirect.
 */
export function warmUpPaths(locale: Locale = routing.defaultLocale): string[] {
  return Object.values(PAGES).map((page) => {
    const pathname = routing.pathnames[page]
    const localized = typeof pathname === 'string' ? pathname : pathname[locale]
    return localized === '/' ? `/${locale}` : `/${locale}${localized}`
  })
}

/** The port of `next dev`: `-p` or `--port` in its arguments, then `PORT`, then 3000. */
export function devPort(args: readonly string[], env: Record<string, string | undefined>): number {
  for (const [index, arg] of args.entries()) {
    const inline = /^(?:-p|--port)=(\d+)$/.exec(arg)
    if (inline) return Number(inline[1])
    if ((arg === '-p' || arg === '--port') && /^\d+$/.test(args[index + 1] ?? '')) {
      return Number(args[index + 1])
    }
  }
  return env.PORT && /^\d+$/.test(env.PORT) ? Number(env.PORT) : 3000
}

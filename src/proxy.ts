import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { MISSING_PAGE, missingPageLocale, renamedPrefixPath } from './i18n/known-paths.ts'
import { routing } from './i18n/routing.ts'

const handleI18n = createMiddleware(routing)

export default function proxy(request: NextRequest) {
  const renamed = renamedPrefixPath(request.nextUrl.pathname)
  if (renamed) {
    // An old address under the internal locale name (/bs/kontakt): permanently to /bhs/kontakt,
    // so there is one URL per page. next-intl's own rewrite to /bs/… is internal and never
    // comes back through here.
    const url = request.nextUrl.clone()
    url.pathname = renamed
    return NextResponse.redirect(url, 308)
  }
  const locale = missingPageLocale(request.nextUrl.pathname)
  if (locale) {
    // Prerendered 404 page with full HTML, served with the 404 status.
    return NextResponse.rewrite(new URL(`/${locale}${MISSING_PAGE}`, request.url), {
      status: 404,
    })
  }
  return handleI18n(request)
}

export const config = {
  matcher: [
    // All paths except API routes, Next.js internals, and files with a dot (favicon.ico, *.glb).
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Localized paths, also with a dot (/it/missing.html): the address prefixes of
    // languages.ts, and `bs` for the redirect of the old BHS addresses. Keep in step.
    '/(it|de|en|bhs|bs)/:path*',
  ],
}

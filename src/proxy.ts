import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { MISSING_PAGE, missingPageLocale } from './i18n/known-paths.ts'
import { routing } from './i18n/routing.ts'

const handleI18n = createMiddleware(routing)

export default function proxy(request: NextRequest) {
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
    // Localized paths, also with a dot (/it/missing.html). Keep in step with routing.locales.
    '/(it|de|en|bs)/:path*',
  ],
}

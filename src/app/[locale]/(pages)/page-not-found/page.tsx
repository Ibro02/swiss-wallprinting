import type { Metadata } from 'next'
import { NotFoundContent } from '@/components/NotFoundContent.tsx'

// Internal route: the proxy rewrites unknown localized URLs here with status 404
// (src/i18n/known-paths.ts). Prerendered, so the HTML has the full page.
export const metadata: Metadata = {
  robots: { index: false },
}

export default function PageNotFound() {
  return <NotFoundContent />
}

import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // The root layout is app/[locale]/layout.tsx, so unmatched URLs need
    // app/global-not-found.tsx (Next.js docs, file conventions: not-found).
    globalNotFound: true,
  },
}

export default withNextIntl(config)

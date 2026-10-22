import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const dev = process.env.NODE_ENV === 'development'

// Content Security Policy (security audit 2026-10-22). The pages are static, so they cannot
// carry a per-request nonce: scripts keep 'unsafe-inline' (the Next.js inline data and
// THEME_SCRIPT). The policy still allows no other origin, no plugins, no <base> change, no
// framing (clickjacking), and no form posts to another site.
const contentSecurityPolicy = [
  "default-src 'self'",
  // WebAssembly: the meshopt decoder of the 3D models. Development: React Refresh uses eval.
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  // data: the blur previews and the 3D screenshot; blob: an upload and the textures in a GLB.
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' data: blob:${dev ? ' ws:' : ''}`,
  "media-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  // For browsers without frame-ancestors.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Browsers use it only over HTTPS. No includeSubDomains: the domain's other hosts are not ours to decide.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
]

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
  headers: async () => [{ source: '/:path*', headers: securityHeaders }],
}

export default withNextIntl(config)

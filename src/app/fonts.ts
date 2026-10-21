import { Inter, Unbounded } from 'next/font/google'

// next/font downloads the files at build time and serves them from this site:
// no request to Google from the visitor's browser (privacy, Development Plan P10).
//
// `subsets` is what the page preloads. Only `latin` (it also has ä ö ü for German):
// the latin-ext files (č ć đ š ž for Bosnian) are still in the CSS with a
// unicode-range, so the browser loads them only on pages that use those letters.

/** Display: wide, geometric, rounded like the logo letters. Only the light weight is used. */
export const display = Unbounded({
  weight: '300',
  subsets: ['latin'],
  variable: '--font-unbounded',
  display: 'swap',
})

/** Body text (variable: all weights in one file). */
export const sans = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

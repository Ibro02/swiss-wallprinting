import { Instrument_Serif, Inter } from 'next/font/google'

// next/font downloads the files at build time and serves them from this site:
// no request to Google from the visitor's browser (privacy, Development Plan P10).
//
// `subsets` is what the page preloads. Only `latin` (it also has ä ö ü for German):
// the latin-ext files (č ć đ š ž for Bosnian) are still in the CSS with a
// unicode-range, so the browser loads them only on pages that use those letters.

/**
 * Everything: headlines (medium, tight), text, and the UI. Variable: all weights in one
 * file. The optical-size axis gives large headlines Inter's tighter display cut.
 */
export const sans = Inter({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-inter',
  display: 'swap',
})

/**
 * The accent: one or two words of a headline in italic (`<em>` in the messages, see
 * `Accent`). Only the italic is used; the regular style is not loaded.
 */
export const serif = Instrument_Serif({
  weight: '400',
  style: 'italic',
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

// The link preview image (Open Graph), made by `vp run images` from the client's real photo
// and the logo, without text, so it is right in every language.

export const OG_IMAGE = {
  src: '/og/swiss-wall-printing.jpg',
  width: 1200,
  height: 630,
} as const

/** og:locale per site locale (the language_TERRITORY forms that link previews know). */
export const OG_LOCALES = { it: 'it_IT', de: 'de_DE', en: 'en_GB', bs: 'bs_BA' } as const

import type { ReactNode } from 'react'

// The serif italic accent of a headline (Instrument Serif): one or two words, marked
// `<em>…</em>` in messages/*.json, so each language chooses its own words. In the logo's
// colours: magenta on light grounds, lime inside an `.on-dark` card or photo.

export function Accent({ children }: { children: ReactNode }) {
  return (
    <em className="font-serif font-normal tracking-normal text-magenta italic [.on-dark_&]:text-lime">
      {children}
    </em>
  )
}

/** The tag map for `t.rich`: `t.rich('title', accent)`. */
export const accent = { em: (chunks: ReactNode) => <Accent>{chunks}</Accent> }

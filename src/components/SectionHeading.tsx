import type { ReactNode } from 'react'

interface SectionHeadingProps {
  id?: string
  eyebrow: string
  /** Usually `t.rich('title', accent)`: the headline with its serif italic accent. */
  title: ReactNode
  children?: ReactNode
  tone?: 'light' | 'dark'
  className?: string
}

/** A small label pill with a dot in the logo's colours (magenta on light, lime on dark). */
export function SectionLabel({
  children,
  tone = 'light',
}: {
  children: ReactNode
  tone?: 'light' | 'dark'
}) {
  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset before:size-1.5 before:rounded-full ${tone === 'dark' ? 'text-white/75 ring-white/15 before:bg-lime' : 'text-graphite/70 ring-graphite/12 before:bg-magenta'}`}
    >
      {children}
    </p>
  )
}

/** Label, title (fluid size, medium, tight, with the serif accent), optional intro. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  children,
  tone = 'light',
  className,
}: SectionHeadingProps) {
  return (
    <div data-reveal className={`max-w-3xl ${className ?? ''}`}>
      <SectionLabel tone={tone}>{eyebrow}</SectionLabel>
      <h2
        id={id}
        className="mt-3 text-title font-medium text-balance hyphens-auto break-words sm:mt-4"
      >
        {title}
      </h2>
      {/* Phones: a little smaller and tighter, so a section's intro takes fewer lines. */}
      {children && (
        <div
          className={`mt-3 max-w-xl text-[0.9375rem] leading-normal sm:mt-4 sm:text-[1.0625rem] sm:leading-relaxed ${tone === 'dark' ? 'text-white/70' : 'text-mute'}`}
        >
          {children}
        </div>
      )}
    </div>
  )
}

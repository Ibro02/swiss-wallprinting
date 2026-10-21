import type { ReactNode } from 'react'
import { CmykDots } from '@/components/CmykDots.tsx'

interface SectionHeadingProps {
  id?: string
  eyebrow: string
  title: string
  children?: ReactNode
  tone?: 'light' | 'dark'
  className?: string
}

/** Eyebrow (with the CMYK dots), large light title, optional intro. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  children,
  tone = 'light',
  className,
}: SectionHeadingProps) {
  return (
    <div className={`max-w-3xl ${className ?? ''}`}>
      <p
        className={`flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase ${tone === 'dark' ? 'text-mute-dark' : 'text-mute'}`}
      >
        <CmykDots />
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-5 font-display text-3xl leading-[1.1] font-light tracking-tight text-balance hyphens-auto break-words sm:text-5xl"
      >
        {title}
      </h2>
      {children && (
        <div
          className={`mt-5 text-base leading-relaxed sm:text-lg ${tone === 'dark' ? 'text-plaster/75' : 'text-mute'}`}
        >
          {children}
        </div>
      )}
    </div>
  )
}

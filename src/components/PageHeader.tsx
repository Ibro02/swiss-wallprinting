import type { ReactNode } from 'react'
import { CmykDots } from '@/components/CmykDots.tsx'
import { Container } from '@/components/Container.tsx'

/** The top of an inner page: eyebrow, the page title (h1), and a lead. */
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children?: ReactNode
}) {
  return (
    <header className="pt-20 pb-12 sm:pt-28 sm:pb-16">
      <Container>
        <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-mute uppercase">
          <CmykDots />
          {eyebrow}
        </p>
        <h1 className="mt-6 max-w-4xl font-display text-4xl leading-[1.05] font-light tracking-tight text-balance hyphens-auto break-words sm:text-6xl">
          {title}
        </h1>
        {children && (
          <div className="mt-6 max-w-2xl text-base leading-relaxed text-mute sm:text-lg">
            {children}
          </div>
        )}
      </Container>
    </header>
  )
}

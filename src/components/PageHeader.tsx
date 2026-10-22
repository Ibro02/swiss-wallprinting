import type { ReactNode } from 'react'
import { Container } from '@/components/Container.tsx'
import { SectionLabel } from '@/components/SectionHeading.tsx'

/**
 * The first card of an inner page: mist, with the header pill floating over its top (like
 * the hero photo on the home page), the label, the page title (h1, usually with its serif
 * accent), and the lead to the right of the title on wide screens.
 */
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="rounded-2xl bg-plaster sm:rounded-3xl">
      {/* Top padding: the pill (top 16/24/32 px inside the card, about 52 px high) and air. */}
      <Container className="grid gap-6 pt-28 pb-10 sm:pt-32 sm:pb-12 lg:grid-cols-12 lg:items-end lg:gap-8 lg:pb-14">
        <div data-rise="1" className="lg:col-span-8">
          <SectionLabel>{eyebrow}</SectionLabel>
          <h1 className="mt-5 text-display font-medium text-balance hyphens-auto break-words">
            {title}
          </h1>
        </div>
        {children && (
          <div
            data-rise="2"
            className="max-w-md text-base leading-relaxed text-mute sm:text-[1.0625rem] lg:col-span-4 lg:pb-1"
          >
            {children}
          </div>
        )}
      </Container>
    </header>
  )
}

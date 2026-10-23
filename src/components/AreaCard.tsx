import type { ComponentProps, ComponentType, ReactNode, SVGProps } from 'react'
import { ArrowRightIcon } from '@/components/icons.tsx'
import { Link } from '@/i18n/navigation.ts'

/**
 * A mist card that opens a page, in the layout of Framer's "Programs" (`.lift-card` in
 * globals.css: under the mouse it rises, its rim and glow turn lime, and a band of light
 * sweeps across): the icon in a pale lime tile, the title, the text, an optional closing
 * line in the serif accent, and at the foot the call to action and a number. Phones: a
 * compact row (icon, text, arrow); the foot is for screen readers there. Used by the
 * application areas (home).
 */
export function AreaCard({
  href,
  Icon,
  title,
  text,
  accent,
  cta,
  number,
}: {
  href: ComponentProps<typeof Link>['href']
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  text: string
  /** A closing line in the serif accent, under the text. */
  accent?: ReactNode
  /** The call to action at the foot ("Try it in the configurator"). */
  cta: string
  /** The card's place in its list, shown as "01" at the foot. */
  number: number
}) {
  return (
    <Link
      href={href}
      className="lift-card group relative isolate flex h-full items-center gap-4 overflow-clip rounded-2xl bg-plaster p-3.5 hover:bg-paper sm:flex-col sm:items-start sm:gap-0 sm:rounded-3xl sm:p-7"
    >
      <span aria-hidden="true" className="lift-card__sweep" />
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-lime/25 text-graphite sm:size-13 sm:rounded-[0.875rem] dark:bg-lime/12 dark:text-lime">
        <Icon className="size-6" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col self-stretch sm:mt-5">
        <span className="text-base font-medium tracking-tight sm:text-xl">{title}</span>
        <span className="mt-0.5 flex-1 text-sm leading-relaxed text-mute sm:mt-2 sm:text-[0.9375rem]">
          {text}
        </span>
        {accent && (
          <span className="mt-3 font-serif text-lg leading-snug text-magenta-700 italic sm:mt-5 sm:text-2xl dark:text-lime">
            {accent}
          </span>
        )}
        <span className="mt-6 flex items-center justify-between gap-4 max-sm:sr-only">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-magenta-700 dark:text-magenta-200">
            {cta}
            <ArrowRightIcon className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </span>
          <span aria-hidden="true" className="text-sm font-semibold text-mute tabular-nums">
            {String(number).padStart(2, '0')}
          </span>
        </span>
      </span>
      <ArrowRightIcon
        aria-hidden="true"
        className="size-4 shrink-0 text-magenta-700 sm:hidden dark:text-magenta-200"
      />
    </Link>
  )
}

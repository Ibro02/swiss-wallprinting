import type { ComponentType, SVGProps } from 'react'
import { ArrowRightIcon } from '@/components/icons.tsx'

export interface ContactRowProps {
  href: string
  /** Small text above the value: "Phone (IT)", "E-mail", "Location". */
  label: string
  value: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
}

/**
 * One way to reach the client, as a row (home page question section, contact page): a dark
 * icon tile with a lime icon, the label, the value, and an arrow that moves on hover. Put
 * the rows in a `<ul>` with `border-t border-ink/10`; each row draws its bottom line.
 */
export function ContactRow({ href, label, value, Icon }: ContactRowProps) {
  return (
    <a href={href} className="group flex items-center gap-4 py-4 sm:py-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-graphite text-lime">
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-mute">{label}</span>
        <span className="block truncate text-base font-medium tracking-tight sm:text-lg">
          {value}
        </span>
      </span>
      <ArrowRightIcon className="size-5 shrink-0 text-ink/40 transition-[transform,color] duration-200 ease-out group-hover:translate-x-1 group-hover:text-magenta-700 dark:group-hover:text-magenta-200 motion-reduce:transition-none" />
    </a>
  )
}

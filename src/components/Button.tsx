import type { ComponentProps } from 'react'
import { Link } from '@/i18n/navigation.ts'

// One look for every call to action. `primary` is the magenta "Try your wall" /
// "Free quote" button (white text, 4.6:1); the others are for less important actions.

export type ButtonVariant = 'primary' | 'secondary-dark' | 'secondary-light' | 'ghost-dark'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap ' +
  'transition-[background-color,color,box-shadow,transform] duration-200 ease-(--ease-print) ' +
  'active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-magenta text-white hover:bg-magenta-700 shadow-[0_8px_24px_-12px_var(--color-magenta)]',
  'secondary-dark': 'bg-white/10 text-plaster ring-1 ring-white/20 ring-inset hover:bg-white/15',
  'secondary-light':
    'bg-transparent text-graphite ring-1 ring-graphite/25 ring-inset hover:bg-graphite/5',
  'ghost-dark': 'text-plaster hover:bg-white/10',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-7 text-base',
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]}`
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

/** A link that looks like a button, for internal (localized) pages. */
export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link {...props} className={`${buttonClasses(variant, size)} ${className ?? ''}`} />
}

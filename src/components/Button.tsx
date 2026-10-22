import type { ComponentProps } from 'react'
import { Link } from '@/i18n/navigation.ts'

// One look for every call to action. `primary` is the logo's magenta (white text 4.6:1),
// for the main action of each place: "Try your wall", send, the quote; `inverse` is the
// white one on photos and dark cards; `secondary` is the quiet one on white; `glass` the
// quiet one on photos and dark cards. Press feedback:
// a short scale-down (160 ms, ease-out). Tailwind's `hover:` only applies on devices
// that can hover, so taps do not leave a hover colour behind.

export type ButtonVariant = 'primary' | 'inverse' | 'secondary' | 'glass'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BASE =
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap select-none ' +
  'transition-[background-color,color,box-shadow,transform] duration-160 ease-out ' +
  'active:scale-[0.97] motion-reduce:active:scale-100'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-magenta text-white shadow-[0_6px_18px_-8px_rgb(229_17_88/0.6)] hover:bg-magenta-700',
  inverse: 'bg-white text-graphite hover:bg-white/85',
  secondary: 'bg-white text-graphite ring-1 ring-graphite/12 ring-inset hover:bg-plaster',
  glass:
    'bg-white/10 text-white ring-1 ring-white/25 ring-inset backdrop-blur-md hover:bg-white/20',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 rounded-xl px-4 text-sm',
  md: 'h-10 rounded-xl px-4 text-sm sm:px-5',
  lg: 'h-12 rounded-2xl px-6 text-[0.9375rem]',
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

import type { ComponentProps } from 'react'

/** The page width and side padding used by every section. */
export function Container({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className ?? ''}`}
    />
  )
}

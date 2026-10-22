import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { Container } from '@/components/Container.tsx'

/** A fact the client has not sent yet: visible, so nobody takes the page as final. */
export async function Missing() {
  const t = await getTranslations('Legal')
  return (
    <span className="rounded-md bg-magenta-700/8 px-2 py-0.5 text-sm font-medium text-magenta-700">
      {t('missing')}
    </span>
  )
}

/** Shown while legal facts are missing (legal.mock): the page is a draft. */
export async function DraftBanner() {
  const t = await getTranslations('Legal')
  return (
    <Container className="pt-8">
      <p
        role="note"
        className="max-w-3xl rounded-xl bg-magenta-700/6 px-5 py-4 text-sm leading-relaxed text-magenta-700 ring-1 ring-magenta-700/15"
      >
        {t('draft')}
      </p>
    </Container>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-graphite/10 py-10 first:border-t-0">
      <h2 className="text-2xl font-medium tracking-tight">{title}</h2>
      <div className="mt-4 max-w-3xl space-y-4 leading-relaxed text-graphite/85">{children}</div>
    </section>
  )
}

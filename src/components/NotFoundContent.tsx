import { getTranslations } from 'next-intl/server'
import { ButtonLink } from '@/components/Button.tsx'
import { Container } from '@/components/Container.tsx'

// Shared by the prerendered 404 page (unknown URLs, via the proxy) and
// [locale]/not-found.tsx (notFound() calls inside real pages).
export async function NotFoundContent() {
  const t = await getTranslations('NotFound')
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <Container className="py-24 sm:py-32">
        <p className="font-display text-7xl font-light text-magenta-700 sm:text-8xl">404</p>
        <h1 className="mt-6 font-display text-3xl font-light tracking-tight sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-4 max-w-xl text-mute">{t('body')}</p>
        <ButtonLink href="/" variant="secondary-light" className="mt-10">
          {t('back')}
        </ButtonLink>
      </Container>
    </main>
  )
}

import { getTranslations } from 'next-intl/server'
import { ButtonLink } from '@/components/Button.tsx'
import { Container } from '@/components/Container.tsx'

// Shared by the prerendered 404 page (unknown URLs, via the proxy) and
// [locale]/not-found.tsx (notFound() calls inside real pages).
export async function NotFoundContent() {
  const t = await getTranslations('NotFound')
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <div className="rounded-2xl bg-plaster sm:rounded-3xl">
        <Container className="pt-28 pb-20 sm:pt-36 sm:pb-28 md:pt-40">
          <p
            aria-hidden="true"
            className="font-serif text-8xl leading-none text-magenta-700 italic sm:text-9xl"
          >
            404
          </p>
          <h1 className="mt-8 text-4xl font-medium tracking-[-0.03em] sm:text-5xl">{t('title')}</h1>
          <p className="mt-4 max-w-xl text-mute">{t('body')}</p>
          <ButtonLink href="/" className="mt-10" size="lg">
            {t('back')}
          </ButtonLink>
        </Container>
      </div>
    </main>
  )
}

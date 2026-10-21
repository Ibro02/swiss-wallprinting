import { getLocale, getTranslations } from 'next-intl/server'
import { Container } from '@/components/Container.tsx'
import { CtaBand } from '@/components/CtaBand.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { images } from '@/content/images/index.ts'
import { collections } from '@/content/index.ts'
import { metadataFor } from '@/i18n/metadata.ts'
import type { Locale } from '@/i18n/routing.ts'
import { type GalleryEntry, GalleryGrid } from '@/islands/GalleryGrid.tsx'

export const generateMetadata = metadataFor('gallery')

export default async function GalleryPage() {
  const t = await getTranslations('Gallery')
  const locale = (await getLocale()) as Locale

  const items: GalleryEntry[] = collections.gallery.map((item) => ({
    id: item.id,
    image: images[item.image],
    alt: item.alt[locale],
    caption: item.caption[locale],
    area: item.area,
    mock: item.mock,
  }))
  // Only areas with at least one photo get a filter button.
  const filters = collections.applicationAreas
    .filter((area) => items.some((item) => item.area === area.id))
    .map((area) => [area.id, area.title[locale]] as const)
  const hasMock = items.some((item) => item.mock)

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader eyebrow={t('eyebrow')} title={t('title')}>
        <p>{t('lead')}</p>
        {hasMock && <p className="mt-3 text-sm">{t('mockNote')}</p>}
      </PageHeader>
      <section aria-label={t('title')} className="pb-24">
        <Container>
          <GalleryGrid items={items} filters={filters} />
        </Container>
      </section>
      <div className="pb-24">
        <CtaBand />
      </div>
    </main>
  )
}

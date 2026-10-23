import { getLocale, getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { Container } from '@/components/Container.tsx'
import { CtaBand } from '@/components/CtaBand.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { images } from '@/content/images/index.ts'
import { collections } from '@/content/index.ts'
import { ProjectList } from '@/features/projects/ProjectList.tsx'
import { metadataFor } from '@/i18n/metadata.ts'
import type { Locale } from '@/i18n/routing.ts'
import { type GalleryEntry, GalleryGrid } from '@/islands/GalleryGrid.tsx'

export const generateMetadata = metadataFor('projects')

// "Gallery of finished projects" (the client's brief, 2026-10-22; README: Gallery): the
// client's projects with their stories first, then the photo grid (filter, lightbox), which
// holds the other pictures until the project photos arrive.
export default async function ProjectsPage() {
  const t = await getTranslations('Projects')
  const gallery = await getTranslations('Gallery')
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
  const photosPending = collections.projects.some((project) => project.photos.length === 0)

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader eyebrow={t('eyebrow')} title={t.rich('title', accent)}>
        <p>{t('lead')}</p>
        {photosPending && <p className="mt-3 text-sm">{t('photosPending')}</p>}
      </PageHeader>
      <ProjectList />
      <section aria-labelledby="gallery-title" className="pb-14 sm:pb-16 lg:pb-20">
        <Container>
          <SectionHeading
            id="gallery-title"
            eyebrow={gallery('eyebrow')}
            title={gallery.rich('title', accent)}
          >
            <p>{gallery('lead')}</p>
            {hasMock && <p className="mt-2 text-sm">{gallery('mockNote')}</p>}
          </SectionHeading>
          <div className="mt-8 sm:mt-10">
            <GalleryGrid items={items} filters={filters} />
          </div>
        </Container>
      </section>
      <CtaBand />
    </main>
  )
}

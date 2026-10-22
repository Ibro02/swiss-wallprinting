import { ApplicationAreas } from '@/features/home/ApplicationAreas.tsx'
import { Hero } from '@/features/home/Hero.tsx'
import { ProcessSection } from '@/features/home/ProcessSection.tsx'
import { QuestionSection } from '@/features/home/QuestionSection.tsx'
import { Testimonials } from '@/features/home/Testimonials.tsx'
import { WhySection } from '@/features/home/WhySection.tsx'
import { CompanyJsonLd } from '@/features/seo/CompanyJsonLd.tsx'
import { metadataFor } from '@/i18n/metadata.ts'

export const generateMetadata = metadataFor('home')

// Section order from the author's README: hero, testimonials, why, process,
// application areas, question form.
export default function HomePage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <CompanyJsonLd />
      <Hero />
      <Testimonials />
      <WhySection />
      <ProcessSection />
      <ApplicationAreas />
      <QuestionSection />
    </main>
  )
}

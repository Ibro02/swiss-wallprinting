import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { company, printFacts } from '@/content/company.ts'
import { images } from '@/content/images/index.ts'
import { collections } from '@/content/index.ts'
import { pricing } from '@/content/pricing.ts'
import { printQuality } from '@/content/print-quality.ts'
import { fromSearchParams } from '@/features/configurator/model/share.ts'
import { startConfig } from '@/features/configurator/start.ts'
import { QUESTION_FORM_ID } from '@/features/home/QuestionSection.tsx'
import { metadataFor } from '@/i18n/metadata.ts'
import { getPathname } from '@/i18n/navigation.ts'
import { PAGES } from '@/i18n/pages.ts'
import type { Locale } from '@/i18n/routing.ts'
import { Configurator } from '@/islands/configurator/Configurator.tsx'

export const generateMetadata = metadataFor('tryYourWall')

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// A share link (`?room=…`) or `?area=` (from the application areas and the services page)
// sets the first room, so the page renders per request: the server HTML then has the right
// values (no flash). The canonical URL stays the page without parameters.
export default async function TryYourWallPage({ searchParams }: Props) {
  const params = await searchParams
  const locale = (await getLocale()) as Locale
  const messages = await getMessages()

  const presets = collections.presets.map((preset) => ({
    id: preset.id,
    title: preset.title[locale],
    image: images[preset.image],
  }))
  const shared = fromSearchParams(
    params,
    presets.map((preset) => preset.id),
  )
  const initial = startConfig(
    typeof params.area === 'string' ? params.area : undefined,
    {
      presets,
      rooms: collections.services,
      areas: collections.applicationAreas,
      machineMaxHeight: printFacts.maxPrintHeightM,
    },
    shared,
  )
  const { id: _, mock: ratesAreExamples, ...rates } = pricing
  // The number with WhatsApp (it speaks IT, DE, CH): the quote form offers it.
  const whatsappPhone =
    company.phones.find((phone) => phone.e164 === company.whatsapp) ?? company.phones[0]
  if (!whatsappPhone) throw new Error('src/content/company.ts needs at least one phone number.')

  return (
    <main id="main" tabIndex={-1} className="px-3 pt-3 pb-3 outline-none sm:px-4">
      {/* Only this page needs the configurator texts in the browser. */}
      <NextIntlClientProvider messages={{ Configurator: messages.Configurator }}>
        <Configurator
          initial={initial}
          machineMaxHeight={printFacts.maxPrintHeightM}
          presets={presets}
          presetsAreExamples={collections.presets.some((preset) => preset.mock)}
          rates={rates}
          ratesAreExamples={ratesAreExamples}
          quality={{
            minPixelsPerCm: printQuality.minPixelsPerCm,
            isExample: printQuality.mock,
          }}
          contactHref={`${getPathname({ href: PAGES.contact, locale })}#${QUESTION_FORM_ID}`}
          contact={{
            email: company.email,
            phone: whatsappPhone.display,
            whatsappHref: `https://wa.me/${company.whatsapp.replace('+', '')}`,
          }}
          privacyHref={getPathname({ href: PAGES.privacy, locale })}
        />
      </NextIntlClientProvider>
    </main>
  )
}

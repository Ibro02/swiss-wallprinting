import { getTranslations } from 'next-intl/server'
import { CmykDots } from '@/components/CmykDots.tsx'
import { Container } from '@/components/Container.tsx'
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from '@/components/icons.tsx'
import { Logo } from '@/components/Logo.tsx'
import { company } from '@/content/company.ts'
import { Link } from '@/i18n/navigation.ts'
import { LEGAL_PAGES, NAV_PAGES, PAGES } from '@/i18n/pages.ts'

const HEADING = 'text-xs font-semibold tracking-[0.2em] text-mute-dark uppercase'
const LINK = 'text-plaster/85 transition-colors hover:text-lime'

// The pages are prerendered, so this is the build year: each deploy updates it.
const YEAR = new Date().getFullYear()

export async function SiteFooter() {
  const t = await getTranslations('Footer')
  const nav = await getTranslations('Nav')

  return (
    <footer className="on-dark mt-24 bg-graphite text-plaster">
      <Container className="grid gap-12 py-16 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <Logo className="h-12 w-auto" />
          <p className="mt-8 max-w-sm font-display text-2xl leading-snug font-light">
            {t('claim')}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mute-dark">{t('intro')}</p>
          <CmykDots className="mt-8" />
        </div>

        <nav aria-labelledby="footer-nav" className="md:col-span-2">
          <h2 id="footer-nav" className={HEADING}>
            {t('navTitle')}
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            {[...NAV_PAGES, 'tryYourWall' as const].map((page) => (
              <li key={page}>
                <Link href={PAGES[page]} className={LINK}>
                  {nav(page)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h2 className={HEADING}>{t('contactTitle')}</h2>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex gap-3">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-mute-dark" />
              <address className="not-italic">
                {company.postalCode} {company.locality}
                <br />
                {t('region')}
              </address>
            </li>
            <li>
              <a href={`mailto:${company.email}`} className={`flex gap-3 ${LINK}`}>
                <MailIcon className="mt-0.5 size-4 shrink-0 text-mute-dark" />
                {company.email}
              </a>
            </li>
            {company.phones.map((phone) => (
              <li key={phone.e164}>
                <a href={`tel:${phone.e164}`} className={`flex gap-3 ${LINK}`}>
                  <PhoneIcon className="mt-0.5 size-4 shrink-0 text-mute-dark" />
                  <span>
                    {phone.display}
                    <span className="block text-xs text-mute-dark">
                      {t('phoneLanguages', { languages: phone.languages })}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h2 className={HEADING}>{t('followTitle')}</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a
                href={company.social.instagram}
                className={`inline-flex items-center gap-3 ${LINK}`}
              >
                <InstagramIcon className="size-4" />
                Instagram
              </a>
            </li>
            <li>
              <a
                href={company.social.facebook}
                className={`inline-flex items-center gap-3 ${LINK}`}
              >
                <FacebookIcon className="size-4" />
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        {/* Space below (phones) and to the right (wider screens) keeps the floating
            WhatsApp button off the legal links. */}
        <Container className="flex flex-col gap-4 pt-6 pb-24 text-xs text-mute-dark sm:flex-row sm:items-center sm:justify-between sm:pb-6">
          <p>
            © {YEAR} {company.name}. {t('rights')}
          </p>
          <nav aria-label={t('legalTitle')} className="sm:mr-20">
            <ul className="flex gap-6">
              {LEGAL_PAGES.map((page) => (
                <li key={page}>
                  <Link href={PAGES[page]} className={LINK}>
                    {nav(page)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>
    </footer>
  )
}

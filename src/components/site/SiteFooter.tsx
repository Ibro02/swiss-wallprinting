import { getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { Container } from '@/components/Container.tsx'
import { FacebookIcon, InstagramIcon } from '@/components/icons.tsx'
import { Logo } from '@/components/Logo.tsx'
import { company } from '@/content/company.ts'
import { Link } from '@/i18n/navigation.ts'
import { LEGAL_PAGES, NAV_PAGES, PAGES } from '@/i18n/pages.ts'

// The last card of every page: dark, in the same frame as the hero card, with the colour
// logo (it needs a dark ground) and a large claim. Then three short columns and the legal
// line.

const HEADING = 'text-xs font-medium text-mute-dark'
const LINK = 'text-white/85 transition-colors duration-150 hover:text-lime'

// The pages are prerendered, so this is the build year: each deploy updates it.
const YEAR = new Date().getFullYear()

export async function SiteFooter() {
  const t = await getTranslations('Footer')
  const nav = await getTranslations('Nav')

  return (
    <footer className="on-dark mt-3 mb-3 overflow-hidden rounded-2xl bg-graphite text-white sm:mt-4 sm:mb-4 sm:rounded-3xl md:mt-6 md:mb-6">
      <Container className="grid gap-10 pt-10 pb-8 sm:pt-12 lg:grid-cols-12 lg:gap-8 lg:pt-14">
        <div className="lg:col-span-6">
          <Logo className="h-9 w-auto sm:h-10" />
          <p className="mt-8 max-w-xl text-title font-medium text-balance">
            {t.rich('claim', accent)}
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-mute-dark">{t('intro')}</p>
        </div>

        {/* The contact column is the widest: the e-mail address must fit on one line. */}
        <div className="grid gap-10 sm:grid-cols-[0.8fr_1.5fr_0.8fr] lg:col-span-6 lg:pt-16">
          <nav aria-labelledby="footer-nav">
            <h2 id="footer-nav" className={HEADING}>
              {t('navTitle')}
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[...NAV_PAGES, 'tryYourWall' as const].map((page) => (
                <li key={page}>
                  <Link href={PAGES[page]} className={LINK}>
                    {nav(page)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={HEADING}>{t('contactTitle')}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={`mailto:${company.email}`} className={LINK}>
                  {company.email}
                </a>
              </li>
              {company.phones.map((phone) => (
                <li key={phone.e164}>
                  <a href={`tel:${phone.e164}`} className={LINK}>
                    {phone.display}
                  </a>
                  <span className="block text-xs text-mute-dark">
                    {t('phoneLanguages', { languages: phone.languages })}
                  </span>
                </li>
              ))}
              <li className="text-mute-dark">
                <address className="not-italic">
                  {company.postalCode} {company.locality}, {t('region')}
                </address>
              </li>
              <li className="text-mute-dark">{t('hours', company.hours)}</li>
            </ul>
          </div>

          <div>
            <h2 className={HEADING}>{t('followTitle')}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a
                  href={company.social.instagram}
                  className={`inline-flex items-center gap-2.5 ${LINK}`}
                >
                  <InstagramIcon className="size-4" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={company.social.facebook}
                  className={`inline-flex items-center gap-2.5 ${LINK}`}
                >
                  <FacebookIcon className="size-4" />
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Space below (phones) and to the right (wider screens) keeps the floating
          WhatsApp button off the legal links. */}
      <Container className="flex flex-col gap-4 border-t border-white/10 pt-6 pb-24 text-xs text-mute-dark sm:flex-row sm:items-center sm:justify-between sm:pb-6">
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
    </footer>
  )
}

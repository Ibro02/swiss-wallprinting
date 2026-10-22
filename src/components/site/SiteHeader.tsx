import { getTranslations } from 'next-intl/server'
import { ButtonLink } from '@/components/Button.tsx'
import { FRAME } from '@/components/Container.tsx'
import { CubeIcon, MailIcon, PhoneIcon } from '@/components/icons.tsx'
import { Logo } from '@/components/Logo.tsx'
import { company } from '@/content/company.ts'
import { Link } from '@/i18n/navigation.ts'
import { ConfiguratorIntent } from '@/islands/ConfiguratorIntent.tsx'
import { LanguageSwitcher } from '@/islands/LanguageSwitcher.tsx'
import { MobileMenu } from '@/islands/MobileMenu.tsx'
import { NavLink } from '@/islands/NavLink.tsx'
import { ThemeToggle } from '@/islands/ThemeToggle.tsx'
import { NAV_PAGES, PAGES } from '@/i18n/pages.ts'

// A frosted pill that floats over the first card of every page (the hero photo, or the
// mist header of an inner page), with the client's black logo: the colour logo needs a
// dark ground. Fixed: its top edge is the frame (12/16/24 px) plus the card padding
// (16/24/32 px), so it sits inside the card in line with the headline; over the first
// 96 px of scroll it rises close to the top edge (`header-lift`, a CSS scroll timeline,
// so a page reloaded halfway down paints it in the right place at once).
// Server Component; the islands are small.

/** The logo links home, so the pill lists only the other pages. */
const PILL_PAGES = NAV_PAGES.filter((page) => page !== 'home')

export async function SiteHeader() {
  const t = await getTranslations('Nav')

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <a
        href="#main"
        className="pointer-events-auto sr-only rounded-xl bg-graphite px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3"
      >
        {t('skipToContent')}
      </a>

      <div className={FRAME}>
        <div className="header-lift px-4 pt-7 [--lift:-1rem] sm:px-6 sm:pt-10 sm:[--lift:-1.5rem] md:px-8 md:pt-14 md:[--lift:-2.25rem]">
          <div className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl bg-paper/70 py-2 pr-2 pl-3 text-ink shadow-[0_1px_1px_rgb(0_0_0/0.04),0_12px_32px_-16px_rgb(0_0_0/0.35)] ring-1 ring-ink/5 backdrop-blur-md backdrop-saturate-150 sm:pl-4 lg:w-fit lg:gap-6">
            <Link href="/" aria-label={t('homeLink')} className="shrink-0 rounded-lg">
              <Logo tone="ink" className="h-6 w-auto sm:h-7" />
            </Link>

            <nav aria-label={t('label')} className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {PILL_PAGES.map((page) => (
                  <li key={page}>
                    <NavLink
                      href={PAGES[page]}
                      className="block rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap text-ink/75 transition-[opacity,color] duration-150 hover:opacity-60 aria-[current=page]:bg-lime/35 aria-[current=page]:text-ink"
                    >
                      {t(page)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="ml-auto flex items-center gap-1.5">
              {/* Wide screens: the theme and the language in the pill; phones: in the menu. */}
              <div className="hidden items-center gap-1 lg:flex">
                <ThemeToggle label={t('themeDark')} variant="icon" />
                <LanguageSwitcher />
              </div>
              <ConfiguratorIntent>
                <ButtonLink href={PAGES.tryYourWall} size="md">
                  <CubeIcon className="size-4" />
                  <span className="hidden sm:inline">{t('tryYourWall')}</span>
                  <span className="sm:hidden">{t('tryYourWallShort')}</span>
                </ButtonLink>
              </ConfiguratorIntent>
              <div className="lg:hidden">
                <MobileMenu openLabel={t('menuOpen')} closeLabel={t('menuClose')}>
                  <div className="flex min-h-[calc(100dvh-6rem)] flex-col gap-10 px-7 pt-2 pb-10 sm:px-10">
                    <nav aria-label={t('label')}>
                      <ul className="flex flex-col">
                        {NAV_PAGES.map((page) => (
                          <li key={page}>
                            <NavLink
                              href={PAGES[page]}
                              className="flex items-center justify-between border-b border-ink/8 py-4 text-3xl font-medium tracking-tight after:size-2 after:rounded-full after:bg-magenta after:opacity-0 aria-[current=page]:after:opacity-100"
                            >
                              {t(page)}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </nav>
                    <ButtonLink href={PAGES.tryYourWall} size="lg" className="w-full">
                      <CubeIcon className="size-5" />
                      {t('tryYourWall')}
                    </ButtonLink>
                    <div>
                      <LanguageSwitcher variant="list" />
                      <div className="mt-4 border-y border-ink/8">
                        <ThemeToggle label={t('themeDark')} variant="row" />
                      </div>
                    </div>
                    <ul className="mt-auto space-y-3 text-sm text-mute">
                      <li>
                        <a
                          href={`mailto:${company.email}`}
                          className="inline-flex items-center gap-3"
                        >
                          <MailIcon className="size-4" />
                          {company.email}
                        </a>
                      </li>
                      {company.phones.map((phone) => (
                        <li key={phone.e164}>
                          <a href={`tel:${phone.e164}`} className="inline-flex items-center gap-3">
                            <PhoneIcon className="size-4" />
                            {phone.display}
                            <span className="opacity-70">({phone.languages})</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </MobileMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

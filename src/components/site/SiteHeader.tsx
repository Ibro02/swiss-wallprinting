import { getTranslations } from 'next-intl/server'
import { ButtonLink } from '@/components/Button.tsx'
import { CubeIcon, MailIcon, PhoneIcon } from '@/components/icons.tsx'
import { Logo } from '@/components/Logo.tsx'
import { company } from '@/content/company.ts'
import { Link } from '@/i18n/navigation.ts'
import { ConfiguratorIntent } from '@/islands/ConfiguratorIntent.tsx'
import { LanguageSwitcher } from '@/islands/LanguageSwitcher.tsx'
import { MobileMenu } from '@/islands/MobileMenu.tsx'
import { NavLink } from '@/islands/NavLink.tsx'
import { NAV_PAGES, PAGES } from '@/i18n/pages.ts'

// Dark glass pill on every page: the colour logo needs a dark background (lime letters on
// plaster are 1.7:1). 85 % opacity: over the light page the nav links (plaster at 75 %)
// keep about 7:1 contrast; at 65 % they had 4.05:1. Server Component; the islands are small.

export async function SiteHeader() {
  const t = await getTranslations('Nav')

  return (
    <header className="on-dark sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <a
        href="#main"
        className="sr-only rounded-full bg-lime px-4 py-2 font-semibold text-graphite focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
      >
        {t('skipToContent')}
      </a>

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 rounded-full bg-graphite/85 py-2 pr-2 pl-5 text-plaster shadow-[0_12px_40px_-16px_rgb(0_0_0/0.6)] ring-1 ring-white/10 backdrop-blur-xl">
        <Link href="/" aria-label={t('homeLink')} className="shrink-0 rounded-md">
          <Logo className="h-8 w-auto sm:h-9" />
        </Link>

        <nav aria-label={t('label')} className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_PAGES.map((page) => (
              <li key={page}>
                <NavLink
                  href={PAGES[page]}
                  className="rounded-full px-4 py-2 text-sm text-plaster/75 transition-colors hover:bg-white/5 hover:text-plaster aria-[current=page]:bg-white/10 aria-[current=page]:text-lime"
                >
                  {t(page)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <div className="hidden lg:block">
            <LanguageSwitcher />
          </div>
          <ConfiguratorIntent>
            <ButtonLink href={PAGES.tryYourWall} size="md" className="px-4 sm:px-5">
              <CubeIcon className="size-4" />
              <span className="hidden sm:inline">{t('tryYourWall')}</span>
              <span className="sm:hidden">{t('tryYourWallShort')}</span>
            </ButtonLink>
          </ConfiguratorIntent>
          <div className="lg:hidden">
            <MobileMenu openLabel={t('menuOpen')} closeLabel={t('menuClose')}>
              <div className="flex min-h-[calc(100dvh-5.5rem)] flex-col gap-10 px-6 pt-4 pb-10">
                <nav aria-label={t('label')}>
                  <ul className="flex flex-col">
                    {NAV_PAGES.map((page) => (
                      <li key={page}>
                        <NavLink
                          href={PAGES[page]}
                          className="block border-b border-white/10 py-4 font-display text-2xl font-light aria-[current=page]:text-lime"
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
                <LanguageSwitcher variant="list" />
                <ul className="mt-auto space-y-3 text-sm text-mute-dark">
                  <li>
                    <a href={`mailto:${company.email}`} className="inline-flex items-center gap-3">
                      <MailIcon className="size-4" />
                      {company.email}
                    </a>
                  </li>
                  {company.phones.map((phone) => (
                    <li key={phone.e164}>
                      <a href={`tel:${phone.e164}`} className="inline-flex items-center gap-3">
                        <PhoneIcon className="size-4" />
                        {phone.display}
                        <span className="opacity-60">({phone.languages})</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </MobileMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

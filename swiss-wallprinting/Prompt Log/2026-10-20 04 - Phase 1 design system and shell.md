---
tags: [prompt-log]
date: 2026-10-20
agent: Claude Code (Claude Opus 5.5)
status: done
---
# 2026-10-20 04 - Phase 1 design system and shell

## Prompt

> start phase 1

## Goal

Phase 1 of [[Development Plan#8. Phases]]: design tokens, fonts, buttons, the real header (with the configurator button), footer, language switcher, content schemas, and the texts in four languages. Also fix the open item from Phase 0: the localized 404 had no server HTML.

## Result

- **Localized 404 fixed.** Cause: in Next.js 16, a `notFound()` call at request time always sends an empty error document (`<html id="__next_error__">`); the 404 UI appears only after hydration. Only prerendered pages get full HTML. Fix: `src/i18n/known-paths.ts` decides from `routing.pathnames` whether a localized URL has a page; for an unknown one, `src/proxy.ts` rewrites to the prerendered `(pages)/page-not-found` route with status 404. Now `/it/missing`, `/de/gibt/es/nicht`, `/bs/x.html` return 404 with the full translated page in the HTML. The proxy matcher also covers localized URLs with a dot.
- **Design tokens** in `src/app/globals.css`: graphite, plaster, mute, magenta (plus 300 and 700 shades for text), lime, CMYK ink colours, WhatsApp green, an easing curve, focus rings (magenta-700 on light, lime on dark). Each text colour pair is checked for contrast (see the comment in the file).
- **Fonts** (`src/app/fonts.ts`, self-hosted by `next/font`): Unbounded 300 for display, Inter (variable) for text. Only `latin` is preloaded; latin-ext (Bosnian letters) loads on demand.
- **Logo** as an inline SVG component (from `Assets/SWP_Logo.svg`). **Favicon**: the magenta S of the logo on graphite (`src/app/icon.svg`); `vp run images` makes `favicon.ico` (16, 32, 48 px, own small ICO writer with tests) and `apple-icon.png`.
- **Components:** `ButtonLink` / `buttonClasses` (primary magenta, secondary dark and light, ghost), `Container`, line icons, `CmykDots`.
- **Header:** sticky dark glass pill with the logo, the main navigation (current page in lime, `aria-current`), language switcher (disclosure with the language names), the magenta "Prova la tua parete" button, and a skip link. On phones: logo, short button ("Prova"), menu button; the full-screen menu uses the HTML popover attribute, so it opens before hydration, and closes after a link click.
- **Footer:** logo, claim and intro from the old site, navigation, address, e-mail, both phones with their languages, Instagram and Facebook, legal links, copyright.
- **WhatsApp button** (Q9): floating link to wa.me with a prefilled message in the page language.
- **Metadata:** title template "Page · Swiss Wall Printing", canonical URL and hreflang links (4 locales + x-default) on every page via `metadataFor(page)`; `SITE_URL` sets the domain (default `https://www.swisswallprinting.ch`). Theme colour graphite.
- **Content schemas:** `LocalizedText` (it, de, en, bs; a test checks the keys against the routing), `testimonial`, `applicationArea`; empty collections registered for Phase 2. A test makes sure every collection has a schema and matches it.
- **Messages:** header, menu, footer, and WhatsApp texts in IT, DE (Swiss spelling), EN, BS. DE/EN/BS are drafts.

Validation: `vp check` passes (57 files), `vp test` passes (6 files, 48 tests), `vp run build` passes (41 pages). On the production server: 32/32 localized pages return 200 with the correct `lang`, canonical URL, and 5 hreflang links; the 404s return 404 with full HTML; icons are served. Browser checks: language switch keeps the page (`/it/chi-siamo` → `/de/ueber-uns`), the mobile menu opens and closes after navigation, no horizontal scroll at 1024 px (longest English labels). Lighthouse mobile (simulated slow 4G): Italian home **96 performance, 100 accessibility, 100 best practices, 100 SEO**; Bosnian page 92 performance.

## Changed files

- New: `src/i18n/known-paths.ts`, `src/i18n/metadata.ts`, `src/i18n/pages.ts`, `src/i18n/locale-names.ts`, `src/app/fonts.ts`, `src/app/icon.svg`, `src/app/favicon.ico`, `src/app/apple-icon.png`, `src/app/[locale]/(pages)/page-not-found/page.tsx`, `src/components/{Logo,Button,Container,CmykDots,NotFoundContent,icons}.tsx`, `src/components/site/{SiteHeader,SiteFooter,WhatsAppButton}.tsx`, `src/islands/{NavLink,LanguageSwitcher,MobileMenu}.tsx`, `scripts/lib/ico.ts`, tests `src/i18n/__tests__/known-paths.test.ts`, `scripts/__tests__/ico.test.ts`
- Changed: `src/proxy.ts`, `src/app/globals.css`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/not-found.tsx`, `src/app/[locale]/[...rest]/page.tsx`, all 8 page files, `src/components/PlaceholderPage.tsx`, `src/content/{schema,index}.ts`, `src/content/__tests__/content.test.ts`, `scripts/images.ts`, `messages/*.json`, `.env.example` (`SITE_URL`), `CLAUDE.md`, [[Development Plan]]
- Deleted: `src/components/SiteNav.tsx` (Phase 0 placeholder)

## Decisions

- **404 through the proxy, not `notFound()`**, for unknown URLs (reason above). `[locale]/not-found.tsx` stays for `notFound()` calls inside real pages (for example a gallery item that does not exist), which still render only after hydration.
- **Header and footer dark on every page**, because the lime letters of the logo have 1.7:1 contrast on plaster.
- **Unbounded only at weight 300.** The variable file was 115 KB; the 300 weight is 20 KB. The first Lighthouse run had 4 preloaded font files (about 300 KB) and LCP 4.2 s (performance 85); after the change, 2 files (68 KB) and LCP 2.5 s (performance 96).
- **Mobile menu with the popover attribute** instead of `<dialog>`: it works before hydration (no dead button while JavaScript loads). It does not trap the focus, but it covers the whole screen and closes with Escape.
- **Images in content are not decided yet.** Content files cannot import `.jpg` files, because the mock guard runs them in Node. Phase 2 decides: public paths plus an image manifest (size and blur preview) from the image pipeline is the likely way.
- **Year in the footer = build year** (static pages; each deploy updates it).
- **Language switcher name includes the visible code** ("IT, Lingua: Italiano") for voice control (WCAG 2.5.3).

## Open items

- **Bosnian pages: Lighthouse performance 92** (target 95). The latin-ext font files are found only after the CSS loads. Possible fix in Phase 6: preload the latin-ext files only on `bs` pages.
- **Mobile menu fade:** screenshots in the in-app browser sometimes show the menu mid-fade, because the background pane throttles animations. The computed style is correct (opacity 1). Check on a real phone.
- **Real phone test** is still to do (only emulation so far).
- **Commit:** nothing is committed. Git `user.name` and `user.email` are still not set.
- **Next phase:** Phase 2 (home page: hero print reveal, testimonials, why, process, application areas, question form).

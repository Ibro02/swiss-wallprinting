---
tags: [prompt-log, phase-6]
date: 2026-10-22
agent: Claude Code (Opus 5.5)
status: waiting for the author
---
# 2026-10-22 05 - Phase 6 plan and quality work

## Prompt

> let's do phase 6
>
> let's plan it first because I'll be off for next 3 hours, but I'll keep the device on so you can work

## Goal

Plan Phase 6 (quality: E2E, accessibility, SEO, performance budgets in CI), then do it while the author is away.

## Result

The plan: [[Specs/Phase 6 Quality]] (targets, six steps, decisions D1–D8). Work on the local branch `phase-6` (from `main` at `928757f`), committed there on the author's next prompt ("Commit the Phase 6 work on the phase-6 branch (no push)."); not pushed. It was interrupted once by the dark mode prompt ([[2026-10-22 06 - Dark mode]], on its own branch): the work was put aside with `git stash` and brought back with `git stash pop`, unchanged. The author's usage limit also paused the session once; the work went on after it.

- **Tooling:** `@playwright/test` 1.64.1 (it matches the Chromium already installed) and `@axe-core/playwright` as dev dependencies; `playwright.config.ts` (production build on port 3001, desktop 1440 × 900 and Pixel 7; the test server writes form e-mails to the outbox whatever `.env.local` says); scripts `e2e`, `e2e:ui`.
- **E2E (`e2e/`, 84 tests pass, 18 skipped by design):** every page in Italian and the home/contact in DE, EN, BS (status 200, one `h1`, the `lang`, no horizontal scroll, no console error); 404; the language menu; the phone menu; the scroll hero (follows the scroll both ways; with reduced motion the last frame and a short section); the reviews band (moves, pauses under the mouse and with the stop control, still with reduced motion); the question form (server errors and focus, sent, and without JavaScript); the configurator (price and share link, a share link opens the same configuration, the phone tabs with no tab scrolling, the keyboard path through all sections to the quote button, the quote dialog).
- **Accessibility:** axe (WCAG 2.0, 2.1, 2.2, A and AA) on every page, desktop and phone, after the entrance fades: clean. Fixed: the reviews band can take the keyboard focus (a labelled `section`, axe `scrollable-region-focusable`), pauses while it has the focus, and has a **stop control** ("Ferma le recensioni", a checkbox, so it works without JavaScript and for touch; WCAG 2.2.2). Lighthouse accessibility 100 on four pages, 96 on contact (a contact row caught halfway through its scroll reveal).
- **SEO:** each page's description is its own lead sentence (no new texts); canonical, hreflang, Open Graph (title, description, `og:locale`, the image) and Twitter card per page (`metadataFor`); `/sitemap.xml` (every page in every locale, with alternates and x-default); `/robots.txt` (closed unless `SITE_ENV=production`); `LocalBusiness` JSON-LD on the home and contact pages, only from `company.ts`, no rating, no reviews; the OG image (1200 × 630, the client's tiger photo with the colour logo, no text) made by `vp run images`; `siteUrl()` for every absolute URL. Lighthouse SEO 100 on all five pages.
- **Performance:**
  - The home page measured 68–71 with an LCP of 16.9 s: the hero frames (4–8 MB) loaded from hydration and shared the network with the poster (the LCP image). Now the frames wait for the load event and the poster's first paint, then load only every 8th frame (16 frames, about 0.6 MB on phones); all of them come on the first scroll (`coarseCount`, with a test). Home: 916 KB instead of 4.8 MB, LCP 3.6 s, performance 81.
  - The first gallery photos and the first before/after card are no longer lazy-loaded (their photo is the LCP).
  - Lighthouse mobile now: home 81, services 90, gallery 89, contact 92, configurator 90; best practices and SEO 100 everywhere.
  - JS: first-load 152–159 KB gzip (133–136 KB brotli): React DOM 70, the Next.js runtime 45, next-intl's formatter 15, the site about 20. The budget test measures without the `nomodule` polyfills; no three.js on any marketing page.
- **CI:** a second job `quality` (after `check`): build with `SITE_URL=http://localhost:3001`, `npx playwright install --with-deps chromium`, `vp run e2e`, Lighthouse CI (`lighthouserc.json`, 3 runs per page, through `npx @lhci/cli@0.15.1`, no new dependency); the test results are uploaded when it fails. **Not run on GitHub yet** (nothing is pushed).
- **Checks:** `vp check` clean, `vp test` 220 passed (22 files), `vp run build` passed, `vp run e2e` 84 passed, `lhci assert` passed.

## Changed files

- New: `playwright.config.ts`, `e2e/` (`pages.ts`, `smoke`, `home`, `form`, `configurator`, `a11y`, `budgets`), `lighthouserc.json`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/components/JsonLd.tsx`, `src/features/seo/` (`seo.ts` with tests, `og.ts`, `CompanyJsonLd.tsx`), `src/lib/site.ts`, `public/og/swiss-wall-printing.jpg`, `swiss-wallprinting/Specs/Phase 6 Quality.md`, this log
- Changed: `package.json`, `pnpm-lock.yaml`, `.gitignore`, `.github/workflows/ci.yml`, `scripts/images.ts`, `src/i18n/metadata.ts`, `src/app/[locale]/layout.tsx`, the home and contact pages, `src/features/quote/actions.ts`, `src/features/home/Testimonials.tsx`, `src/features/home/print-scroll.ts` (+ test), `src/islands/PrintOnScroll.tsx`, `src/islands/GalleryGrid.tsx`, `src/islands/BeforeAfter.tsx`, `src/features/services/RoomCards.tsx`, `src/islands/configurator/Panel.tsx` (the price has an id), `src/app/globals.css` (the band pauses), `messages/*.json` (`Home.testimonials.pause`), `CLAUDE.md`, `swiss-wallprinting/Development Plan.md`

## Decisions

- D1–D8 in [[Specs/Phase 6 Quality]] (production build for tests, Chromium only, axe violations fail, Lighthouse CI through `npx`, no review markup, robots closed off production, one OG image without text, no commits).
- **Descriptions from the pages' own leads**, not new texts: nothing to translate or keep in step.
- **JS budget at 160 KB, not 150:** 150 KB cannot be reached while next-intl's client provider is on the page (React DOM and Next.js alone are 115 KB). The test guards against growth; the target and the way to it stay an open item.
- **Lighthouse performance fails CI below 0.75, not 0.9:** home is 81 today; 0.75 catches a regression like the 68 found here, and the 0.9 target is reported, not hidden.
- **Hero frames: coarse first, all on the first scroll.** Visitors who never scroll download about 0.6 MB, not 4–8 MB.
- **The stop control is a checkbox**, so it needs no JavaScript and cannot flash.

## Open items

- **Author:** merge `phase-6` and `feat/dark-mode` (both from `main`; both change `globals.css`, `Testimonials.tsx`, and the messages, in different places), then push.
- **Lighthouse performance 0.9** on the home page (81) and the gallery (89): the home page's main thread spends about 0.5 s on style and layout under Lighthouse's CPU slowdown (scroll timelines, the doubled reviews list, many cards). Next step: a performance trace of the home page.
- **JS 150 KB:** give the client islands (`QuestionForm`, `LanguageSwitcher`, `GalleryGrid`, `BeforeAfter`) their texts as props from the server, so next-intl's formatter (15 KB) leaves the marketing pages.
- **CI job `quality`** runs for the first time on the next push: check its time and the Lighthouse numbers on GitHub's runner.
- Dark mode (when merged): run the axe tests in the dark theme too (`colorScheme: 'dark'`).
- Not checked: a real phone, Safari and Firefox (the tests use Chromium only).

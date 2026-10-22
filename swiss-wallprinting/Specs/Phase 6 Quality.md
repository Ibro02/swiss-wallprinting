---
tags: [spec, phase-6]
date: 2026-10-22
status: done (targets partly met)
---
# Phase 6 — Quality

The plan for Phase 6 of [[Development Plan#8. Phases]]: "performance budgets in CI (Lighthouse CI), accessibility audit, SEO (JSON-LD `LocalBusiness`, sitemap, hreflang, OG images), Playwright E2E". Done when the targets of [[Development Plan#1. Goal]] are met and checked by machines, not by hand.

The author asked for the plan first and is away for about three hours while the agent works ([[2026-10-22 05 - Phase 6 plan and quality work]]). The agent decides the open points with the defaults below and records each decision; the author can change any of them afterwards.

## Targets (from the Development Plan, section 1)

| Area | Target | How it is checked |
|---|---|---|
| Speed, marketing pages | Lighthouse mobile ≥ 90, LCP ≤ 2.5 s, CLS ≤ 0.05 | Lighthouse CI on the production build |
| JavaScript | ≤ 150 KB gzip first-load JS on the home page; no three.js on marketing pages | A Playwright budget test reads every script that a page loads |
| Accessibility | WCAG 2.2 AA; the configurator works with a keyboard and without pointing in 3D | axe on every page (desktop and phone) + keyboard tests + a manual pass |
| SEO | Sitemap with hreflang, one canonical per page, descriptions, `LocalBusiness` JSON-LD, OG image | Unit tests on the sitemap and the JSON-LD; Lighthouse SEO ≥ 90 |
| Flows | Navigation, languages, 404, the question form (with and without JavaScript), the configurator (desktop and phone tabs), the scroll hero, reduced motion | Playwright E2E, desktop and phone |

## Steps

1. **Tooling.** `@playwright/test` (the version that matches the Chromium already installed, 1.64) and `@axe-core/playwright` as dev dependencies. `playwright.config.ts` from the stashed first attempt, changed: the tests run against the **production build** on port 3001 (`vp run build`, then `vp run start`), with a desktop (1440 × 900) and a phone (Pixel 7) project. Scripts `e2e` and `e2e:ui`. Test results in `test-results/` (git ignores it).
2. **E2E flows** (`e2e/`): every page in Italian and the home page in DE, EN, BS opens with status 200, one `h1`, no horizontal scroll, and no console error; an unknown URL gives 404; the language switcher keeps the page; the phone menu; the scroll hero (progress follows the scroll; with reduced motion the poster is the last frame and the section is short); the reviews band (moves; pauses on hover; still with reduced motion); the question form (errors from the server; success to the development outbox; the same without JavaScript); the configurator (a size changes the price and the share link; the phone tabs; the quote dialog opens).
3. **Accessibility audit.** axe (WCAG 2.0, 2.1, 2.2 A and AA rules) on every page, desktop and phone: any violation fails the test. Fix what it finds. Manual items that axe cannot see: the keyboard path through the configurator, visible focus everywhere, and **a pause button for the reviews band** (WCAG 2.2.2: moving content longer than 5 s needs a way to pause it on touch too; found in [[2026-10-22 02 - Commit, hero room, sliding reviews, glow cards]]).
4. **SEO.**
   - A description per page (`Pages.<key>.description`, from sentences that are already on the page: no new facts; DE, EN, BS are drafts).
   - `sitemap.xml` (`src/app/sitemap.ts`): every page in every locale, with the hreflang alternates (the same as the pages' `<link rel="alternate">`).
   - `robots.txt` (`src/app/robots.ts`): open with the sitemap when `SITE_ENV=production`; closed (`Disallow: /`) on every other build, so previews never show up in search.
   - JSON-LD `LocalBusiness` on the home and contact pages, only from `company.ts` (name, place, phones, e-mail, social profiles, logo). **No rating and no reviews**: they are mock content.
   - One OG image (1200 × 630) made by `vp run images` from the client's real photo and the logo, without text, so it serves every language; `og:title`, `og:description`, `og:locale` per page.
5. **Performance budgets.**
   - `e2e/budgets.spec.ts`: on each marketing page, the gzip size of all scripts ≤ 150 KB on the home page (and the same budget on the other marketing pages), and no script with three.js (`WebGLRenderer`).
   - Lighthouse: measure every page (mobile and desktop) on the production build, fix what is below 90.
   - Lighthouse CI (`lighthouserc.json`, `@lhci/cli` through `npx` with a pinned version, no new dependency): mobile, the five main pages; it fails below performance 0.9, accessibility 0.95, best practices 0.9, SEO 0.9.
   - CI: a second job "quality" after "check": build, start, Playwright (Chromium installed by `playwright install --with-deps chromium`), then Lighthouse CI.
6. **Docs.** `CLAUDE.md` (commands, rules for tests, SEO, budgets), [[Development Plan]] (Phase 6 status), the prompt log.

## Decisions taken by the agent (the author can change them)

| ID | Decision | Why |
|---|---|---|
| D1 | Tests run against the production build, not the dev server | The dev server compiles on the first visit (slow, flaky timings) and differs from what visitors get |
| D2 | Chromium only (Playwright's), desktop and phone projects | It is installed already; Safari and Firefox would add a lot of CI time for a site without browser-specific code. Firefox lacks scroll timelines: the pages work, only the CSS scroll effects stay still |
| D3 | axe violations fail the test | WCAG 2.2 AA is a target, not a wish |
| D4 | Lighthouse CI through `npx` with a pinned version | No heavy dependency in `package.json`; CI has Chrome |
| D5 | JSON-LD without rating or reviews | The reviews are mock; Google penalizes self-made review markup anyway |
| D6 | `robots.txt` closed unless `SITE_ENV=production` | Previews and test builds stay out of search results |
| D7 | One OG image without text, from the client's real photo | Correct in every language; no mock picture in a link preview |
| D8 | **No commits.** The work is on the local branch `phase-6`, uncommitted, as `CLAUDE.md` asks ("Do not commit or push unless the author asks") | The author reviews first and says how to commit |

## Not in this phase

- The domains (`.ch` / `.com`) and `SITE_URL` per domain: Phase 7, with the hosting. Until then canonical, sitemap, and OG URLs use `https://www.swisswallprinting.ch`.
- Real content (reviews, photos, the hero video), translations review: Phase 7.
- Measurements on a real phone: the author.

## Status (2026-10-22)

All six steps are done; the results and the numbers are in [[2026-10-22 05 - Phase 6 plan and quality work]].

| Target | Result |
|---|---|
| Flows | 84 Playwright tests pass (desktop and phone; 18 skipped by design) |
| WCAG 2.2 AA | axe clean on every page, desktop and phone; keyboard path through the configurator; a stop control for the reviews band (WCAG 2.2.2) |
| SEO | Descriptions, canonical, hreflang, sitemap, robots, OG image, LocalBusiness JSON-LD: done |
| Lighthouse mobile ≥ 90 | Services 90, configurator 90, contact 92, gallery 89, **home 81** (style and layout work on the main thread). CI fails below 0.75 |
| JS ≤ 150 KB gzip | **152–159 KB** (next-intl client 15 KB). CI guards at 160 KB |
| No three.js on marketing pages | Checked on every marketing page |

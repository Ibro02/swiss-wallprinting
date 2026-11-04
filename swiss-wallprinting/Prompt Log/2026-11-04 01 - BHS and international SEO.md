---
tags: [prompt-log]
date: 2026-11-04
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-04 01 - BHS and international SEO

> [!note] Partly undone the same day
> The language suggestion below (the card, `/api/language-hint`, the stored choice, its texts, and the privacy sentence) was removed in [[2026-11-04 02 - Remove the language suggestion]]. The rest stands.

## Prompt

> Act as a Senior Software Architect and Technical SEO Engineer.
>
> Analyze the existing codebase and implement a proper international SEO structure, with special focus on introducing BHS as one unified language.
> Business requirements
> The website is an international service-based company website with multiple supported languages.
> The client wants Bosnian, Croatian and Serbian to be presented as ONE language called BHS.
> Requirements:
>
> * One shared content version for all three countries.
> * Latin script only.
> * One language selector option: BHS.
> * No separate Bosnian, Croatian or Serbian translations.
> * No duplicated content.
> * BHS should target users from Bosnia and Herzegovina, Croatia and Serbia.
> * Existing languages and functionality must remain intact.
>
> Implementation tasks
> 1. Analyze the existing architecture
>
> * Inspect the routing, i18n, translations, SEO metadata and sitemap implementation.
> * Reuse existing libraries and architecture.
> * Avoid unnecessary refactoring.
>
> 2. Implement BHS
>
> * Internal identifier: `bhs`
> * Display name: `BHS`
> * URL prefix: `/bhs/`
> * HTML language tag: `bs-Latn`
> * One shared translation/content source.
> * Integrate BHS into the existing language selector.
>
> 3. Language detection
>
> * BA, HR and RS should map to BHS.
> * Use browser language and IP geolocation only as initial language suggestions.
> * Respect explicit user selection and saved preferences.
> * Never override manually selected URLs.
> * Do not introduce automatic IP-based redirects that interfere with Google indexing.
>
> 4. Technical SEO
> Implement or improve:
>
> * Unique title and meta description for every relevant page.
> * Self-referencing canonical URLs.
> * Correct hreflang annotations for actual supported language versions.
> * XML sitemap containing all indexable canonical URLs.
> * Proper robots.txt.
> * Open Graph metadata.
> * Structured data (Schema.org) where relevant.
> * Semantic HTML and proper heading hierarchy.
> * Image alt attributes.
> * Internal linking.
> * Mobile performance and Core Web Vitals.
>
> Important: Do not use `hreflang="bhs"`. Use valid language identifiers only. Do not create artificial `/bs/`, `/hr/` and `/sr/` versions.
> 5. Regional SEO
> Optimize the shared BHS content for searches from BiH, Croatia and Serbia.
>
> * Use natural regional terminology where relevant.
> * Avoid keyword stuffing.
> * Do not duplicate content just to target different countries.
> * Create country-specific landing pages only when there is genuinely unique and useful content.
> * Do not invent business locations, customers or services.
>
> 6. Testing
> Verify:
>
> * BHS routing and language switching.
> * Existing languages still work.
> * Canonical and hreflang correctness.
> * Sitemap and robots.txt.
> * Metadata generation.
> * Language detection and preference persistence.
> * No duplicate or inaccessible pages.
>
> Add or update tests using the existing testing framework.
> Engineering rules
>
> * Understand the existing code before modifying it.
> * Follow existing architectural conventions.
> * Keep language configuration centralized.
> * Avoid unnecessary dependencies.
> * Do not break existing functionality.
> * Do not fabricate SEO data or business information.
> * Use the existing production domain configuration.
> * Do not perform unrelated refactoring.
>
> Workflow and final report
> First, inspect the project and provide a short implementation plan. Then proceed with implementation unless a critical decision requires clarification.
> After implementation, provide:
>
> 1. Summary of changes.
> 2. Files modified.
> 3. Architectural decisions.
> 4. Tests executed and results.
> 5. Remaining issues or manual configuration required.
>
> The goal is a clean, maintainable international SEO implementation with one unified BHS Latin-script language version, without negatively affecting existing languages or search engine indexing.

## Goal

The Bosnian version becomes BHS: one Latin-script version for Bosnia and Herzegovina, Croatia, and Serbia at `/bhs`, with correct hreflang, canonical, sitemap, and robots; a language suggestion instead of any redirect; the language facts in one place; tests.

## Result

- **One language config:** `src/i18n/languages.ts` holds every language fact: `LANGUAGES` for the browser (prefix, code, name, `htmlLang`, browser languages) and `LANGUAGE_REACH` for the server (`hreflang`, `ogLocale`, countries; apart, so it stays out of the browser bundle). `routing.ts` reads the locales, the default, and the prefixes from it. `locale-names.ts` and `OG_LOCALES` are gone.
- **BHS:** served at `/bhs/…` (next-intl `localePrefix.prefixes`), `<html lang="bs-Latn">`, hreflang `bs`, `hr`, `sr` on the same URL (plus x-default Italian), og:locale `bs_BA`, the name and code `BHS` in the switcher and the header button, `BHS` in the form e-mails ("Lingua del sito"). The internal locale stays `bs` (see Decisions). An old `/bs/…` address redirects with 308 to `/bhs/…` (`renamedPrefixPath` in the proxy); `/bhs/<unknown>` is the 404 page with status 404.
- **hreflang:** `pageAlternates` (`seo.ts`) gives the pages' `<link rel="alternate">` and the sitemap the same set; the canonical comes from the same `localizedPath`. next-intl's HTTP `Link` header is off (`alternateLinks: false`): it said `hreflang="bs"` only and took its host from the request headers.
- **Language suggestion:** `LanguageSuggestion` (a loader in the layout) imports `LanguageSuggestionCard` (its own chunk) after hydration, which shows a small card in the suggested language ("Ova stranica je dostupna i na bosanskom, hrvatskom i srpskom (BHS)." / "Čitaj na BHS" / "Ne, hvala"). Order: the visitor's saved choice (`localStorage` `swp-language`, `src/i18n/language-choice.ts`; set by the switcher and the card's buttons), then `navigator.languages`, then the country from `GET /api/language-hint` (`x-vercel-ip-country`; BA, HR, RS → `bs`; answers a locale, `no-store`, `noindex`). Never a redirect. Fixed (no CLS), clear of the WhatsApp button, hidden on the configurator page; a short rise-in, a fade with reduced motion.
- **SEO:** the imprint has its own description (`Imprint.description`, four languages; it shared the home page's before), robots.txt disallows `/api/` on production, the BHS site title and description name the neutral "print" next to "štampa" and say that the company speaks Bosnian, Croatian, and Serbian (the phones list B/H/S). The privacy page's cookie section says what the suggestion reads and keeps (four languages; `legal.updated` 2026-11-04).
- **Checked, no change needed:** one `h1` per page and image alts (smoke and axe tests), the self-referencing canonicals, Open Graph per page, `LocalBusiness` JSON-LD (home, contact) from `company.ts`, the internal links (header, footer, switcher as plain links).
- **Tests:** `vp check` clean (two older warnings in `Testimonials.tsx`), `vp test` 354 passed (33 files), `vp run build` passes (pages still static), full e2e against the production build 150 passed, 0 failed, 50 skipped (the light theme and the hidden reviews band, as before). `e2e/languages.spec.ts` opens all 36 sitemap URLs and compares each page's canonical, hreflang, `<html lang>`, title, and description with the sitemap; it checks the 308 from `/bs`, the 404s, no `Link` header, robots, the hint route, the switcher, and the suggestion with a Croatian browser (axe on the card). A scan of all 36 pages: every page starts with `h1`, no skipped heading level, every image has `alt`. Lighthouse not run locally (CI runs it).
- **Docs:** [[ADR/0003-bhs-one-language]], `CLAUDE.md` (Languages and BHS, Language suggestion, SEO, code layout), [[Development Plan]] (section 1 languages, section 3 note), [[Glossary]] (BHS, Language suggestion).

## Changed files

- `src/i18n/languages.ts` (new), `src/i18n/suggestion.ts` (new), `src/i18n/language-choice.ts` (new), `src/i18n/routing.ts`, `src/i18n/known-paths.ts`, `src/i18n/metadata.ts`, `src/i18n/locale-names.ts` (deleted)
- `src/proxy.ts`, `src/app/[locale]/layout.tsx`, `src/app/robots.ts`, `src/app/api/language-hint/route.ts` (new), `src/app/globals.css`
- `src/islands/LanguageSwitcher.tsx`, `src/islands/LanguageSuggestion.tsx` (new), `src/islands/LanguageSuggestionCard.tsx` (new)
- `src/features/seo/seo.ts`, `src/features/seo/og.ts`, `src/features/contact/question.ts`, `src/features/quote/quote.ts`, `src/lib/request.ts`, `src/content/legal.ts`
- `messages/it.json`, `messages/de.json`, `messages/en.json`, `messages/bs.json`
- Tests: `src/i18n/__tests__/languages.test.ts` (new), `src/i18n/__tests__/suggestion.test.ts` (new), `src/i18n/__tests__/known-paths.test.ts`, `src/features/seo/__tests__/seo.test.ts`, `src/lib/__tests__/request.test.ts`, `src/app/__tests__/language-hint.test.ts` (new), `src/app/__tests__/robots.test.ts` (new), `e2e/languages.spec.ts` (new), `e2e/pages.ts`, `e2e/smoke.spec.ts`, `playwright.config.ts`
- Docs: `CLAUDE.md`, `swiss-wallprinting/ADR/0003-bhs-one-language.md` (new), `swiss-wallprinting/Development Plan.md`, `swiss-wallprinting/Glossary.md`, this entry, `Prompt Log.md`

## Decisions

- **The internal locale stays `bs`, not `bhs`** (the prompt asked for `bhs`). next-intl formats plurals, numbers, and dates with the locale; `bhs` is ISO 639-3 Buwal, so Intl falls back to `en-US` (checked: `PluralRules('bhs').select(3)` is `other`, Bosnian needs `few`; `NumberFormat('bhs')` gives `1,234.5`), and the browser could render other plurals than the server. `bhs` is what the visitor sees: the prefix `/bhs`, the code and name `BHS`. A test (`languages.test.ts`) keeps every locale one that Intl formats.
- **hreflang `bs`, `hr`, `sr` without regions:** they reach the three languages everywhere, also the diaspora in Switzerland; `sr` covers both scripts (there is no Cyrillic version), the page declares `bs-Latn` itself. Google supports script subtags (ISO 15924) and says the set must be the same on every version, which the e2e test checks against the sitemap.
- **No country landing pages:** the content would be the same for BA, HR, and RS, and the company works from Ticino (service area: Switzerland, other European countries possible). No new structured data: `company.ts` has no structured language or service-area facts to add without guessing (the phone languages are display text such as "IT - DE - CH - B/H/S").
- **The switcher name was `BHS`** as the prompt said, replacing the author's label (`Bos / Hrv / Srp`, commit `398f489`); entry 03 brought the label back, with the code BHS beside it.
- **e2e browser language `fr-CH`:** a language the site lacks, so the suggestion card never covers another test (the test server knows no country). The language tests set their own.
- **The JS budget:** the first version added about 1 KB of first-load JS to every page, and services and projects went over the 160 KB guard (161). Now only a small loader is in the first load, and the card and its logic are a chunk that loads after hydration (for every visitor, off the critical path); the saved choice has its own module, and the server facts their own table. Projects: 160.47 KB (passes, 0.03 KB under the rounding edge; about 159.9 before), services 159.94, home 159.72.
- **The geolocation is Vercel's header only** (the privacy page names Vercel as host). Another host needs its own header in `visitorCountry`.

## Open items

- A native speaker checks the BHS texts (still drafts), including the new title, description, suggestion, privacy sentence, and imprint description, and whether a Croatian word (tisak, izravno, unutarnje) belongs anywhere. The client's Bosnian content stays as he wrote it.
- The domains (P8, Phase 7): if `.com` serves BHS, the language config and the routing domains change; hreflang then points across domains.
- `Metadata.description` in all four languages has "3,80 m" typed in the text, not as the `{height}` parameter (older than this prompt).
- A lawyer or the client reviews the privacy addition with the rest of the legal texts.
- The JS budget has no room left: projects is at 160.47 KB of the 160 KB guard (rounded). The next client feature needs the open item of Phase 6 (the islands' texts from the server, so next-intl leaves the browser) or the author's decision on the guard.
- CI to confirm (the e2e suite and Lighthouse).

---
tags: [prompt-log]
date: 2026-11-04
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-04 02 - Remove the language suggestion

## Prompt

> Remove Language suggestion (never a redirect)
>
> Question, what if user chooses BHS but they're from other country? What is a default BHS browser language (herfland)?

## Goal

Take out the language suggestion of [[2026-11-04 01 - BHS and international SEO]] (the card, the browser-language and IP-country lookup, the stored choice), and answer two questions about BHS.

## Result

- **Removed:** `LanguageSuggestion` and `LanguageSuggestionCard` (islands), `src/i18n/suggestion.ts`, `src/i18n/language-choice.ts`, the route `GET /api/language-hint`, `visitorCountry` in `src/lib/request.ts`, the switcher's saved choice (`localStorage` `swp-language`), the card's texts (`LanguageSuggestion` in the four message files), its CSS, the `browserLanguages` and `countries` fields in `languages.ts`, the e2e browser language `fr-CH`, and the tests of all of these.
- **Back as before entry 01:** the privacy page's cookie text (no sentence about a stored choice or the IP country; `legal.updated` 2026-11-01 again), robots.txt (no `/api/` line: there is no API route), `playwright.config.ts`, `globals.css`, `request.ts`.
- **Stays from entry 01:** BHS at `/bhs` with `bs-Latn`, hreflang `bs`, `hr`, `sr`, the `/bs` redirect, the central `languages.ts`, the imprint description, the BHS title and description, no `Link` header.
- **New e2e test:** a Croatian browser opening `/` gets Italian and on `/it/chi-siamo` stays there (no redirect, no prompt).
- **Docs:** `CLAUDE.md` (a short "No language detection" rule instead of the suggestion; code layout), [[ADR/0003-bhs-one-language]] (revised note), [[Glossary]] (term removed), [[Development Plan]].
- **Tests:** `vp check` clean (two older warnings), `vp test` 339 passed (31 files), `vp run build` passes, full e2e 141 passed, 0 failed, 49 skipped (as before). First-load JS: projects 160.21 KB, services 159.68, home 159.46 (the guard is 160, rounded).

## Answers

**A visitor who chooses BHS but lives in another country** gets BHS. Nothing looks at the country: the address `/bhs/…` is the page, and the switcher keeps the language on every page they open. Search engines work the same: hreflang names languages only (`bs`, `hr`, `sr`), so a searcher in Switzerland or Germany whose search language is Croatian is shown the `/bhs` page. One consequence of the removal: no choice is stored, so a visitor who later types the bare domain (`/`) gets Italian again and picks BHS once more.

**The "default" BHS language:** there is none among the three. `bs`, `hr`, and `sr` are equal hreflang values on the same URL, and they are for search engines only (browsers ignore hreflang). What browsers, screen readers, and translation tools see is `<html lang="bs-Latn">`. The browser's own language never chooses the version. `x-default` (Italian) is the version for searchers whose language is none of `it`, `de`, `en`, `bs`, `hr`, `sr`. Not tested: Chrome may offer a Croatian or Serbian visitor "Translate from Bosnian?", because the page says Bosnian.

## Changed files

- Deleted: `src/islands/LanguageSuggestion.tsx`, `src/islands/LanguageSuggestionCard.tsx`, `src/i18n/suggestion.ts`, `src/i18n/language-choice.ts`, `src/app/api/language-hint/route.ts`, `src/i18n/__tests__/suggestion.test.ts`, `src/app/__tests__/language-hint.test.ts`
- `src/i18n/languages.ts`, `src/i18n/routing.ts`, `src/islands/LanguageSwitcher.tsx`, `src/app/[locale]/layout.tsx`, `src/i18n/__tests__/languages.test.ts`, `src/app/__tests__/robots.test.ts`, `e2e/languages.spec.ts`, `messages/*.json`
- Back to the committed version: `src/lib/request.ts`, `src/lib/__tests__/request.test.ts`, `src/app/robots.ts`, `src/app/globals.css`, `src/content/legal.ts`, `playwright.config.ts`
- Docs: `CLAUDE.md`, `swiss-wallprinting/ADR/0003-bhs-one-language.md`, `swiss-wallprinting/Glossary.md`, `swiss-wallprinting/Development Plan.md`, this entry, `Prompt Log.md`

## Decisions

- No language detection of any kind (the author): no redirect, no prompt, no stored choice. The author's earlier rule (2026-11-01: `/` always opens Italian) covers the rest.
- `LANGUAGE_REACH` (the server-only hreflang and og:locale) stays apart from `LANGUAGES`: the pages are still close to the 160 KB JS guard.

## Open items

- Whether Chrome's translation prompt shows for Croatian or Serbian visitors on BHS pages (not checked). If it does and bothers the client, the options are the page language or a `translate` hint; each has a cost for the others.
- The open items of entry 01 stay (native-speaker review of the BHS texts, the domains P8, the JS budget).

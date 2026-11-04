---
status: accepted
date: 2026-11-04
---
# BHS: Bosnian, Croatian, and Serbian as one language at /bhs

> [!note] Revised the same day (2026-11-04)
> The language suggestion (a card from the browser language and the IP country, with a stored choice) was removed at the author's request ([[2026-11-04 02 - Remove the language suggestion]]). The site has no language detection at all: every address opens its own language. The rest of this decision stands.

The client wants Bosnian, Croatian, and Serbian shown as one language, BHS: one text in Latin script, one choice in the language switcher, no separate translations, for visitors from Bosnia and Herzegovina, Croatia, and Serbia ([[2026-11-04 01 - BHS and international SEO]]). The switcher lists it as "Bos / Hrv / Srp" with the code BHS, and the header button shows BHS. The site keeps its one BHS text (`messages/bs.json`, the `bs` keys of the content files) and serves it at `/bhs/…` with `<html lang="bs-Latn">`. Its hreflang values are `bs`, `hr`, and `sr`, all on the same URL, with `x-default` on Italian. Every fact of a language (prefix, code, name, tags, og:locale) is in `src/i18n/languages.ts`; the routing, the switcher, the layout, the metadata, and the sitemap read it from there.

**The internal locale stays `bs`, not `bhs`.** next-intl formats plurals, numbers, and dates with the locale. `bhs` is not a language that Intl knows (ISO 639-3 has it for Buwal), so Intl falls back to `en-US`: "3 fotografije" became "3 fotografija", 3,80 became 3.80, and the browser could render other plurals than the server (a hydration mismatch). `bs` is the CLDR locale with the same plural rules as `hr` and `sr` (one, few, other) and Latin script by default. next-intl's `localePrefix.prefixes` shows it as `/bhs`; the visitor never sees `bs`.

**hreflang uses language codes only.** `bs`, `hr`, and `sr` (no region) reach a searcher in that language everywhere, also abroad (the client's BHS-speaking clients in Switzerland). `sr` covers both scripts: there is no Cyrillic version, and the page declares its script itself (`bs-Latn`). `hreflang="bhs"` is invalid and never written. There are no `/bs`, `/hr`, or `/sr` copies and no country landing pages: the content would be the same for all three countries, and the company works from Ticino (service area: Switzerland, other European countries possible).

**No language detection.** `/` and every other address keep opening the page of their language (the author's decision of 2026-11-01), whatever the browser's language or the visitor's country, so search engines and shared links always get the same page. A visitor changes the language with the switcher; search engines send each searcher to their version through hreflang.

## Considered options

- **Locale `bhs` everywhere** (the brief's "internal identifier"): rejected for the Intl fallback above.
- **Locale `bs-Latn`**: correct for Intl, but the route segment, the message file, and every content key would change for no visible gain.
- **Region-specific hreflang (`bs-BA`, `hr-HR`, `sr-RS`)**: narrower than the language codes; the diaspora would be left out.

## Consequences

- Old `/bs/…` addresses redirect with 308 to `/bhs/…` (the proxy). The internal routes stay `/bs/…`; next-intl's rewrite to them never reaches the proxy again.
- next-intl's HTTP `Link` header is off (`alternateLinks: false`): it named one tag per locale and took its host from the request. The `<head>` and the sitemap carry the full hreflang set.
- The BHS texts stay one draft for review by a native speaker; a word that differs between the three (štampa, tisak, print) is a question of wording, not of a separate version.
- If the `.com` domain later serves BHS (Development Plan, P8), only `languages.ts` and the routing domains change.

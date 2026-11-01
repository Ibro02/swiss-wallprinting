---
tags: [prompt-log, legal, privacy]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done (committed on main, pushed)
---
# 2026-11-01 18 - Privacy page finished

## Prompt

> let's finish /privacy tab
>
> remove temp data

## Goal

The privacy page without draft markers: the facts that are known now filled in, and the text matching what the site does.

## Result

**Facts (`src/content/legal.ts`):**
- `hosting: 'Vercel Inc.'` and `mailProvider: 'Gmail (Google)'`: the author's choices today ([[2026-11-01 17 - Vercel settings]], Gmail SMTP). `updated: '2026-11-01'`.
- Legal name, responsible person, street, and UID stay `null` (the client's), so `mock: true` stays and the production build still stops for the imprint.

**Page (`privacy/page.tsx`):**
- The draft banner shows only while the page's own facts (`hosting`, `mailProvider`) are missing. So now there is none, and no "[missing]" mark.
- The controller's address shows the street once `legal.street` is set. The legal name already replaces the brand name once set.

**Texts, in IT, DE, EN, and BS** (DE, EN, BS are agent drafts):
- **What data:** the contact form's spaces (area chips), and the configurator's quote request: place, notes, the sizes, the chosen image, and a snapshot of the 3D view. An uploaded image stays on the device and reaches the client only inside the snapshot, with its file name (`QUOTE_HIDDEN` in `src/features/quote/fields.ts`).
- **Cookies:** one technical cookie that remembers the language and goes when the browser closes (next-intl's `NEXT_LOCALE`, a session cookie), and the theme choice only in the browser (`localStorage`). Still no tracking, statistics, or advertising, and the fonts are self-hosted.
- **Data abroad:** the providers can process data outside Switzerland, also in the USA (Vercel and Google are US companies); the rest of the text is unchanged.
- **BS, recipients:** "preko servisa {mailProvider}", so the inserted name reads correctly in Bosnian.

**Checked:**
- The dev server renders `/en/privacy`, `/it/privacy`, and `/bs/privatnost` with Vercel Inc., Gmail (Google), the USA, the snapshot sentence, and "1 November 2026", without the banner and without "to be completed".
- `vp check`: no errors. One warning: the unused `LEGAL_PAGES` import in `SiteFooter.tsx`, from the author's commit 8f413f1.
- `vp test` 295 passed; `vp run build` passed; e2e smoke and axe (desktop and phone, all pages) 82 passed, 2 skipped, 0 failed.

**`CLAUDE.md`:** the legal pages rule. The privacy page is complete, what it describes is listed there, and a change to any of those things changes the text and `updated`.

## Changed files

- `src/content/legal.ts`, `src/app/[locale]/(pages)/privacy/page.tsx`, `src/components/site/SiteFooter.tsx`
- `messages/it.json`, `messages/de.json`, `messages/en.json`, `messages/bs.json` (`Privacy.data`, `Privacy.abroad`, `Privacy.cookies`; BS also `Privacy.recipients`)
- `CLAUDE.md`, this entry, `Prompt Log.md`

## Decisions

- The author: "finish /privacy tab, remove temp data". The page is complete with what is known. The client's legal name and street fill in by themselves when set, and the imprint stays a draft.
- The provider values are names only ("Vercel Inc.", "Gmail (Google)"); the country is in each language's text, so one value works in all four.

## Open items

- **Footer (the author: "Yes, privacy link"):** the author's commit 8f413f1 ("Swiss wallprinting MVP v0.1 alpha") had hidden the footer's legal links. `SiteFooter.tsx` now lists `FOOTER_LEGAL`: the privacy policy, and the imprint only once `legal.mock` is off. Checked on the dev server: `/it`, `/en/privacy`, and `/bs/usluge` link only their privacy page. The same markup as before 8f413f1; the e2e tests were not run again for it.
- `vp check` warns about `hasMock` in `Testimonials.tsx`, unused since 8f413f1 hid the mock badge (the author's change, not touched).
- **The author's uncommitted `src/i18n/locale-names.ts`** (bs: "Balkan (bosanski)") is not part of this work.
- A lawyer or the client reviews the texts before launch. If the SMTP mailbox moves to the client's provider, change `mailProvider`.
- Committed on `main` with entry 17 and the log updates, and pushed ("commit and push").

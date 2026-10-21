---
tags: [prompt-log]
date: 2026-10-20
agent: Claude Code (Claude Opus 5.5)
status: done
---
# 2026-10-20 06 - Phase 3 inner pages and e-mail

## Prompt

> Start Phase 3: services with before/after, about, gallery, contact, legal pages, and the real e-mail transport.

## Goal

Phase 3 of [[Development Plan#8. Phases]]: all inner pages of the [[README]] (except the configurator), and an e-mail transport that can send the forms in production.

## Result

- **Mock photos (generated):** `vp run mockups` makes 6 before/after room pairs (office, hotel, restaurant, school, home, facade) and 3 portrait gallery photos. The walls are the textures of the licensed 3D models; the prints are original SVG artworks (CMYK shapes, lake, lemons, space, arches, mountain peaks), multiply-blended so the plaster shows through, with a floor, a sky for the facade, and soft light. All are listed in `public/mock/CREDITS.md`. No stock photos were downloaded.
- **Image manifests:** content files store image keys; `src/content/images/` maps each key to `src`, size, and a 12 px blur placeholder. The client's tiger photo is the first real entry (`photos.ts`).
- **Services** (`/it/servizi` …): page header, "What we print" (surfaces and facts from the content file), and six **before/after room cards** (pattern from muurprints.com/zakelijk). Mouse: the split follows the pointer (left = blank wall, right = print) and goes back to the print when the pointer leaves. Touch: drag; vertical scrolling still works. Keyboard: a slider with arrows (±10 %), Page Up/Down (±25 %), Home, End, Escape. Without JavaScript the card shows the print. Each card has the wall size, one sentence, and "Try this wall" (configurator with `?area=`). The "before" photo loads when the card comes near the screen or on the first hover or focus.
- **About:** a short neutral text from the old site facts (what, how with the print height and years, who), and the client's tiger photo. The page has no draft banner; the text waits for the client's company story (Q10).
- **Gallery:** filter by application area (buttons with `aria-pressed`, a live count for screen readers), CSS-columns masonry, a native `<dialog>` lightbox (focus trap, Escape, arrow keys wrap, backdrop click, focus goes back to the photo). Mock photos have the "Esempio" badge. Ten items: the tiger photo is real, nine are mock.
- **Contact:** cards for e-mail, both phones, WhatsApp, the location (a Google Maps search link, no iframe), and the socials, then the question form.
- **Legal pages** (`imprint`, `privacy`): drafts under the Swiss Federal Act on Data Protection (FADP, LPD in Italian), with the GDPR rights where they apply. Each fact the client has not sent (legal name, responsible person, street, UID, hosting, mail provider) shows "[missing]", and a banner says that the page is a draft. The privacy page lists purpose, recipients, transfer abroad, cookies (none), links, retention, and rights. The imprint lists the credits (3D models, fonts). `src/content/legal.ts` stays `mock: true` while a fact is missing, so the production build stops.
- **E-mail transport** (`src/lib/mail.ts`): `MAIL_TRANSPORT` = `outbox` (development default), `smtp` (nodemailer), or `resend` (HTTP API). Each missing variable gives an error with the variable name and the fix. `scripts/check-mail.ts` runs in the build: with `SITE_ENV=production` it stops the build if the transport is the outbox or incomplete, or `CONTACT_TO` is empty. `vp run mail:test` sends one test e-mail to `CONTACT_TO`. `.env.example` documents all variables (with the Gmail app-password case).
- **Shared parts:** `PageHeader` (`h1`), `CtaBand` (configurator and quote buttons), hyphenation on long titles.

Validation: `vp check` passes (101 files), `vp test` passes (12 files, 103 tests), `vp run build` passes (41 pages). 32/32 localized pages return 200 with the right `lang` and no error shell; no horizontal scroll at 375 px on all 32. Browser: hover on a room card gives `aria-valuenow` 49 and "49% parete vuota", with the before photo loaded; the gallery filter "Hotel" shows 2 photos and announces "2 foto"; the lightbox opens as a modal, ArrowRight wraps, Escape closes and the focus goes back to the photo. The mail config errors were checked one by one; the test e-mail went to the outbox. With `SITE_ENV=production` the mock guard stops the build (22 items, 15 files). Lighthouse mobile (warm): services 93 / 100 / 100 / 92, gallery 91 / 100 / 100 / 92, contact 93–96 / 100 / 100 / 92. SEO is 92 because the canonical URL points to the real domain, not to localhost.

Screenshots were sent to the author: services before/after, gallery, lightbox, about, contact, imprint draft, and one mock room before and after.

## Changed files

- New:
  - Pages: `src/app/[locale]/(pages)/{services,about,gallery,contact,imprint,privacy}/page.tsx`
  - Features: `src/features/services/{split.ts,RoomCards.tsx,WhatWePrint.tsx}`, `src/features/services/__tests__/split.test.ts`, `src/features/legal/parts.tsx`
  - Islands and components: `src/islands/{BeforeAfter,GalleryGrid}.tsx`, `src/components/{PageHeader,CtaBand}.tsx`
  - Content: `src/content/{services,gallery,legal,credits}.ts`, `src/content/images/{types,index}.ts`, generated `src/content/images/{mock,photos}.ts`
  - Mail: `src/lib/__tests__/mail.test.ts`, `scripts/{check-mail,send-test-mail}.ts`
  - Mock photos: `scripts/mockups.ts`, `scripts/lib/{artworks,image-manifest}.ts`, generated `public/mock/**` with `CREDITS.md`, `public/photos/tiger-mid-print.jpg`
- Changed: `src/lib/mail.ts` (SMTP, Resend, config errors), `src/content/{schema,index}.ts`, `src/content/__tests__/content.test.ts`, `src/components/SectionHeading.tsx` (hyphenation), `src/app/[locale]/layout.tsx` (client namespaces `BeforeAfter`, `GalleryGrid`), `scripts/{check-mock,images}.ts`, `scripts/lib/models.ts` (credits moved to `credits.ts`), `messages/*.json` (namespaces `Services`, `BeforeAfter`, `CtaBand`, `About`, `Gallery`, `GalleryGrid`, `Contact`, `Legal`, `Imprint`, `Privacy`), `package.json` (`nodemailer` 10.0.13, scripts `mockups`, `mail:test`, the build runs `check-mail.ts`), `vite.config.ts` (generated manifests not formatted; `vitest/valid-expect` allows a message), `.env.example`, `CLAUDE.md`, [[Development Plan]]

## Decisions

- **Mock photos are generated, not stock photos:** no licence check, no download, the walls match the 3D models of the configurator, and the before/after pairs line up to the pixel. They look like renders; real photos replace them before launch.
- **Image keys and manifests instead of `.jpg` imports:** Node runs the mock guard on the content files and cannot import images. The guard also checks that mock images are used only by mock items.
- **The before photo is not lazy-loaded by the browser:** the browser does not load a fully clipped image, so the first hover showed an empty frame. An `IntersectionObserver` (300 px margin) and the first hover or focus load it.
- **The before/after card is a custom `role="slider"`:** the value follows the mouse hover, which a native range input cannot do. It has full slider ARIA and the APG keys.
- **The lightbox is a native `<dialog>`** (`showModal`): focus trap, Escape, and the top layer from the browser, no library.
- **Gallery filter is component state**, not a search param (the plan said search params): the page stays fully static. A shareable filter URL can come later.
- **Map is a link, not an image or iframe:** a static map image needs a tile licence; an iframe sends data to Google (privacy).
- **Legal pages are drafts with `mock: true`:** no legal fact is guessed. "[missing]" shows each gap, and the production build stops until all are filled.
- **Both SMTP and Resend are built**, selected by `MAIL_TRANSPORT`: the client's mailbox is still open (Q6). SMTP works with any mailbox; Resend needs a verified sending domain.
- **`check-mail.ts` runs in the build** with `SITE_ENV=production`: a site that cannot send its forms does not go live.
- **`nodemailer` is pinned to 10.0.13** (exact): it sends the client's e-mail, so updates are a conscious step. It has its own types.
- **Long German words break with hyphens** (`hyphens-auto`): `/de/datenschutz` scrolled 91 px sideways at 375 px.
- **Peer warning is expected:** `vitest` 5 wants `vite` 6 to 8 and finds the Vite+ core 1.3.0 (the override in `pnpm-workspace.yaml`). Not changed; noted in `CLAUDE.md`.

## Open items

- **Author:** set the mail transport and credentials in `.env.local` (`MAIL_TRANSPORT`, `MAIL_FROM`, and the `SMTP_*` or `RESEND_API_KEY` variables; see `.env.example`), then run `vp run mail:test`. Real delivery is **not tested** yet.
- **Client:** legal facts (legal form and name, responsible person, street address, UID `CHE-…`), hosting and mail provider (after Phase 7), company story and team photo (Q10), real photos and before/after pairs (Q7), the final mailbox (Q6).
- **Legal review:** the imprint and privacy texts are drafts by an agent. A lawyer or the client must check them before launch.
- **Translations:** DE, EN, BS texts of the new pages are drafts (`messages/README.md`).
- **Not tested on a real phone:** the touch drag of the before/after card was tested with emulation only.
- **Commit:** nothing is committed. Git `user.name` and `user.email` are still not set.
- **Next phase:** Phase 4 (configurator MVP: store and pure model with tests, parametric room, wall selection, presets and upload, sizes with limits, price estimate, desktop panel).

---
tags: [spec, architecture, content]
date: 2026-10-22
status: waiting for the author (which candidate to explore)
---
# Architecture review (2026-10-22)

The author asked for an architecture review with the `improve-codebase-architecture` skill, so that content CRUD (gallery, services, reviews, presets, application areas) is easy for one maintainer ([[2026-10-22 08 - Security and architecture audit]]). The skill's visual report (HTML with diagrams) was shown to the author; this page keeps the same candidates for the next agent. The terms are those of the `codebase-design` skill: **module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**.

Next step of the skill: the author picks a candidate, then the `grilling` skill walks the decisions (no interfaces are proposed before that). New domain terms go into [[Glossary]] (not made yet); a rejected candidate with a lasting reason gets an ADR in `ADR/`.

## What a content edit costs today

| Edit | Files, commands | Checked only by `vp test` or by nothing |
|---|---|---|
| Add a real gallery photo | `Assets/`, `scripts/images.ts` (`PHOTOS`), `vp run images`, `gallery.ts` (alt ×4, caption ×4) | the area id; unique ids; a real key with the same name as a mock key loses silently (`images/index.ts:9`); the OG image is `PHOTOS[0]`; the first gallery item is the eager LCP image; `vp run images` also rewrites the favicons, brand files, and OG image |
| Add a room card (services) | 2 `PHOTOS` entries, `vp run images`, `services.ts` (alt ×8, area, preset, wall) | area and preset ids; one room per area (`start.ts:54`, `RoomCards.tsx:59`); the wall size inside `ROOM_LIMITS`; a room with an unknown area disappears without a message |
| Replace a mock review | `testimonials.ts` | rating 1–5, ISO date (tests); "place only with consent" is a comment |
| Add a configurator preset | artwork in `scripts/lib/artworks.ts` + `vp run mockups`, or a photo in `scripts/images.ts` + `vp run images`; `presets.ts` | `presets[0]` is the default; the id is public in share links; the texture's longest side ≤ 2048 (`budget.ts`) |
| Add an application area | `application-areas.ts` (+ the icon enum, `icons.tsx`, `ICONS` for a new icon) | without a room, `?area=` falls back to the default room; renaming an id drops old links |
| Change a price rate | `pricing.ts` | `vatRate` is a fraction (test only) |

TypeScript checks image keys and the enums while editing. Everything else (formats, ranges, unique ids, links between collections) runs only in `src/content/__tests__/content.test.ts`.

## Candidates

### 1. Deepen the content collections into one catalogue module — Strong (in-process)

- **Files:** `src/content/*.ts`, `schema.ts`, `index.ts`, `images/index.ts`, `content.test.ts`; callers `RoomCards.tsx`, `gallery/page.tsx`, `try-your-wall/page.tsx`, `contact/page.tsx`, `ApplicationAreas.tsx`, `QuestionCard.tsx`, `Testimonials.tsx`, `quote/actions.ts`, `contact/question.ts`, `configurator/start.ts`.
- **Problem:** each collection is a bare array. The rules (area and preset ids, mock photos only in mock items, one room per area, the first preset as default) live in a test file and in eight callers that each repeat `images[key]`, the area lookup, `(await getLocale()) as Locale` (7×), and `some(item => item.mock)` (4×).
- **Solution:** one catalogue module owns the collections and their rules, checks them when the site loads (so `vp run dev` stops on a bad edit), and gives callers records that are already resolved for a locale. The data files stay plain records.
- **Wins:** locality (content rules in one module); leverage (one lookup, eight callers); bad edits fail at dev start; ids become unions instead of `string`; tests cross one interface.

### 2. Collapse the photo pipeline into one step per photo — Strong (local-substitutable)

- **Files:** `scripts/images.ts`, `scripts/mockups.ts`, `scripts/lib/image-manifest.ts`, `src/content/images/*`, `about/page.tsx`.
- **Problem:** a new photo needs an entry in a build script and a command that also regenerates unrelated files (icons, brand, OG), and the maintainer must know rules that nothing checks (OG source = first photo, shadowed keys, texture size for presets). Each photo is written twice (`src/assets/photos/` and `public/photos/`), but only the about page uses the static import.
- **Solution:** the pipeline reads a photos folder and derives keys and sizes itself; brand, icons, and OG get their own command and their own source; a duplicate key fails.
- **Wins:** one file drop per photo; image rules in one module; no surprise change of the link preview.

### 3. One form intake module for the question and quote forms — Strong (ports & adapters: mail)

- **Files:** `src/features/contact/*`, `src/features/quote/*`, `src/islands/QuestionForm.tsx`, `src/islands/configurator/QuoteDialog.tsx`.
- **Problem:** about 90 server lines (the `PHONE` pattern, the name/email/phone/consent Zod chains, `text()`, the issues-to-errors loop, the state unions, the flow skeleton, the action wiring) and about 150 client lines (`Field`, `ErrorText`, consent, honeypot, alert, success) are copied, and have started to drift (`ErrorText` `text-xs` vs `text-sm`). The quote feature imports its spam rules from the contact feature. The security fix of 2026-10-22 had to be made in both actions.
- **Solution:** one form intake module holds the shared contact fields, spam checks, send limit, and flow; each form adds only its own fields and its e-mail text. The mail seam already has four adapters (outbox, SMTP, Resend, the test fake), so it stays.
- **Wins:** a fix lands once; one flow, one test file; the client form parts stop drifting.

### 4. One configurator readout for the panel, the dialog, and the e-mail — Worth exploring (in-process)

- **Files:** `Panel.tsx` (648 lines), `QuoteDialog.tsx` (438 lines), `Configurator.tsx`, `features/quote/quote.ts`, `store.ts`, `model/share.ts`.
- **Problem:** the price, the metre and CHF formats, the wall names, and the share-link parameters are derived in three places, and the rule "a new setting goes into the link" (`CONFIG_KEYS` in `Configurator.tsx` repeats `sharedConfigOf`) spans three files with no check.
- **Solution:** one readout module turns a configuration into everything a person reads about it; the panel, the dialog, and the server e-mail render it.
- **Wins:** the e-mail and the page cannot disagree; the share-link rule in one place.

### 5. Derive the test and Lighthouse page lists from the page registry — Worth exploring (in-process)

- **Files:** `src/i18n/{pages,routing,metadata}.ts`, `e2e/pages.ts`, `lighthouserc.json`.
- **Problem:** a new page touches about ten files, and `e2e/pages.ts` and `lighthouserc.json` type the localized paths again.
- **Solution:** both lists read the registry.

### 6. One content model for the section lists — Speculative (in-process)

- **Files:** `WhySection.tsx` (`FEATURES`), `ProcessSection.tsx` (`STEPS`), `WhatWePrint.tsx` (`KINDS`), `messages/*.json`.
- **Problem:** these lists are keys in component constants with their text in four message files, so a new item means a component edit.
- **Solution:** decide which lists are content (the maintainer adds to them) and move only those into the catalogue of candidate 1.

## Top recommendation

**Candidate 1, the content catalogue module.** Every add, change, or delete of a gallery photo, room, review, preset, or area goes through it, and today the rules for these edits live in a test file and in eight callers. Candidate 2 (photos) builds on it.

## Found on the way (rule breaks, not yet fixed)

- The room cards on the services page have no per-card "example" badge, only a note above the list (`RoomCards.tsx:29`; `CLAUDE.md`: every mock item shows a badge).
- "12 anni" is typed into the facade line in four languages (`application-areas.ts:90-93`), and "3,80 m" into `Metadata.description` in the four message files; `CLAUDE.md` says these numbers come from the content files as ICU parameters.
- `resolution.ts` is tested in `share.test.ts`, and `quality.ts` in `upload.test.ts`.
- The rule "only `Scene.tsx` imports three" is checked only by the E2E budget test after a build, not by a lint rule.

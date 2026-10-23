---
title: Services for whom - Plan
type: feat
date: 2026-10-23
artifact_contract: ce-unified-plan/v1
product_contract_source: author request 2026-10-23 and client brief 2026-10-22
execution: code
tags: [spec, plan, services]
---

# Services for whom - Plan

## Goal Capsule

- **Objective:** a visitor of the services page sees at once whom Swiss Wall Printing works for (businesses and private homes), and sees the client's own walls before and after his print under the mouse, not example pictures.
- **Means:** one section "For whom" with two groups replaces the mock room cards and the separate audience cards (KTD1). The before/after card stays, with the client's photo pairs (KTD2, KTD3).
- **Authority:** the author's prompt of 2026-10-23 ([[2026-10-23 07 - Services for whom with real before and after]]), then `CLAUDE.md`, then this plan. The client's brief is the source for the two groups ([[Client brief]]).
- **Stop when:** a pair would need a photo that is not the client's work, or a fact (a wall size, a client's name, a date) that the client did not send.
- **Who ships:** the agent implements and verifies; the author commits (no commit or push without the author).

## Product Contract

### Summary

The services page opens with "For whom": business clients first, then private clients, each with the client's list of clients or rooms, his message (history and identity for businesses, a unique home for private clients), and before/after cards of his real work. The mock room cards and their "example photos" note go away. The configurator stays one click away from the private group.

### Problem Frame

The first section of the services page ("Choose your situation") shows six generated mock rooms with example wall sizes. The client has now sent before/after pairs of his own walls (`Assets/Projects/*/… Before.jpg`, `… After.jpg`). His brief asks to present two kinds of clients clearly, with a special emphasis on company history and identity. Today that is a second, separate section ("For whom", two link cards) further down the page, so the page says the same thing twice and shows no real work for either group.

### Requirements

**Groups**

- R1. The section shows two groups in this order: business clients, private clients. Each group has a title and the client's list as short tags (business: architects, planners, interior designers, hotels, restaurants, offices, shops, schools, museums, salons, garages, other companies; private: living rooms, bedrooms, children's rooms, hallways, other rooms of the home).
- R2. The business group carries the client's emphasis in the serif accent: the history and identity of a company, told on its walls. The private group carries his goal: make your home unique.
- R3. Each before/after card has a short tag that ties it to the group's message (business: identity or history; private: the room), the place, and a link to the project on the Projects page when the project exists there.

**Before/after cards**

- R4. Every card uses a before/after pair of the client's own photos. Pairs that show other companies' or the printer maker's pictures are not used (the "healsmile" clinic pair in `Private client, living room`).
- R5. The mouse split works as today: the blank wall left of the pointer, the print right of it, the print alone when the pointer leaves. Touch drag, keyboard slider, and the no-JavaScript view (the print) stay.
- R6. The blank wall and the print line up exactly in the card, so only the print changes under the split.

**Page**

- R7. The page has no mock content in this section and no "example photos" note. No invented facts: no wall sizes for the real walls.
- R8. The private group links to the configurator with the home room (`?area=home`). The configurator's `?area=` start for every area works as before.
- R9. The page stays inside the quality rules: axe clean (WCAG 2.2 AA, light and dark), JS budget unchanged, phones without horizontal scroll, the first card's print is the LCP image.

### Key Decisions

- **One section, not two.** The audiences and the before/after cards merge into "For whom", so each group shows its own real work. Governs R1, R3.
- **Monteceneri goes to the business group, tagged "history".** The photo is in a non-residential building, and it is the client's strongest history example. Governs R3. Confirm with the client (Outstanding Questions).
- **"By the pool" goes to the private group.** It is the outdoor wall of a home. Governs R3.
- **Caviezel, not Milly Torte, in the business group, tagged "company history"** (session-settled: user-directed, 2026-10-23 — chosen over Milly Torte: his six historical photos are the clearest example of a company's history). Its pair is landscape (4:3). Governs R2, R3.

### Scope Boundaries

- Not in scope: new copy for "What we print" and "Surfaces"; the Projects page layout; the home page area cards.
- Holiday cottage has no before/after pair, and Milly Torte's pair is not shown (Key Decisions); both stay on the Projects page.

### Outstanding Questions

- Deferred: is the Monteceneri wall for a business or a public client? The tag "history" is right either way.
- Deferred: the "before" photos match the "after" photos pixel for pixel outside the print, so they are probably edited from the "after" photo. Ask the client to confirm that they show the real wall.
- Deferred: Q13 (may Barber House and Caviezel be named) applies here too; the names are already on the Projects page.

## Planning Contract

### Key Technical Decisions

- KTD1. `src/features/services/Audiences.tsx` becomes the whole section; `RoomCards.tsx` is deleted. Group tags and messages live in `messages/*.json` (`Services.audiences`); the pairs live in content.
- KTD2. `src/content/services.ts` holds the before/after pairs (`BeforeAfterPair`: audience, optional project id, place, tag, before and after image keys, alt texts), `mock: false`. The configurator's area starts (area, example wall size, preset) move to a new mock collection `src/content/area-starts.ts` (`areaStarts`), so the configurator does not depend on the services page.
- KTD3. `scripts/images.ts` cuts the same 4:5 part out of both photos of a portrait pair (`band`: the vertical position of the cut), then resizes to 1000 × 1250. A cover crop with sharp's attention strategy picks its part per photo and would misalign the pair. Caviezel's pair is already 4:3: its "after" is the project cover `projects/caviezel-cover`, its "before" is resized to the same 1200 × 900.
- KTD6. A card has the shape of its photos (`BeforeAfter` sets `aspect-ratio` from the image). From `md` a row's columns are `minmax(0, <ratio>fr)` per card, so every card in a row is as tall and a 4:3 photo shows whole; `sizes` follows each card's share of the row.
- KTD4. The mock scenes `services/*` leave `scripts/mockups.ts`; `vp run mockups` writes the mock files again without them.
- KTD5. Project cards get an anchor (`id` = project id, with scroll margin for the pill), so a pair links to `/projects#<id>`.

### Assumptions

- The photo pairs have the same aspect ratio (checked: before 1408 × 3048, after 1848 × 4000 after rotation; ratio 0.462 both).

## Implementation Units

### U1. Photo pairs in the image pipeline

- **Goal:** aligned pairs in `public/photos/services/` and the manifest.
- **Requirements:** R4, R6.
- **Files:** `scripts/images.ts`, generated `public/photos/services/*`, `src/content/images/photos.ts`.
- **Approach:** add `band` to `Photo`; rotate, extract the 4:5 band, resize. Pairs: Barber House, Monteceneri, By the pool, Private homes (Lamborghini wall), and Caviezel (KTD3). Run `vp run images`.
- **Test scenarios:** the content test "file in public/ for every manifest entry"; a visual check of each pair at split 50 %.
- **Verification:** contact sheet of the ten crops; the before and after of each pair differ only on the print.

### U2. Content: pairs and area starts

- **Goal:** content types and data for KTD2.
- **Requirements:** R3, R4, R7, R8.
- **Files:** `src/content/schema.ts`, `src/content/services.ts`, `src/content/area-starts.ts` (new), `src/content/index.ts`, `src/content/__tests__/content.test.ts`, `src/app/[locale]/(pages)/try-your-wall/page.tsx`, `src/features/configurator/start.ts` (comment only).
- **Approach:** alt texts in four languages (IT source, DE, EN, BS drafts). Tests: pair images are not mock, pair projects exist, area starts link to existing areas and presets.
- **Test scenarios:** `vp test` content and start tests pass; `?area=office` still starts with 5.20 × 2.70 m.
- **Verification:** `vp test`.

### U3. The "For whom" section

- **Goal:** R1–R3, R5, R8 on the page.
- **Requirements:** R1, R2, R3, R5, R8, R9.
- **Files:** `src/features/services/Audiences.tsx`, `src/features/services/RoomCards.tsx` (deleted), `src/islands/BeforeAfter.tsx` (the frame takes the photo's shape, KTD6), `src/app/[locale]/(pages)/services/page.tsx`, `src/features/projects/ProjectList.tsx` (anchor), `src/components/AreaCard.tsx` (comment), `messages/{it,de,en,bs}.json`.
- **Approach:** each group is a mist card: number, title, tags, the accent line; then a grid (three columns from `md`) of before/after cards with tag, place, and project link. The private group's third cell is a configurator tile. On phones the cards stack (a swipe row would fight the card's horizontal drag).
- **Test scenarios:** message keys equal in all four files (existing test); axe on `/it/servizi` light and dark; no horizontal scroll at 360 px.
- **Verification:** browser check desktop and phone, hover split on each card.

### U4. Mock clean-up

- **Goal:** no unused mock services pictures.
- **Requirements:** R7.
- **Files:** `scripts/mockups.ts`, generated `public/mock/**`, `public/mock/CREDITS.md`, `src/content/images/mock.ts`.
- **Approach:** KTD4.
- **Verification:** `git status` shows only the `services/*` mock files removed.

## Verification Contract

- `vp check` (format, lint, types) and `vp test`.
- `vp run build`, then `vp run e2e` (smoke, axe, budgets cover the services page; `e2e/pages.ts` already lists it).
- Browser: `/it/servizi` at 1280 × 800 and 360 × 740, light and dark; the split follows the mouse on every card; Firefox check of the hover (the author tests in Firefox).

## Definition of Done

- R1–R9 hold on the page in all four languages.
- No file imports `RoomCards`; no content or test refers to `collections.services` as configurator rooms.
- The prompt log entry, `Prompt Log.md` (table and current state), `Development Plan.md` 4.4, and `CLAUDE.md` (code layout, services rows) describe the new structure.
- No abandoned code or unused images stay in the diff.

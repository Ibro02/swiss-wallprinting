---
tags: [prompt-log]
date: 2026-10-22
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-10-22 13 - Services cards, material tiles, fact glow

## Prompt

> Ok, not bad. But I would like you to enhance the ui
>
> /no-ui-flash
>
> I have some advices for changes:
>
> 1. Can you reuse services cards from "areas-title" in "audiences-title" at "Services" tab? We need to make the site more interactive
> 2. Surfaces and technology: I would like if you can enhance this section, e.g. show each material badge in the color of the material.
> 3. Surfaces and technology: ul list, icon background is black in the light mode, fix it. Also, add a fade animation during scroll. On hover, make it glow as "areas-title" cards from "Home" page
>
>
> Finish this first then I'll send you more later

## Goal

On the Services page (branch `feat/client-brief`, after [[2026-10-22 12 - Client brief, projects and FAQ]]): the audiences as the same interactive cards as the home page's application areas, the surfaces as tiles in their own material, and the technical facts with light icon tiles, a scroll fade, and the area cards' hover glow.

## Result

- **One card for both lists:** new `src/components/AreaCard.tsx`, a mist link card (icon in a pale lime tile, title, text, an optional serif closing line, the call to action and a number at the foot; a compact row on phones). The home page's application areas and the audiences now both use it. The CSS class is renamed from `.area-card` to `.lift-card`, because three places use it now.
- **Audiences are links now:** "Business clients" opens the configurator with the office room, "Private clients" with the home room (`?area=office`, `?area=home`), with "Prova nel configuratore →" (new key `Services.audiences.tryIt`, four languages) and 01, 02. Under the mouse: rise 6 px, white, lime rim and glow, one sweep.
- **Surfaces as material tiles** (`.material--*` in globals.css, CSS gradients only, no images): plaster (warm grain), gypsum (smooth white with a sheen), concrete (grey with speckles in three offset grids, so no dot pattern shows), wood (brown with grain, white label), glass (pale green with two reflections), metal (brushed steel). A 3 × 2 grid; each tile rises in with the scroll (`data-reveal`); under the mouse a band of light passes over it. Label contrast measured on each texture: plaster 11.9, gypsum 17.2, concrete 5.4, wood (white) 5.6, glass 14.6, metal 8.8.
- **Technical facts:** the icon tile is pale lime with a graphite check (lime 12 % with a lime check in the dark theme) instead of black. Each fact is a `.lift-card` with the area cards' hover (rise, white, lime rim and glow, sweep) and keeps its scroll fade (`data-reveal`, staggered 1 … 4).
- **no-ui-flash:** all of it is CSS (hover, sweep, reveal by scroll timeline); nothing changes after hydration. The hover rise is the `translate` property and the reveal animates `transform`, so they add up instead of fighting. The reveal needs scroll timelines (Chrome, Edge, Safari 26+); Firefox shows the items at rest.
- **Checks:** `vp check` clean, `vp test` 243 passed, production build passed, `vp run e2e` 121 passed and 21 skipped by design (axe clean on every page, light and dark, desktop and phone). Screenshots light and dark, desktop and phone, with the hover states; the home area cards look and behave as before the refactor; the German texts fit the new cards.

## Changed files

- `src/components/AreaCard.tsx` (new)
- `src/features/home/ApplicationAreas.tsx`, `src/features/services/Audiences.tsx`, `src/features/services/Surfaces.tsx`
- `src/app/globals.css` (`.lift-card`, `.material`, `.material--*`)
- `messages/it.json`, `de.json`, `en.json`, `bs.json` (`Services.audiences.tryIt`)
- `CLAUDE.md`, `swiss-wallprinting/Prompt Log/Prompt Log.md`, this log

## Decisions

- **A shared component**, not a copy of the area card markup: one place to change the card, and the CSS name `.lift-card` says what it does.
- **The audience cards open the configurator** with a matching room, like the area cards: the "interactive" the author asked for has a destination.
- **Textures from gradients**, not photos: no extra requests, sharp at every size, and the same in both themes (materials keep their colour).
- **The hover on the facts** is decorative (they are not links), as the author asked; it is mouse only.

## Open items

- None from this prompt. The author will send more changes.

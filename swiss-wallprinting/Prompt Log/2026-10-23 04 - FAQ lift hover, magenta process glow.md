---
tags: [prompt-log]
date: 2026-10-23
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-10-23 04 - FAQ lift hover, magenta process glow

## Prompt

> now some additional changes: FAQ: add hover animation from "areas-title" on cards
>
> I have an idea for "process-title" section: first card has a hover effect, let's add the same effect on other cards, but instead of green color behind the mouse hover, use magenta

## Goal

The FAQ questions get the hover of the application area cards; the three other process steps get the first step's mouse light, in magenta.

## Result

- **FAQ:** every question (`<details>`) is a `.lift-card`, like the area cards: under the mouse it turns paper, rises 6 px, gets the lime rim and glow, and a band of lime light sweeps across once (mouse only; reduced motion keeps the rim and glow). The sweep has its own clip inside the summary (the card itself does not clip), so the keyboard focus ring outside the summary is not cut.
- **Found and fixed on the way:** the summaries had square corners: `rounded-[inherit]` takes the radius of the summary's parent in the rendering, which is the details' internal slot (radius 0), not the details. The focus ring was square because of it. The summary now has the card's radius as classes.
- **Process:** all four steps are `GlowCard`s. The first (the idea, dark) keeps its lime light and the shine; the other three get the same light under the mouse in **magenta** (`--glow-rgb`, a new per-card colour for GlowCard; lime stays the default).
  - **Contrast, measured** with the light's centre on the grey text (the text hidden, the darkest pixel against its colour): magenta at 10 % (the most that keeps the grey text AA on light mist, 4.71:1) was hardly visible. So the light is 22 %, and while it is over a card the step's text turns dark (`ink` at 80 %, a 200 ms colour change): **8.25:1** at the centre. Dark theme: magenta at 30 %, the grey text stays, **6.00:1**.
  - Phones: no change (the light is mouse only; the idea step keeps its glow from inside).
- **Test fix from the previous prompt:** the axe test waited for every animation, and the projects page's scroll-driven animations ("Show more") never finish; it now waits only for animations in time (`animation.timeline === document.timeline`).
- **Checked** in the browser: FAQ hover (light and dark), an open question under the mouse, the focus ring; the process light in both themes. `vp check` clean, `vp test` 243 passed, production build passed, `vp run e2e` **126 passed**, 24 skipped by design, none failed (with the projects tests of the previous prompt, and axe clean on every page, light and dark, desktop and phone). First-load JS: 152 to 160 KB gzip (projects 160, rounded from 159.6), within the budget.

## Changed files

- `src/app/[locale]/(pages)/faq/page.tsx` (lift card, sweep clip, summary radius)
- `src/features/home/ProcessSection.tsx` (every step a GlowCard, magenta light, darker text under the light)
- `src/islands/GlowCard.tsx` (comment), `src/app/globals.css` (`--glow-rgb`)
- `e2e/a11y.spec.ts` (waits for animations in time only)
- `CLAUDE.md`, `swiss-wallprinting/Prompt Log/Prompt Log.md`, this log, and the results in [[2026-10-23 03 - Project cards of one size, lightbox swipe]]

## Decisions

- **Darker text under the magenta light** instead of a light too faint to see or grey text under AA.
- **No tilt and no shine** on the magenta steps: the prompt asked for the light; the shine stays the sign of the step where the visitor can act (the configurator).

## Open items

- None new. The JavaScript headroom (159.6 of 160 KB on the projects page) is the known Phase 6 item.

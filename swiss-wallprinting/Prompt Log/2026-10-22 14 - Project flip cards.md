---
tags: [prompt-log]
date: 2026-10-22
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-10-22 14 - Project flip cards

## Prompt

> In the projects tab, section with Projects div
>
> I want you to use this component for the cards: https://framer.com/m/LiquidGlassFlipCard-8Yy2n2.js@LxDWgj61sg0JzNM5sRdB
>
> To keep the consistency of the website, use a hover effect that other cards have (e.g. "areas-title" at home page)

## Goal

The project cards on the Projects page (branch `feat/client-brief`) as liquid-glass flip cards, with the hover of the area cards.

## Result

- **The Framer component** (read from its module, about 57 KB): a "thick slab of liquid glass" that turns in 3D, with refraction from SVG displacement maps drawn on a canvas, a band of light, a prism flash at 90°, and a spring landing; it flips on click, tap, keyboard, hover, or drag, and needs `framer` and `framer-motion`. `CLAUDE.md` forbids `framer-motion` and Framer components (checked on 2026-10-22: about 100 KB and a React render per mouse move), so the look is rebuilt in CSS.
- **The flip card** (`ProjectList.tsx`, `.flip-card` in globals.css):
  - Front: the photo (or the "photo coming soon" placeholder), and over its lower edge a pane of frosted glass (white 75 %, `backdrop-blur-xl`, bright inner rim and a soft top light; paper 80 % in the dark theme) with the place, the title (`h2`), the summary, and "Leggi la storia" with a flip icon.
  - Back: the place, the title (for the eyes only, `aria-hidden`), the story, the closing line, and "Chiudi la storia"; a faint lime and magenta light in two corners.
  - The turn: `rotateY(180deg)` in 850 ms on a new token `--ease-spring` (a `linear()` damped spring, about 6 % overshoot, so it lands like gel), and a band of light crosses each face while it turns. Reduced motion: the faces swap without turning or light.
  - The trigger is a visually hidden checkbox per card (`aria-label` "Leggi la storia: <title>"); the buttons on both faces are its labels. So it works without JavaScript, with the keyboard (Tab, then space), and the server HTML is final (no-ui-flash). The keyboard focus shows as an outline on the button of the visible face. The checkbox sits at the buttons' corner of the card (`.flip-card__toggle`), so focusing it after a click never scrolls the page; a first version jumped to the top, because the card's top was under the header pill, inside the page's 7rem scroll padding.
  - Both faces stack in one grid cell, so they are the same height; a project without a story (the pool) is one face without a button.
- **Hover:** both faces are `.lift-card`s with the sweep: rise 6 px, white, lime rim and glow, one band of light, as the area cards on the home page.
- **Checks:** `vp check` clean, `vp test` 243 passed, production build passed, `vp run e2e` 121 passed and 21 skipped (on the build just before the last fix, which only moves the hidden checkbox to the buttons' corner; after it: `vp check` clean, axe clean again, scroll checked on two cards). axe clean on the front and on a flipped card, light and dark, desktop and phone. Screenshots: rest, hover, mid-turn, back, keyboard focus, phone front and back, dark.

## Changed files

- `src/features/projects/ProjectList.tsx` (flip cards; the `<details>` story is gone)
- `src/app/globals.css` (`--ease-spring`, `.flip-card`)
- `src/components/icons.tsx` (`FlipIcon`)
- `messages/it.json`, `de.json`, `en.json`, `bs.json` (`Projects.closeStory`)
- `CLAUDE.md`, `swiss-wallprinting/Prompt Log/Prompt Log.md`, this log

## Decisions

- **CSS, not the Framer component:** the project rule against `framer-motion`, and a page without a client island for this. The refraction (SVG displacement maps) is left out: it needs a canvas per card and works only in Chromium (the component itself turns it off in Safari and Firefox); the frosted pane with a bright rim gives the glass look everywhere.
- **Flip on click, not on hover:** hover is the area cards' lift, as the author asked; a hover flip would fight it and does not exist on phones.
- **A checkbox, not a button with state:** it works before and without JavaScript and keeps the page static.
- **The title on the back is hidden from screen readers:** the front's `h2` already names the project, and both faces are in the HTML.

## Open items

- With real photos, check the glass pane's text contrast over dark pictures (the pane is white 75 % with ink text, chosen for that).

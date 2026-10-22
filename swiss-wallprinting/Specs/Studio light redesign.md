---
tags: [spec, design]
date: 2026-10-21
status: built (uncommitted on main)
---
# Studio light redesign

The art direction of the whole site since 2026-10-21. It replaces [[Development Plan#5. Design direction]] (dark glass pill, Unbounded and Inter, plaster and graphite bands, CMYK dots). The rules for code are in `CLAUDE.md`, "Design rules"; the tokens are in `src/app/globals.css`. How it was made: [[2026-10-21 05 - Studio light redesign]], then the author's reviews: [[2026-10-21 06 - Colour, area cards, compact sizes, no flash]] and [[2026-10-21 07 - Question card back in the Questions section]].

## Source

- **The author's reference prompt** (pasted with the request): a full-screen video card in a white frame, a frosted white navigation pill with a black call to action, a white headline bottom left with one word in Instrument Serif italic, a white contact card bottom right (e-mail and social buttons, "or", the form with service chips, a black submit button), Inter everywhere. The site takes its look and composition; the stack stays Next.js (the prompt asked for Vite, React, lucide-react).
- **Emil Kowalski's skills** (`emil-design-eng`, `animate`, …), as the author asked: the motion curves, durations, press feedback, and reduced motion.
- **Not used:** a first attempt with taste-skill's "dark room" direction ([[Specs/Premium redesign]], not adopted). taste-skill's inspector still takes the full-page screenshots; its house rules (no serif accent, no emoji, no glass) contradict the reference and are ignored.

## System

| Part | Choice |
|---|---|
| Ground | White page, a frame of 12, 16, 24 px around the cards (`FRAME`), at most 92 rem wide |
| Cards | `rounded-2xl` / `sm:rounded-3xl`: photo (hero), mist `#f5f5f4` (page headers, reviews, steps, contact, closing card), dark `#0a0a0a` (Why, What we print, footer) |
| Type | Inter (variable, optical size): headlines medium; one serif italic accent per headline (Instrument Serif, `<em>` in the messages). Fluid sizes: `text-display` 36 to 60 px (h1), `text-title` 28 to 44 px (h2), `text-stat` 32 to 52 px (numbers) |
| Space | `SECTION_Y` 56/64/80 px on white, `CARD_Y` 48/56/64 px inside cards; on phones, long card lists swipe (`PHONE_SWIPE`) |
| Colour | Ink `#0a0a0a`, mute `#66625f` (6.0:1 on white, 5.5:1 on mist), and the logo's colours (the author wants them visible): magenta `#e51158` for the buttons and the accents on light grounds, lime `#c5d20d` for the accents, numbers, checks and icons on dark grounds, and as a fill with ink text (checked chips, current page, current language) |
| Header | Frosted white pill (`bg-white/70`, blur), the client's black logo, four links (the current one on a lime tint), language menu, magenta "Try your wall" button. Fixed; inside the first card of every page; rises over the first 96 px of scroll |
| Buttons | Magenta primary (with a soft magenta shadow), white inverse on photos and dark cards, quiet secondary and glass; `rounded-xl` (`rounded-2xl` large); press scale 0.97 |
| Chips | `rounded-lg` border chips; checked in lime (form areas, gallery filter), in black in the configurator |
| Motion | Strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)`; first screen rises in order (CSS); sections reveal as they enter (CSS scroll timeline, never on the first screen); the hero print pass (1.8 s, once per document) and a 28 s drift; reduced motion: fades only |
| No flash | Every scroll-dependent state (reveal, header position) is a CSS scroll timeline, right in the first frame with or without JavaScript; no effect hides content after hydration; no inline scripts |

## The home page (README order)

| Section | Composition |
|---|---|
| 1. Hero | The photo card (README: "video background"): the client's photo of the printer, printed once more by a CMYK print head on load, then drifting slowly. Headline bottom left with the serif accent, the lead, the magenta "Try it on your wall" button and a glass "Free quote" button that scrolls to the question card |
| 2. Reviews | The heading and the large rating (4,8 and stars), then a masonry of mist cards (a swipe row on phones), initials in magenta, lime, and ink; each mock review keeps "Esempio" |
| 3. Why | A dark card: the heading, four lime numbers (3,80 m, ∞, 12+, Eco), the four promises with lime checks |
| 4. Process | Four mist cards numbered in magenta serif italic (a swipe row on phones); step 2 is dark, with a lime number and the magenta configurator button |
| 5. Application areas | Icon cards (the author prefers them to photo tiles): a dark tile with a lime icon, the title, one line, a magenta link to the configurator with the area; on phones a compact row |
| 6. Questions | README "form for questions": a mist card with the heading and the two phone numbers (with their languages) on the left, and the white question card of the reference on the right: "Ciao! 👋", the e-mail with phone, WhatsApp, Instagram and Facebook buttons, "oppure", and the form with area chips |

Inner pages: `PageHeader` is a mist card with the label, the title (serif accent), and the lead on the right; then the content (photo exhibit and story on About; before/after cards and a dark "what we print" card on Services; filter chips and masonry on Gallery; contact rows and the form card on Contact); then the closing mist card (`CtaBand`) and the dark footer card. The configurator keeps its logic: its card starts below the pill, the panel is white, the controls are chips.

## Decisions

- **The question card is in the Questions section**, at the end of the home page (README order). For one review round it was in the hero, as in the reference; the author did not want it in the first screen ([[ADR/0002-studio-light-and-the-form-in-the-hero]], revised).
- **No video yet.** The reference's video is a file on another company's CDN with an unknown licence, and loading it would send each visitor to a third-party server (privacy rule). The client has no video of a wall printer; the hero shows the client's photo with motion until the time-lapse arrives (Development Plan P2). The photo is 1280 px wide: soft on large screens.
- **The colour logo only on dark grounds**: the pill uses the client's black variant (`Logo tone="ink"`).
- **The floating WhatsApp button always shows** (as before the redesign). For one round it hid at the top, because the hero card had a WhatsApp button.

## Checks (2026-10-21)

- `vp check` clean, `vp test` 195 tests, `vp run build` passes; no first-load script of the 34 prerendered pages contains three.js.
- Full-page screenshots (headless Edge, 1440 and 390 px): home IT and DE, About, Services, Gallery, Contact, configurator.
- The hero form: a real submit (dev outbox) gives "Spazio: Hotel, Altro" in the e-mail; an empty submit gives 4 field errors, the summary, and the focus on the name.
- Not measured: Lighthouse (the LCP image and its loading did not change; the fonts grew from about 48 KB to 86 KB), a real phone.

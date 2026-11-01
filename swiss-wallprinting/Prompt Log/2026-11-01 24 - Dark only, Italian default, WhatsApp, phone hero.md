---
tags: [prompt-log]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-01 24 - Dark only, Italian default, WhatsApp, phone hero

## Prompt

> Now I need some more fixes:
>
> * remove light mode entirely from the website (do a soft remove, so in any case if client wants it back in the future we can get it back quickly)
> * make italian as a default language of the website (when user runs website without any language route, run italian first)
> * whatsapp number: +41 76 411 55 06
> * client is complaining that he cannot see other parts of a video on the mobile phone (armchair and flowers on the sides), maybe to unzoom it on the mobile? /no-ui-flash

## Goal

The site is dark only, with the light theme easy to bring back; `/` always opens Italian; WhatsApp goes to the client's other number; phones see the whole room of the hero video.

## Result

- **Dark only (soft):** `THEME_CHOICE = false` in `src/lib/theme.ts`. The root layout and the global 404 render `data-theme="dark"` on `<html>` from the server, so the first paint is dark on every device, with no script and nothing that flips after load (no-ui-flash, layer 1). The theme switch (pill and phone menu) and `THEME_SCRIPT` are not rendered; the browser bar is dark (`themeColor`, `colorScheme`). The light tokens, `ThemeToggle`, and the light e2e tests stay (skipped). To bring it back: `THEME_CHOICE = true`, and the privacy text about the stored theme.
- **Italian default:** `routing.ts` has `localeDetection: false`: `/` redirected by the browser's language (`Accept-Language: de` → `/de`); now `/` → `/it` always, and an address without a language (`/ueber-uns`) also goes to Italian. Without detection nothing reads the `NEXT_LOCALE` cookie, so `localeCookie: false`: the site sets no cookies at all.
- **Privacy text** (4 languages): "one technical language cookie; the theme you choose stays in your browser" → "sets no cookies: the language is in the page's address". DE, EN, BS are drafts.
- **WhatsApp:** `company.whatsapp` is `+41764115506` (every WhatsApp link and the floating button). The contact rows that show "the WhatsApp phone" first (contact, configurator, home question card) now show +41 76 411 55 06 first. Development Plan (Q9) updated.
- **Phone hero:** a phone showed a third of the video's width. Now a tall stage shows at least 85 % (`--min-share` on `.print-scroll__frame`, CSS only): the frame stands at the top of the stage, the intro headline and the outro buttons are on the dark ground below it; at the end the armchair and the plant are both in view. Desktop unchanged (it still covers, measured at 1440 × 900). Checked at 390 × 844 and 360 × 740: no overlap of picture and text.
- Checks: `vp check` (one warning: `hasMock` unused in `Testimonials.tsx`, from the author's earlier edit), `vp test` (310), production build, and e2e `theme`, `a11y`, `smoke`, `home` (96 passed, 14 light-theme tests skipped; axe clean in dark on every page, desktop and phone).

## Changed files

- `src/lib/theme.ts`, `src/app/[locale]/layout.tsx`, `src/app/global-not-found.tsx`, `src/components/site/SiteHeader.tsx`, `e2e/theme.spec.ts`
- `src/i18n/routing.ts`, `messages/{it,de,en,bs}.json` (privacy cookies text), `src/app/[locale]/(pages)/privacy/page.tsx` (comment)
- `src/content/company.ts`, `swiss-wallprinting/Development Plan.md`
- `src/app/globals.css` (`.print-scroll__frame`)
- `CLAUDE.md` (dark only, the phone hero, the privacy facts)

## Decisions

- The soft removal is one flag, not deleted code: the light theme is the CSS default under `dark:` variants anyway, so keeping it costs nothing.
- The language cookie is off too: with detection off it had no use, and "no cookies" is the simpler privacy story.
- 85 % of the width on tall stages: the smallest share that shows the armchair (11–30 % of the width) and the plant (81–94 %) at the end, with the picture at the end centred.

## Open items

- During the 2 s of the print a phone shows the picture at the top and an empty dark area below it (the texts are there only before and after). If that looks empty to the author, a smaller `--min-share` makes the picture larger (and cuts the sides again).
- To look at on a real phone. Not committed.

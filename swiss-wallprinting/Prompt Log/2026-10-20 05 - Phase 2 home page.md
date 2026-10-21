---
tags: [prompt-log]
date: 2026-10-20
agent: Claude Code (Claude Opus 5.5)
status: done
---
# 2026-10-20 05 - Phase 2 home page

## Prompt

> Start phase 2

## Goal

Phase 2 of [[Development Plan#8. Phases]]: the home page in the order of the [[README]]: hero, testimonials, why, process, application areas, question form (Server Action, mock e-mail transport).

## Result

- **Hero** (P2): the client's tiger photo full-bleed, a CSS "print reveal" (a graphite ink panel moves off to the right; its edge is a cyan-magenta-yellow print head with a glow). Transform-only animation, no JavaScript, off with reduced motion. Headline "La tua immagine, stampata direttamente sul muro.", lead with the facts from the old site, buttons "Provalo sulla tua parete" (configurator) and "Preventivo gratuito" (to the form). The header floats over the hero. The image loads eager with high fetch priority (Next.js 16 replaces `priority`).
- **Testimonials:** rating summary (average, band "Eccellente", count with plurals in all four languages) and review cards (stars, text in its own language with `lang`, author initial, place, date, optional owner reply). The cards move as a slow band, pause on hover and focus; with reduced motion the band stands still and scrolls by hand. Six **mock** reviews (`src/content/testimonials.ts`, `mock: true`), each with a visible "Esempio" badge and a note above the band. The production build stops while they exist.
- **Why Swiss Wall Printing:** four large numbers from the content file (3,80 m, ∞, 12+, Eco) and four features. The numbers are formatted per language and passed into the texts as parameters.
- **Process:** four steps, one CMYK ink colour each; step 2 links to the configurator. A draft until the client confirms the real process.
- **Application areas:** six icon cards from the old site's list (companies and offices, hotels, restaurants, schools, private homes, facades and outdoor) in `src/content/application-areas.ts`, localized; each opens the configurator with `?area=<id>` (read in Phase 4).
- **Question form:** name, e-mail, phone (optional), message, consent (link to the privacy page). Server Action with Zod validation on the server; localized error texts per field and code (written with the `write-better-error-messages` skill); the first invalid field gets the focus; a success message replaces the form. Spam: honeypot (fake success), minimum fill time, 5 messages per IP per 10 minutes. The e-mail (in Italian, reply-to the visitor) goes to `CONTACT_TO` through the development outbox (`.mail-outbox/`). Alternatives next to the form: both phones, WhatsApp, e-mail.
- **Client messages:** the layout now sends only the `Nav` and `QuestionForm` namespaces to the browser.

Validation: `vp check` passes (78 files), `vp test` passes (10 files, 76 tests), `vp run build` passes. Browser: empty submit shows the summary, 4 field errors, focus on the name field; a valid submit shows the success message and writes the e-mail to the outbox with the right recipient and reply-to. **Without JavaScript** (posted the real form HTML): the errors come back with the typed text kept, and a valid post shows the success message and writes the e-mail. 32/32 pages still 200; the area links with `?area=` work; Bosnian plurals render ("Na osnovu 6 recenzija"); no horizontal scroll at 375 px. Lighthouse mobile on `/it` (warm server): **93–94 performance, 100 accessibility, 100 best practices, 100 SEO**; `/de` 94.

## Changed files

- New: `src/features/home/{Hero,Testimonials,WhySection,ProcessSection,ApplicationAreas,QuestionSection}.tsx`, `src/features/home/rating.ts`, `src/features/contact/{fields,question,handle-question,actions}.ts`, `src/lib/mail.ts`, `src/islands/QuestionForm.tsx`, `src/components/{SectionHeading,Stars}.tsx`, `src/content/{testimonials,application-areas}.ts`, tests in `src/features/home/__tests__/` and `src/features/contact/__tests__/`
- Changed: `src/app/[locale]/(pages)/page.tsx` (the home page), `src/app/[locale]/layout.tsx` (client messages), `src/app/globals.css` (print reveal, marquee), `src/components/icons.tsx` (check and six area icons), `src/content/{schema,index}.ts`, `messages/*.json` (namespaces `Home`, `QuestionForm`), `.gitignore` (`.mail-outbox/`), `CLAUDE.md`, [[Development Plan]]

## Decisions

- **Hero headline** is new copy ("La tua immagine, stampata direttamente sul muro."); the old tagline "Stampiamo direttamente sui muri." stays as the footer claim. Ask the client which one to use.
- **The print reveal sweeps the whole photo**, not only up to the printer in the photo: with `object-cover` the photo is cropped differently on each screen, so a fixed stop point would not line up.
- **Validation only on the server**, with `noValidate`: one set of localized messages, the same with and without JavaScript, and no Zod in the browser bundle (`fields.ts` holds what the client needs).
- **Bots get a fake success** (honeypot): they learn nothing. A form sent too fast gets a clear "send again" message, because a person can trigger it too.
- **The e-mail to the client is in Italian**, with the page language in the text: the client reads Italian.
- **Number format follows the language** (`it`: 3,80, as the client writes it). Swiss formats (3.80) come with regional locales, if the Phase 7 domain option 1 is chosen.
- **No mock photos yet:** Phase 2 needs none (icons and the real photo). The image manifest decision moves to Phase 3 (gallery, before/after).
- **Lighthouse cold start:** the first run after a server start had a 2.2 s first paint (server and Chrome cold); warm runs are 93–94. Measure warm.

## Open items

- **Client:** real reviews (Q7), the real process steps, which headline, the area texts (review), a time-lapse video for the hero.
- **Translations:** DE, EN, BS texts are drafts (`messages/README.md`).
- **LCP is the hero image (about 3.0 s on simulated slow 4G).** Possible in Phase 6: smaller image for phones, lower quality, or a CSS-only first frame.
- **Mail transport for production** (SMTP or Resend) is Phase 3; until then a production build cannot send forms (it shows the "not sent" message with phone and e-mail).
- **Commit:** nothing is committed. Git `user.name` and `user.email` are still not set.
- **Next phase:** Phase 3 (services with before/after, about, gallery, contact, legal pages, real e-mail transport).

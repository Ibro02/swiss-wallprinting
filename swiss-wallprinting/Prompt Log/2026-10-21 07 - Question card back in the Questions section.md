---
tags: [prompt-log]
date: 2026-10-21
agent: Claude Code (Claude Opus 5.5)
status: done
---
# 2026-10-21 07 - Question card back in the Questions section

## Prompt

> I don't like to have this "contact-me" card in the landing page (as a first scene), move it back to the bottom of the page ("Questions" section)

## Goal

The hero without the form; the question card at the end of the home page, in the Questions section (README item 6).

## Result

- **Hero:** only the photo, the headline, the lead, and two buttons: the magenta "Try it on your wall" and a glass "Free quote" (`Home.hero.ctaQuote`, back in all four languages) that scrolls to the card. The photo covers the whole card again on phones; it only covered the top while the form made the card tall.
- **Questions section:** the heading, the intro, and the two phone rows (with their languages, which the card does not show) on the left; the white question card on the right (on phones below). The e-mail and WhatsApp rows are gone: the card has them. The "write to us with the form at the top" link and its texts (`Home.question.toForm`, `Home.question.email`) are gone.
- **Floating WhatsApp button:** always visible again. It hid at the top only because the hero card had its own WhatsApp button; the `fab-in` scroll timeline is removed.
- **Bug found and fixed:** in its new grid column the card's e-mail line (it must not wrap) stretched the column wider than a phone, so the page scrolled sideways and the header pill ran off the edge. The grid has a `grid-cols-1` track now (`minmax(0, 1fr)`); the contact page's grid got the same guard.
- **Checks:** `vp check` clean, `vp test` 195 tests, `vp run build` passes. In the browser: the hero has no form, "Preventivo gratuito" scrolls to the card in the Questions section. Screenshots (headless Edge, 1440 and 390 px) of the home page.

## Changed files

- `src/features/home/Hero.tsx`, `src/features/home/QuestionSection.tsx`, `src/features/home/QuestionCard.tsx` (lighter shadow on the mist ground), `src/components/site/WhatsAppButton.tsx`, `src/app/globals.css`, `src/app/[locale]/(pages)/contact/page.tsx`, `messages/*.json`, `CLAUDE.md`, `swiss-wallprinting/Specs/Studio light redesign.md`, `swiss-wallprinting/ADR/0002-studio-light-and-the-form-in-the-hero.md` (revised), this entry, `Prompt Log.md`

## Decisions

- **The README order wins over the reference here:** the form is README item 6, at the end of the page.
- **The phone rows stay beside the card:** they show which languages each number answers in; the e-mail and WhatsApp are only in the card, so nothing is shown twice.

## Open items

- **Author:** review, then say whether to commit. Nothing is committed.
- Earlier open items stay: Lighthouse and a real phone, the hero video (Development Plan P2), the first attempt in git stash, translation review.

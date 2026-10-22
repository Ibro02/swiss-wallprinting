---
tags: [prompt-log, index, handover]
---
# Prompt Log

This folder records each prompt that the author gives to an AI agent, and the result. Use it to give the project to a new agent (Claude Code, Codex, Cursor, Gemini CLI) or a new person.

## Rules

1. Make one entry for each prompt.
2. Name the file `YYYY-MM-DD NN - Short title.md`. `NN` is the number of the prompt on that day.
3. Copy the prompt exactly. Do not correct it.
4. Write the goal, the result, the changed files, the decisions, and the open items.
5. Add the entry to the table below. Put the newest entry at the top.
6. Use the template: [[Prompt Log Template]].

## Current state

> [!summary] For the next agent
> Read this section first. Update it after each prompt.
>
> - **Design:** the whole site was redesigned on 2026-10-21 ("Studio light", from the author's reference prompt, with Emil Kowalski's skills): read [[2026-10-21 05 - Studio light redesign]] and the author's first review [[2026-10-21 06 - Colour, area cards, compact sizes, no flash]] (magenta buttons, lime on dark, icon cards in "Where we print", compact fluid sizes, scroll effects in CSS without flashes) and [[2026-10-21 07 - Question card back in the Questions section]] (the form is at the end of the home page again, not in the hero), [[Specs/Studio light redesign]], and "Design rules" in `CLAUDE.md`. **Not committed yet**: the author reviews it first. A first attempt ("The dark room") is in git stash, not adopted.
> - **Hero (2026-10-22):** the home hero is now "print on scroll": the scroll plays the time-lapse frame by frame on a canvas (`PrintOnScroll`, frames from `vp run frames`, ffmpeg installed with winget). Read [[2026-10-22 01 - Print on scroll hero]] and "Scroll hero" in `CLAUDE.md`. The video is AI-generated with a **Dreamina AI watermark**: `hero-video.ts` is mock (badge, production build stops) until the author or the client sends a clean, licensed video. The CSS print pass and `PrintPass` are gone.
> - **Commit `39d40e5` (2026-10-22, not pushed)** holds the Studio light redesign and the scroll hero. After it, [[2026-10-22 02 - Commit, hero room, sliding reviews, glow cards]] (not committed): the hero keeps the top fifth free for the pill and crops the video's floor (no badge, the author's choice), a CSS scroll timeline sets the hero progress before hydration, the reviews slide again, `GlowCard` (lime light following the mouse, tilt, shine) on the process step and the area cards (a Framer component was checked and rejected: about 100 KB), and the question section has the e-mail row and the channel buttons on the left.
> - **Phase:** Phase 5 (configurator complete) is done and pushed. Phase 6 (quality: CI budgets, accessibility audit, SEO with JSON-LD and sitemap, Playwright E2E) is next. Read [[2026-10-21 03 - Phase 5 configurator complete]], "Built in Phase 4" and "Built in Phase 5" in [[Development Plan#4.7 Try your wall printing (configurator)]], and the "Architecture rules", "Rules for forms", and "Code layout" sections in `CLAUDE.md`.
> - **Configurator:** complete: bottom sheet, poster frame, share link, quote request with screenshot, resolution warning, drag, window and door. Lighthouse mobile 92, desktop 100. The 3D code loads only on intent (desktop: first mouse move; phone: the 3D button): keep it that way (`CLAUDE.md`). Price rates and the sharpness threshold are mock values.
> - **E-mail:** SMTP and Resend are built (`MAIL_TRANSPORT`). The author must set the credentials in `.env.local` and run `vp run mail:test`; real delivery is not tested yet. A production build stops while the transport is not set up.
> - **Legal pages:** drafts with "[missing]" for each fact the client has not sent (`src/content/legal.ts`). Do not guess these facts.
> - **404 pages:** fixed in Phase 1. Unknown localized URLs go through the proxy to a prerendered 404 page (status 404, full HTML).
> - **Domains:** next-intl needs unique locales per domain; the `.ch` / `.com` split is open (two options in [[Development Plan#3. Information architecture]]).
> - **Decisions:** Next.js runs the app, Vite+ is the toolchain, pnpm, mobile bottom sheet, approximate price, WhatsApp button, no French for now, hosting decided in Phase 7. Read [[2026-10-20 02 - Answers to the plan questions]].
> - **Forms:** during tests they go to the author's own address (`CONTACT_TO` in `.env.local`, never in the repo).
> - **Waiting for the client:** price rates and VAT, final mailbox, real reviews, photos and videos, company story, print resolution threshold (Q5, Q6, Q7, Q10, Q11), real configurator presets, and the legal facts (legal name, responsible person, street, UID).
> - **Content source:** [[Old Website]] has every fact from the old site. Do not invent other facts.
> - **AI tools:** skills and plugins are set up. Read the "Skills and plugins" section in `CLAUDE.md`. No AI tool may appear as a contributor in git.
> - **Mock content:** six mock reviews (`src/content/testimonials.ts`), six mock service rooms, nine mock gallery photos, six configurator presets, the price rates, the sharpness threshold, and the legal drafts, each marked on the page (an "Esempio" badge, a note, or a draft banner). The home page area tiles use the mock service photos, each with "Esempio". The mock photos and presets are generated by `vp run mockups` (no stock photos). The production build stops until real content replaces them.
> - **Next step:** Phase 6, see [[Development Plan#8. Phases]]. Phases 0 to 5 are committed and pushed to the public repo https://github.com/Ibro02/swiss-wallprinting (branch `main`); see [[2026-10-21 04 - First commit and push to GitHub]]. Git `user.name` and `user.email` are not set in the config.

## Entries

| Date | No. | Title | Status |
|---|---|---|---|
| 2026-10-22 | 02 | [[2026-10-22 02 - Commit, hero room, sliding reviews, glow cards]] | Done (fixes not committed) |
| 2026-10-22 | 01 | [[2026-10-22 01 - Print on scroll hero]] | Done (committed in `39d40e5`; video is mock) |
| 2026-10-21 | 07 | [[2026-10-21 07 - Question card back in the Questions section]] | Done (not committed) |
| 2026-10-21 | 06 | [[2026-10-21 06 - Colour, area cards, compact sizes, no flash]] | Done (not committed) |
| 2026-10-21 | 05 | [[2026-10-21 05 - Studio light redesign]] | Done (not committed) |
| 2026-10-21 | 04 | [[2026-10-21 04 - First commit and push to GitHub]] | Done |
| 2026-10-21 | 03 | [[2026-10-21 03 - Phase 5 configurator complete]] | Done |
| 2026-10-21 | 02 | [[2026-10-21 02 - Phase 4 browser check, build, docs]] | Done |
| 2026-10-21 | 01 | [[2026-10-21 01 - Phase 4 configurator MVP]] | Done |
| 2026-10-20 | 06 | [[2026-10-20 06 - Phase 3 inner pages and e-mail]] | Done |
| 2026-10-20 | 05 | [[2026-10-20 05 - Phase 2 home page]] | Done |
| 2026-10-20 | 04 | [[2026-10-20 04 - Phase 1 design system and shell]] | Done |
| 2026-10-20 | 03 | [[2026-10-20 03 - Phase 0 setup]] | Done |
| 2026-10-20 | 02 | [[2026-10-20 02 - Answers to the plan questions]] | Done |
| 2026-10-20 | 01 | [[2026-10-20 01 - Plan, CLAUDE.md, skills, old site]] | Done |

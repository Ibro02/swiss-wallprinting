---
tags: [prompt-log]
date: 2026-10-20
agent: Claude Code (Claude Opus 5.5)
status: done
---
# 2026-10-20 02 - Answers to the plan questions

## Prompt

> send me questions here

## Goal

Ask the open questions of [[Development Plan]] in the chat, and record the answers.

## Result

The agent asked eight questions in two rounds. The author answered:

| ID | Question | Answer |
|---|---|---|
| Q1 | Framework | Next.js + Vite+ toolchain (option A) |
| Q2 | Hosting | Decide later (Phase 7). Vercel previews during development |
| Q3 | Package manager | pnpm |
| Q4 | Configurator on phones | Bottom sheet |
| Q5 | Price display | Approximate price ("approx. CHF X") + "Request exact quote" |
| Q8 | French | Not now, add later |
| Q9 | WhatsApp button | Yes |
| Q6 | Form recipient | For now, the author's own Gmail address, so the author can test the forms first |

- Updated [[Development Plan]]: status "approved", section 2.2 decided, section 9 has the answers, WhatsApp, mobile bottom sheet, and form recipient in section 4.
- Updated `CLAUDE.md`: Q1 is decided, pnpm, and a rule for the form recipient.

## Changed files

- `swiss-wallprinting/Development Plan.md`
- `CLAUDE.md`
- `swiss-wallprinting/Prompt Log/2026-10-20 01 - Plan, CLAUDE.md, skills, old site.md` (status: done)
- `swiss-wallprinting/Prompt Log/Prompt Log.md`

## Decisions

- **The form recipient is not in the repo.** It goes in the `CONTACT_TO` environment variable in `.env.local`, which git ignores. Reason: a personal e-mail address must not be in the code or in the vault, and the launch only needs a change of one variable.
- **Q5 is half answered.** The display is decided; the client must still send the rates. The configurator uses placeholder rates marked as mock.
- **Q9 was answered by the author.** Confirm with the client before launch.

## Open items

- Phase 0 (setup) is next. In Phase 0, make `.env.local` with `CONTACT_TO` set to the author's address (ask the author for it).
- Client questions Q5 (rates), Q6 (final mailbox), Q7, Q10, Q11 are still open.

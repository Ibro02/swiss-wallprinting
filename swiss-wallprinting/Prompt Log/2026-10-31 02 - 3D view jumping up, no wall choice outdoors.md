---
tags: [prompt-log]
date: 2026-10-31
agent: Claude Code
status: done
---
# 2026-10-31 02 - 3D view jumping up, no wall choice outdoors

## Prompt

> Whenever I click outdoors or indoors button, 3D view lift's up for some reason. Same with wall selection. It is huge bug and needs to be fixed now
>
> also, when it's outside, wall option can be disabled or hidden, choose what has better UX results

## Goal

Stop the configurator's 3D view from jumping up on a click in the panel, and remove the wall choice outdoors.

## Result

- **Cause of the jump:** the panel's chips hide their radio input with `sr-only` (`position: absolute`). The labels had no `relative`, so each input was placed against the configurator card, far from its button (the "Outdoors" input at 1530 px, its button at 492 px). A click focuses the input, and the browser scrolls it into view: it scrolled the card (`overflow: hidden`, but still scrollable by the browser) and the page, so the 3D view moved up. The same happened with every chip: walls, fit, presets, upload, before/after.
- **Fix:** `relative` on every label that wraps an `sr-only` input: `Choices` and the wall buttons (`Panel.tsx`), the presets and the upload (`ImagePicker.tsx`), the before/after toggle (`Stage.tsx`), and the question form's area chips (`QuestionForm.tsx`, same pattern). Checked in the browser with real clicks on Outdoors, Indoors, and a wall (3D loaded): the window and the card do not scroll; all 17 hidden inputs are inside their labels.
- **Outdoors: wall choice hidden (not disabled).** Disabled walls would show four choices that do nothing; outdoors there is one wall. The wall section then shows one line instead ("Outdoors we show one wall: 5.00 × 2.70 m. Change its size under “Room size”.", `Configurator.wall.outdoors` in four languages, agent drafts for IT, DE, BS). The section and the phone tab stay, so the numbers 1 to 5 and the tabs do not change. Outdoors always uses the front wall (`OUTDOOR_WALL` in `model/room.ts`): `setEnvironment('exterior')` selects it, and `startConfig` opens an outdoor share link on it, so the wall size is the room's width × height. The room section hides the depth field outdoors (it would change nothing).
- `vp check` passes; `vp test`: 256 pass (new: an outdoor link opens on the one outdoor wall; the share link round trip now uses an indoor area).

## Changed files

- `src/islands/configurator/Panel.tsx`, `ImagePicker.tsx`, `Stage.tsx`, `src/islands/QuestionForm.tsx`
- `src/features/configurator/model/room.ts`, `store.ts`, `start.ts`, `__tests__/store.test.ts`
- `messages/{it,de,en,bs}.json` (`Configurator.wall.outdoors`)
- `CLAUDE.md` (rule: a hidden input needs a `relative` label; outdoor wall)

## Decisions

- Hidden rather than disabled: fewer controls that do nothing, and a line that says what the visitor sees.
- Switching back indoors keeps the front wall (the visitor's earlier wall is not remembered): simpler, and nothing is stored that the view does not use.

## Open items

- Follow-up prompt ("run the production build and the e2e tests now"): `SITE_URL=http://localhost:3001 vp run build` passed (the dev server writes to `.next/dev`, so both can run), and `vp run e2e` passed: 138 passed, 28 skipped (the desktop-only and phone-only tests on the other device), 0 failed. This covers both prompts of 2026-10-31.
- Not committed.

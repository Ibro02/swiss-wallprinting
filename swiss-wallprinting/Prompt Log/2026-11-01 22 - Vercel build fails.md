---
tags: [prompt-log]
date: 2026-11-01
agent: Claude Code
status: waiting for the author
---
# 2026-11-01 22 - Vercel build fails

## Prompt

> I have an error at the production
>
> [ELIFECYCLE] Command failed with exit code 1.
> Error: [BUILD_UTILS_SPAWN_1] Command "pnpm run build" exited with 1

Then the start of the Vercel build log (it ended during `pnpm install`), and:

> but can you run something locally so we can check for bugs

## Goal

Find why the Vercel build of `main` (`366507d`) fails.

## Result

- `vp check` passes (one warning: unused `hasMock` in `Testimonials.tsx`, the author's uncommitted edit); `vp test`: 310 passed.
- A clean clone of `366507d` in the agent's scratch folder (the author's dev server runs in the project folder), `vp install`, then `vp run build` with `VERCEL=1`, `CI=1`, and the variables of `.env.local`: exit 0 (`Mail check: passed (transport "smtp", form secret set)`, `Compiled successfully`, every page built).
- The same commit with `VERCEL=1` and no mail variables: `Build stopped: MAIL_TRANSPORT is not set for this deployment …`, exit 1.
- So the code builds; the Vercel build most likely stops in `scripts/check-mail.ts` (the guard of entry 21) because the variables are not in that deployment's environment, or in `check-mock.ts` if `SITE_ENV=production` is set there. Not confirmed: the pasted log ends before the build step.

## Changed files

- This entry, `Prompt Log.md`

## Decisions

- No code change: the build passes with the settings, and the guard stopping a deployment without them is intended (entry 21).

## Open items

- The author: in Vercel → Settings → Environment Variables, check that `MAIL_TRANSPORT`, `SMTP_*`, `MAIL_FROM`, `CONTACT_TO`, and `FORM_SECRET` are set for Production (and Preview), that `SITE_ENV` is not `production`, then redeploy. The line `Build stopped: …` near the end of the build log names the missing variable.

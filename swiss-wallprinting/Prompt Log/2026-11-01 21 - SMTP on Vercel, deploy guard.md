---
tags: [prompt-log]
date: 2026-11-01
agent: Claude Code
status: waiting for the author
---
# 2026-11-01 21 - SMTP on Vercel, deploy guard

## Prompt

> I have problems with smtp on the production, I added all env variables from the local env to vercel's, but it is still bugging

Then, on the offered guard:

> Yes, add the guard

## Goal

Find why the form e-mails fail on Vercel, and stop a Vercel deployment from silently using the development outbox.

## Result

- Read `src/lib/mail.ts` and the shape of `.env.local` (lengths, spaces, quotes; no values). The local setup is valid (Gmail SMTP, port 465, secure). No Vercel access, so the cause is not confirmed.
- Likely causes, given to the author: (1) no redeploy after the variables were added; (2) variables scoped to Production only while testing a preview, so the code fell back to the outbox, which fails on Vercel's read-only file system (`EROFS`), and the build check was skipped because `SITE_ENV` is empty; (3) Gmail refuses the sign-in from Vercel's data-centre IPs (`535`/`534`, a security alert in the mailbox); (4) the app password entered with spaces or `MAIL_FROM` with quotes (Vercel keeps quotes). The `[form]` line in Vercel's Logs tells which.
- Guard: `isDeployed(env)` in `mail.ts` (`SITE_ENV=production` or `VERCEL` set). A deployed site refuses the outbox and a missing `MAIL_TRANSPORT`; `scripts/check-mail.ts` now runs on every Vercel build (previews too), so a deployment without mail settings or `FORM_SECRET` fails at build time with the variable to set. The mock guard is unchanged (previews may still show mock content).
- `vp check` and the mail tests (14) pass; `VERCEL=1 node scripts/check-mail.ts` without settings stops with exit 1, without `VERCEL` it skips.

## Changed files

- `src/lib/mail.ts`
- `src/lib/__tests__/mail.test.ts`
- `scripts/check-mail.ts`
- `.env.example`
- `CLAUDE.md` (Rules for forms, mail transport)

## Decisions

- Vercel is recognised by its own `VERCEL` variable, not by `SITE_ENV`, because `SITE_ENV=production` must stay off while mock content exists (it would stop the build).
- Every Vercel build, previews too, needs the mail settings and `FORM_SECRET`: a preview that cannot send is worse than a failed build.

## Open items

- The author: read the `[form]` line in Vercel's Logs after one form send, set the mail variables for Production and Preview, and redeploy. If it is a Gmail `535`/`534`, confirm Google's security alert or switch to the company SMTP or Resend.
- Committed on `main`, not pushed.

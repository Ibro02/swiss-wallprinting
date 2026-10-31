---
tags: [prompt-log, architecture, refactoring]
date: 2026-10-31
agent: Claude Code (Opus 5.5)
status: in progress
---
# 2026-10-31 03 - Refactoring branch, architecture review

## Prompt

> make a new branch, we need to do refactoring
>
> use this skill
>
> improve-codebase-architecture — https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/SKILL.md
> Really good for reviewing the overall architecture of a codebase.

## Goal

Start a refactoring branch and run the `improve-codebase-architecture` skill again on the code as it is after the client's changes of 2026-10-31.

## Result

- New branch `refactor/architecture` from `main` (f916965). The uncommitted changes of the working tree came along (the missing `.claude/` folder and two prompt log files).
- `.claude/` is still missing from the working tree, so the skill was read from git (`git show HEAD:.claude/skills/improve-codebase-architecture/SKILL.md` and the `codebase-design`, `domain-modeling`, `grilling` skills). The folder was not restored.
- Hot spots from the last 60 commits: `globals.css` (13 changes), `Panel.tsx` (7, now 758 lines), the content collections, the forms. A sub-agent walked the code. Its main finding was checked by hand (`start.ts:44-52`, `quote.ts:110, 159`, `share.test.ts`).
- The HTML report (Tailwind and Mermaid from CDNs) is in the agent's temp scratchpad (`architecture-review-20261031.html`), not in the repo, and was opened in the browser. The same candidates are at the end of [[Specs/Architecture review]].
- Six candidates. The top recommendation is **a configuration module that owns the product rules**, followed by the configurator readout.

## Changed files

- `swiss-wallprinting/Specs/Architecture review.md` (the second review was added at the end)
- This entry; `swiss-wallprinting/Prompt Log/Prompt Log.md`.

## Decisions

- Branch name `refactor/architecture`.
- The unanswered content catalogue grilling of 2026-10-22 is replaced by this review. The author picks again.

## Open items

- The author picks a candidate. Then the `grilling` skill runs, and no code is written until the author confirms.
- `.claude/` (skills, `settings.json` with the attribution block, `launch.json`) is deleted in the working tree but not in git. Ask the author whether to restore it (`git restore .claude`).

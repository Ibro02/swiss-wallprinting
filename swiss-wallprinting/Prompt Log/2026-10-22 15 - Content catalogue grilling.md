---
tags: [prompt-log, architecture, content]
date: 2026-10-22
agent: Claude Code (Opus 5.5)
status: in progress (grilling, round 1 asked)
---
# 2026-10-22 15 - Content catalogue grilling

## Prompt

> Explore candidate 1, the content catalogue module. Start the grilling.

## Goal

Walk the design decisions of candidate 1 of [[Specs/Architecture review]] (one content catalogue module, so that content CRUD is easy) with the `grilling` skill, until the author and the agent share one understanding. No code before the author confirms it.

## Result

- The agent read the content layer again: since the review, `feat/client-brief` (uncommitted, another session) added the `projects` collection and the FAQ page (its questions are keys in `QUESTIONS` plus the four message files); `gallery` is still a collection, shown as a grid under the projects.
- **Round 1** (seven questions, each with the agent's recommendation): who edits the content; which collections the catalogue owns; gallery and projects as one collection or two; when a bad edit fails; which lists in the messages are content (FAQ); a draft mark for agent translations; where and when to build it.

## Changed files

- This entry; `swiss-wallprinting/Prompt Log/Prompt Log.md`.

## Decisions

- **The author chose candidate 1** (the content catalogue module) and the `grilling` skill.

## Open items

- The author's answers to round 1; later rounds: where the content files live and their format, the shape of the records the pages get, ids, photo references (with candidate 2), the rules the catalogue enforces (one room per area, the default preset), the badge for examples.

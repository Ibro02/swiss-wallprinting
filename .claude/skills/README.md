# Project skills

Third-party skills copied into this repo so every agent and teammate gets them. Do not edit them here. To update one, copy the new version from its source and change the commit below.

The copies come from the author's `stake-house` project, which pinned and reviewed them on 2026-10-11. None of them contains code that runs.

| Skill | Source | Commit | License |
|---|---|---|---|
| `improve-codebase-architecture` | https://github.com/mattpocock/skills (`skills/engineering/`) | `49dd158` | MIT, `_licenses/mattpocock-skills.LICENSE` |
| `codebase-design` | same repo, needed by `improve-codebase-architecture` | `49dd158` | MIT |
| `domain-modeling` | same repo, needed by `improve-codebase-architecture` | `49dd158` | MIT |
| `grilling` | same repo (`skills/productivity/`), needed by `improve-codebase-architecture` | `49dd158` | MIT |
| `thermo-nuclear-code-quality-review` | https://github.com/cursor/plugins (`cursor-team-kit/skills/`) | `11713c6` | MIT, `_licenses/cursor-team-kit.LICENSE` |

## Installed elsewhere

- **Plugins** (declared in `.claude/settings.json`; Claude Code offers to install them when the project opens):
  - `superpowers@claude-plugins-official`: https://github.com/obra/superpowers
  - `compound-engineering@compound-engineering-plugin`: https://github.com/EveryInc/compound-engineering-plugin
- **User-level only** (`~/.claude/skills/`), because the source repo has no license and cannot be redistributed:
  - `write-better-error-messages` and `no-ui-flash` from https://github.com/RhysSullivan/skills (`ab3a455`). They are already installed on the author's machine. A new machine must install them by hand.

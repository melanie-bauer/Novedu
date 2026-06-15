---
name: harness-verification
description: Use for issue workflow, reproduce-before-change discipline, evidence registration, verification gates, and closeout.
---

# Harness Verification

Use this skill whenever an issue or feature is implemented.

Run commands from `application/`.

## Flow

1. Run `npm.cmd run harness:status`.
2. Read the issue and relevant skills.
3. Reproduce current behavior.
4. Capture before evidence for UI changes as a `.webm` video.
5. Implement the smallest change.
6. Run focused tests.
7. Run `npm.cmd run verify` when feasible.
8. Capture after evidence for UI changes as a `.webm` video.
9. Update `harness-progress.md`.

## Evidence Registration

```sh
npm.cmd run harness evidence before evidence/before/<file>
npm.cmd run harness evidence checks evidence/checks/<file>
npm.cmd run harness evidence after evidence/after/<file>
```

For UI-facing before/after evidence, register videos only:

```sh
npm.cmd run harness evidence before evidence/before/<name>.webm
npm.cmd run harness evidence after evidence/after/<name>.webm
```

Use screenshots, traces, or logs only as `checks` evidence when video capture is
not available, and explain that fallback in the closeout.

Completion claims should mention which commands ran and any checks that could
not run.

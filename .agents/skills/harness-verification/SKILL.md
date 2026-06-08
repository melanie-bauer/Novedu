---
name: harness-verification
description: Use for issue workflow, reproduce-before-change discipline, evidence registration, verification gates, and closeout.
---

# Harness Verification

Use this skill whenever an issue or feature is implemented.

Run commands from `mvp-harness/`.

## Flow

1. Run `npm.cmd run harness:status`.
2. Read the issue and relevant skills.
3. Reproduce current behavior.
4. Capture before evidence for UI changes.
5. Implement the smallest change.
6. Run focused tests.
7. Run `npm.cmd run verify` when feasible.
8. Capture after evidence for UI changes.
9. Update `harness-progress.md`.

## Evidence Registration

```sh
npm.cmd run harness evidence before evidence/before/<file>
npm.cmd run harness evidence checks evidence/checks/<file>
npm.cmd run harness evidence after evidence/after/<file>
```

Completion claims should mention which commands ran and any checks that could
not run.

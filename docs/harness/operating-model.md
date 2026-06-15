# Harness Operating Model

This harness keeps Novedu changes visible and reviewable. It is deliberately
small: agents must understand the task, reproduce current behavior, implement a
focused change, verify it, and leave evidence.

The runnable harness app lives in `application/`. Run npm commands from that
folder unless a task explicitly says otherwise.

## State Machine

The local state machine has five stages:

1. `intake` - read the issue, `AGENTS.md`, relevant skills, and this operating model.
2. `reproduce` - prove current behavior before editing.
3. `implement` - make the smallest product or harness change that satisfies the issue.
4. `verify` - run checks and collect browser evidence.
5. `close` - update `harness-progress.md` and summarize evidence.

Run:

```sh
cd application
npm run harness:status
npm run harness advance
npm run harness reset
```

## Evidence

Use these paths:

- `application/evidence/before` for current behavior
- `application/evidence/checks` for test output notes, traces, or screenshots
- `application/evidence/after` for changed behavior
- `application/evidence/traces` for Playwright traces

Register every real evidence file:

```sh
cd application
npm run harness evidence before evidence/before/<file>
npm run harness evidence checks evidence/checks/<file>
npm run harness evidence after evidence/after/<file>
```

For browser evidence, prefer the local Playwright CLI:

```sh
cd application
npx.cmd --no-install playwright-cli open http://127.0.0.1:3000
npx.cmd --no-install playwright-cli video-start evidence/before/before.webm
npx.cmd --no-install playwright-cli video-stop
```

Automated E2E tests use `@playwright/test` and keep video on by default.

## Quality Gate

Before claiming completion, run the narrowest relevant checks and normally end
with:

```sh
cd application
npm run verify
```

If a check cannot run, record why in the final response and add the strongest
available evidence.

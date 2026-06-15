---
name: playwright-cli
description: Use when browser evidence, screenshots, videos, snapshots, or manual UI verification are needed for the Novedu harness.
---

# Playwright CLI Evidence

Use this skill for visible before/after evidence. Automated tests use
`@playwright/test`; this skill is for browser work that should be easy to
review. UI-facing before/after evidence should be recorded as `.webm` video.

Run commands from `application/`.

## Commands

On Windows, prefer the project-local CLI:

```sh
cd application
npx.cmd --no-install playwright-cli --version
npx.cmd --no-install playwright-cli open http://127.0.0.1:3000
npx.cmd --no-install playwright-cli snapshot
npx.cmd --no-install playwright-cli video-start evidence/before/before.webm
npx.cmd --no-install playwright-cli video-stop
npx.cmd --no-install playwright-cli video-start evidence/after/after.webm
npx.cmd --no-install playwright-cli video-stop
```

Register evidence after creating it:

```sh
cd application
npm.cmd run harness evidence before evidence/before/before.webm
npm.cmd run harness evidence after evidence/after/after.webm
```

## Rules

- Capture current behavior before editing UI flows.
- Capture changed behavior after implementation.
- Register before/after UI evidence as `.webm` videos in the matching evidence
  folder.
- Keep bulky artifacts ignored; only `.gitkeep` files stay committed.
- If video is unavailable, use screenshots or Playwright traces as `checks`
  evidence and explain why.

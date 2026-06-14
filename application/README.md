# Novedu MVP Harness

This folder contains the runnable NextJS harness for the Novedu MVP.

## Run Locally

From the repository root:

```sh
cd application
npm.cmd run dev
```

Then open:

```text
http://127.0.0.1:3000
```

The protected chat page is:

```text
http://127.0.0.1:3000/chat
```

In tests, `/chat` is accessed with the explicit `novedu-mock-session` cookie.
Production auth is intended to use Auth.js with Microsoft Entra ID.

## Verify

```sh
cd application
npm.cmd run verify
```

This runs typecheck, Biome, unit tests, browser component tests, Next build, and
Playwright E2E tests.

## Harness Workflow

```sh
cd application
npm.cmd run harness:status
```

Read the root `AGENTS.md` and `docs/harness/operating-model.md` before making
task changes.

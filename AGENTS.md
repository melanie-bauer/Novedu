# Novedu MVP Harness

This branch is the agent harness for the real Novedu MVP. It is a green,
minimal NextJS baseline in `application/` that future agents can extend in
small, verifiable pieces.

## Start Here

1. Read this file.
2. Read `docs/harness/operating-model.md`.
3. Run `npm run harness:status` from `application/`.
4. Read the issue or task.
5. Reproduce current behavior before editing.
6. Add or update focused tests.
7. Record before/check/after evidence for UI-facing changes.

## Stack

- NextJS App Router
- TypeScript
- Auth.js with Microsoft Entra ID as the production auth target
- AG-UI as the fixed frontend/backend stream contract
- Mastra as the provider-independent agent runtime target
- CoPilotKit as the chat UI target
- GitHub-backed agent configuration, tested through local fixtures
- Biome, Vitest, Playwright, and local `@playwright/cli`

## Local Skills

Use repo-local skills from `.agents/skills` when a task touches that area:

- `playwright-cli` for browser evidence and visible before/after recordings
- `find-docs` for current library documentation
- `nextjs-app-router` for route, layout, server/client component decisions
- `auth-entra` for Auth.js and Microsoft Entra ID work
- `agui-contract` for stream events and parser/emitter changes
- `mastra-agent-runtime` for agent/provider runtime boundaries
- `copilotkit-chat-ui` for chat UI integration
- `github-config-store` for tutor config schemas and GitHub adapter work
- `security-privacy-review` for school privacy, auth, and persistence checks
- `harness-verification` for evidence and closeout workflow

## Commands

Run these from `application/`:

- `npm run dev` starts the app.
- `npm run typecheck` checks TypeScript.
- `npm run lint` runs Biome.
- `npm run test` runs unit tests.
- `npm run test:browser` runs browser component tests.
- `npm run test:e2e` runs Playwright tests.
- `npm run verify` runs the full verification chain.
- `npm run harness:status` prints the current harness stage.

## Rules

- Keep CI green. Future MVP work belongs in `docs/mvp-implementation-tasks.md`
  or `test.todo`, not failing baseline tests.
- Keep AG-UI stable between UI and backend. Mastra and provider choices stay
  behind backend adapters.
- Do not introduce a database for MVP agent configs. Use local fixtures in tests
  and the GitHub config adapter for production work.
- Do not store chat history, uploaded document content, passwords, or secrets
  unless a later task explicitly changes the privacy model.
- For UI changes, prefer Playwright evidence before and after the change.

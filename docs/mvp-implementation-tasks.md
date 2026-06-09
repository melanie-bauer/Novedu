# Novedu MVP GitHub Issue Backlog

This backlog is ordered for implementation. UI and chat experience come first so
the team can validate the real product shape early. Auth, simple config
persistence, and provider integrations are added once the chat harness is useful
and covered by tests.

The MVP does not implement class-specific tutor releases, tutor preview/testing,
or version history UI. Teachers create and edit tutors as `.yaml` files in a
GitHub repository; the app loads those tutor configs.

## Issue 1: Stabilize MVP harness baseline

**Goal**
Keep the harness branch green and make the project easy for agents and humans to
work in.

**Description**
The current `mvp-harness` folder should remain the executable workspace for the
MVP. This issue is complete when the baseline project structure, scripts,
instructions, and CI are stable.

**Acceptance Criteria**
- `mvp-harness` contains the runnable NextJS app and all app-level tool config.
- Root `AGENTS.md` points agents to `mvp-harness` and the relevant skills.
- `npm.cmd run verify` passes from `mvp-harness`.
- GitHub Actions runs the same verification chain on pull requests.
- No legacy `frontend` or `backend` artifacts are part of the branch.

**Verification**
- Run `npm.cmd run verify` from `mvp-harness`.
- Confirm `git status` only shows intentional harness files.

## Issue 2: Redesign the MVP chat UI shell

**Goal**
Replace the placeholder chat surface with a polished, desktop-first Novedu chat
layout.

**Description**
The chat page should feel like the first usable product screen, not a demo page.
It needs a tutor/sidebar area, chat header, message timeline, composer, upload
entry point, and clear empty/loading/error states.

**Acceptance Criteria**
- `/chat` has a structured app layout with sidebar, tutor context, message area,
  and composer.
- The UI works at common desktop sizes and remains usable on smaller screens.
- Chat controls have stable dimensions and do not shift layout during loading.
- Empty state, streaming state, and error state are visually distinct.
- No visible instructional filler text explains implementation details.

**Verification**
- Add or update browser component tests for the shell.
- Add Playwright coverage for reaching the chat page.
- Capture before/after UI evidence when implementing.

## Issue 3: Implement CoPilotKit chat shell

**Goal**
Use CoPilotKit as the chat UI integration layer while keeping AG-UI as the
backend boundary.

**Description**
Replace the handcrafted chat interaction with a CoPilotKit-based shell or
adapter. The UI must still receive backend data through the AG-UI-compatible
stream route rather than calling provider or Mastra internals directly.

**Acceptance Criteria**
- CoPilotKit is initialized in the NextJS app with the smallest useful provider
  setup.
- Chat submission flows through the Novedu chat route.
- The frontend does not import Mastra/provider runtime code.
- Existing mock stream tests still pass or are replaced by equivalent
  CoPilotKit-aware tests.
- The UI remains usable without real provider credentials.

**Verification**
- Unit test the frontend/backend adapter boundary where practical.
- Browser test the chat input and rendered assistant response.
- Playwright test a full mocked chat send/receive flow.

## Issue 4: Add production message rendering for Markdown, LaTeX, and code

**Goal**
Render educational content correctly, especially math formulas and programming
answers.

**Description**
Replace the placeholder renderer with a production-ready message rendering
pipeline for Markdown, LaTeX math, syntax-highlighted code blocks, and copy
buttons.

**Acceptance Criteria**
- Markdown paragraphs, lists, links, and emphasis render correctly.
- Inline and block LaTeX formulas render correctly.
- Code blocks show language labels where available.
- Code blocks have a copy button with accessible feedback.
- Long code and long formulas do not break the layout.
- Rendering handles malformed Markdown/LaTeX gracefully.

**Verification**
- Unit test renderer parsing/fallback behavior.
- Browser test math and code rendering.
- Playwright test a mocked answer containing Markdown, LaTeX, and code.

## Issue 5: Implement temporary document upload UI and session context

**Goal**
Allow document uploads for chat context without persisting files beyond the
visible chat session.

**Description**
Users should be able to attach files to the current chat. Files are kept only in
browser/session memory for as long as that chat is visible. The MVP must not
write uploaded content to persistent storage.

**Acceptance Criteria**
- Users can select supported file types through the chat composer.
- The UI shows attached files in the current chat context.
- File type, file size, and file count limits are enforced before backend use.
- Users can remove an attached file before sending.
- Uploaded file content is not stored in localStorage, sessionStorage, cookies,
  GitHub, or any database.
- Attachments are cleared when the visible chat session is cleared or left.
- Tests document that upload state is temporary.

**Verification**
- Unit test file validation.
- Browser test attach/remove behavior.
- Playwright test that attachments appear in-chat and disappear after session
  reset/navigation.

## Issue 6: Expand AG-UI contract layer

**Goal**
Make AG-UI the stable contract between frontend and backend.

**Description**
The existing event parser should be extended to support the event shapes needed
by CoPilotKit, streaming messages, errors, tool calls, state updates, and custom
A2UI surfaces.

**Acceptance Criteria**
- AG-UI event schemas cover all MVP stream events.
- Invalid event frames fail with clear errors.
- Stream parsing supports chunked server-sent event data.
- Custom events are typed enough for tutor metadata and UI surfaces.
- Frontend tests consume only AG-UI events, not provider-native responses.

**Verification**
- Unit test valid and invalid event frames.
- Unit test chunked stream parsing.
- E2E test mocked AG-UI streaming into the chat UI.

## Issue 7: Build deterministic mock chat runtime

**Goal**
Keep local development and CI independent of real LLM credentials.

**Description**
The mock runtime should simulate realistic assistant streaming, error states,
tutor metadata, Markdown, LaTeX, code, and attachment-aware responses.

**Acceptance Criteria**
- Mock runtime streams deterministic AG-UI events.
- Mock responses can include Markdown, LaTeX, code, and error cases.
- Mock runtime can acknowledge temporary file attachments by name/metadata
  without persisting content.
- CI does not require provider credentials.

**Verification**
- Unit test mock runtime output.
- E2E test happy path and error path.

## Issue 8: Finalize global YAML agent/tutor config schema

**Goal**
Define the MVP YAML shape for globally available tutors.

**Description**
The schema should represent the tutor fields needed for the MVP in `.yaml`
files: identity, subject, prompt, model, feature flags, and metadata for future
migration. The MVP does not support class-specific assignments.

**Acceptance Criteria**
- Schema validates tutor id, display name, subject, description, prompt, model,
  and feature flags.
- Schema supports file upload, LaTeX, syntax highlighting, and future tool flags.
- Invalid configs produce useful validation messages.
- Schema uses stable field names intended for GitHub-stored YAML files.
- YAML examples are documented for teacher-authored tutor configs.
- Fixtures cover at least math and programming tutors.
- Schema does not expose class-specific visibility or role-specific ownership in
  the MVP.

**Verification**
- Unit test valid fixtures.
- Unit test missing/invalid fields.
- Document schema assumptions in the relevant skill or docs.

## Issue 9: Implement local fixture config store

**Goal**
Keep tutor config tests hermetic before GitHub persistence is added.

**Description**
The app should load tutor configs from local fixtures in development/test mode
through the same interface that the GitHub adapter will later implement.

**Acceptance Criteria**
- Config store interface supports listing tutor configs.
- Fixture store reads from committed test fixtures.
- UI can display available fixture tutors.
- Invalid fixture data fails fast with schema errors.

**Verification**
- Unit test fixture loading.
- Browser or E2E test tutor selection from fixture data.

## Issue 10: Add global tutor selection and chat session model

**Goal**
Let users start a visible temporary chat with any globally available tutor.

**Description**
The MVP needs a simple in-memory chat session model. A user selects a globally
available tutor, starts a chat, sees messages, and can reset the current chat.
The chat exists only while visible in the browser session.

**Acceptance Criteria**
- User can select a tutor before or inside `/chat`.
- All configured tutors are visible to all authenticated users.
- There is no class filter and no role-specific tutor list.
- Current chat stores messages in memory only.
- Resetting or leaving the visible chat clears messages and attachments.
- Tutor metadata is visible in the chat header.
- No chat history is persisted.

**Verification**
- Unit test session reducer/state helpers.
- Browser test tutor selection and reset behavior.
- E2E test a full temporary chat lifecycle.

## Issue 11: Implement Mastra runtime adapter

**Goal**
Map Novedu tutor configs into Mastra agent runtime calls without provider lock-in.

**Description**
Mastra should sit behind a Novedu runtime interface. The frontend continues to
receive AG-UI events, and provider-specific details stay behind backend
adapters.

**Acceptance Criteria**
- Runtime adapter accepts validated tutor config and chat input.
- Runtime adapter emits provider-independent text/tool chunks.
- AG-UI route converts runtime chunks into AG-UI events.
- Mastra code is not imported by frontend components.
- Mock runtime remains available for tests.

**Verification**
- Unit test config-to-runtime mapping.
- Unit test runtime-to-AG-UI conversion.
- E2E test still passes with mock runtime.

## Issue 12: Add model adapter abstraction for locally hosted models

**Goal**
Connect the MVP to locally hosted models while keeping the model runtime
replaceable.

**Description**
Add a model adapter abstraction and implement the first adapter for the locally
hosted model endpoint used by Novedu. The UI must not know where the model runs.
Future hosted or cloud providers can still be added behind the same interface if
needed, but they are not the MVP default.

**Acceptance Criteria**
- Model adapter interface supports streaming text responses.
- Local model endpoint URL and credentials, if any, are read only from
  environment variables.
- Missing endpoint configuration produces a clear non-secret error.
- Model selection comes from tutor YAML config.
- Frontend code does not change when the backend model adapter changes.
- CI keeps using the deterministic mock runtime, not a real local model.

**Verification**
- Unit test model adapter selection.
- Unit test missing local endpoint configuration.
- Keep CI using mock runtime only.

## Issue 13: Load tutor YAML configs from GitHub

**Goal**
Load agent/tutor configuration from GitHub without introducing a database.

**Description**
Implement config loading behind the config store interface. Teachers create and
edit tutor configs as `.yaml` files in a GitHub repository. The MVP app reads
those YAML files, validates them, and exposes valid tutors globally to all
authenticated users. The MVP does not expose version history, rollback, commit
review, pull-request workflows, or YAML editing in the UI.

**Acceptance Criteria**
- Config adapter can list tutor `.yaml` files from the configured GitHub repo path.
- Config adapter parses and validates YAML before returning tutors.
- Invalid YAML files produce clear non-secret errors.
- Valid tutors are globally available in the app.
- The MVP UI does not show version history, commits, pull requests, rollback, or
  diff/compare/YAML editing views.
- Credentials are read from environment variables and never logged.
- Fixture store remains the default for CI.

**Verification**
- Unit test with mocked GitHub responses.
- Integration test can be skipped unless credentials are present.
- Security review confirms no credential leakage.

## Issue 14: Add Auth.js Microsoft Entra ID login

**Goal**
Replace mock access with production-ready Microsoft Entra ID login.

**Description**
Auth is important for production but should not block early UI iteration. Once
the chat shell is useful, wire Auth.js with Microsoft Entra ID and keep explicit
test auth paths for CI. The MVP uses authentication only for access, not for
role-specific product behavior.

**Acceptance Criteria**
- Auth.js is configured for Microsoft Entra ID.
- Required env vars are documented.
- Login and logout routes work in production mode.
- No local password login is introduced.
- Tests can still use mock auth without real Entra credentials.
- Authenticated users can access the globally available tutor list. Tutor YAML
  authoring happens outside the app in GitHub.

**Verification**
- Unit test auth option construction.
- E2E test unauthenticated redirect.
- Manual smoke test with real Entra credentials when available.

## Issue 15: Add protected routing without MVP role differences

**Goal**
Require login for the app while keeping MVP functionality role-neutral.

**Description**
Protect chat routes server-side. The MVP may read identity claims, but tutor
authoring happens outside the app in GitHub YAML files.

**Acceptance Criteria**
- `/chat` requires a valid session.
- All authenticated users see the same globally loaded tutor list.
- There is no tutor creation/editing surface inside the MVP app.
- Authorization failures show clear UI.

**Verification**
- Unit test session/access helpers.
- E2E test unauthenticated redirect.
- E2E test authenticated access to chat and global tutor list.

## Issue 16: Add security and privacy review gate

**Goal**
Make privacy constraints explicit before MVP rollout.

**Description**
The MVP must avoid accidental persistence and secret leakage. Add a review
checklist and tests for the most important privacy-sensitive behavior.

**Acceptance Criteria**
- No local passwords.
- No uploaded file content is persisted.
- No chat history is persisted in the MVP.
- No secrets are logged or committed.
- Evidence files do not contain real student data.
- EU/self-hosting assumptions are documented where deployment choices appear.

**Verification**
- Add privacy checklist to docs or harness progress template.
- Add tests for no local/session storage of uploads where practical.
- Run secret search before release-oriented PRs.

## Issue 17: Build MVP acceptance E2E suite

**Goal**
Cover the real MVP workflow end to end.

**Description**
Once the main pieces are in place, create acceptance tests that prove the system
works from the user's perspective.

**Acceptance Criteria**
- E2E covers login or mock-authenticated access.
- E2E covers global tutor selection.
- E2E covers temporary chat lifecycle.
- E2E covers AG-UI streaming response.
- E2E covers upload validation and temporary attachment clearing.
- E2E covers Markdown, LaTeX, and code rendering.
- E2E covers config loading from fixture store.
- E2E does not assume class-specific tutor visibility or in-app tutor editing.

**Verification**
- `npm.cmd run test:e2e` passes.
- `npm.cmd run verify` passes.
- Playwright videos are available in test results for review.

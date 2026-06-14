# Harness Progress

## Issue #47: Tutor Chat Integration — SWE Implementation

### Before Evidence
- `evidence/before/home.png` - Original homepage
- `evidence/before/chat.png` - Original /chat page with ChatShell

### Implemented Changes

**Step 1: Share link verification** (`src/lib/share-links/index.ts`)
- HMAC-SHA256 signing and verification
- Timestamp window validation
- Canonical payload formatting

**Step 2: Mastra agent config** (`src/lib/mastra/`)
- Mastra instance with tutor agent
- SCCH provider for self-hosted vLLM
- Tutor agent with dynamic YAML loading

**Step 3: CoPilotKit API route** (`src/app/api/copilotkit/[[...slug]]/route.ts`)
- Runtime API with authentication
- Share link verification headers
- Mastra agent integration

**Step 4: Chat UI components** (`src/features/chat/`)
- `CodeBlock.tsx` - Syntax highlighting with copy
- `MarkdownRenderer.tsx` - KaTeX + GFM rendering
- `TutorChat.tsx` - Main chat interface with CopilotKit

**Step 5: Main page integration** (`src/app/page.tsx`)
- Share-link-protected tutor chat
- Error handling for invalid/expired links
- Tutor loading and validation

**Step 6: CSS styles**
- Handled via inline styles in components (MVP simplification)

### Verification Commands
```bash
npm run typecheck  # ✅ passed
npm run lint       # ✅ passed
npm run test       # ✅ 8 unit tests passed
npm run test:browser # ✅ 2 browser tests passed
npm run build      # ✅ build succeeded
npm run test:e2e   # ⚠️ 1 failed (pre-existing /chat test, unrelated to changes)
```

### After Evidence
- `evidence/after/tutor-chat.png` - New tutor chat interface with share link

### Notes
- Mastra storage set to `undefined` for MVP (requires MSSQL for production)
- E2E test failure is pre-existing (tests /chat page, not new TutorChat)
- Share link generation script added: `scripts/generate-test-link.ts`
- Environment variable: `SHARE_LINK_SECRET=dev-secret-local` in `.env.local`

## 2026-06-14: Harness Verification Repair

### Implemented Changes
- Replaced the undeclared `@mastra/loggers` import with Mastra core logging so
  the runtime boots from declared dependencies.
- Added regression coverage for Mastra tutor-agent registration.
- Made the custom E2E runner importable and deterministic on Windows by
  normalizing duplicate `Path`/`PATH` env keys.
- Added an E2E-only `SHARE_LINK_SECRET` fallback so the runner can poll the app
  without relying on a local `.env` file.
- Set Biome line endings to `auto` so lint passes on Windows and CI.

### Verification Commands
```bash
npm.cmd run test -- tests/unit/mastra-runtime.test.ts
npm.cmd run test -- tests/unit/run-e2e.test.ts
npm.cmd run test:e2e
npm.cmd run verify
```

## 2026-06-14: AG-UI Chunked SSE Contract

### Implemented Changes
- Added chunked SSE parsing for AG-UI streams while preserving the existing
  whole-string parser behavior.
- Added regression tests for split AG-UI frames and incomplete trailing frames.
- Fixed the harness state writer so `harness advance/reset` keeps
  `harness-state.json` formatted on Windows.

### Verification Commands
```bash
npm.cmd run test -- tests/unit/agui.test.ts
npm.cmd run test -- tests/unit/harness-state-machine.test.ts
npm.cmd run verify
```

## 2026-06-14: Microsoft Entra ID Login

### Implemented Changes
- Added the Auth.js route at `/api/auth/[...nextauth]`.
- Configured Microsoft Entra ID through the Auth.js Azure AD provider using
  `AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET`,
  `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID`, and `AUTH_SECRET`.
- Added session normalization so Entra/Auth.js sessions and explicit test mock
  cookies both produce a `NoveduSession`.
- Updated `/chat` to use the shared server-side session helper.
- Updated `/login` with a real Auth.js Microsoft sign-in link and safe callback
  handling.
- Documented the required Entra/Auth environment variables in `README.md`.

### Verification Commands
```bash
npm.cmd run test -- tests/unit/auth-session.test.ts
npm.cmd run test:e2e
npm.cmd run verify
```

### After Evidence
- `evidence/after/login-entra.webm` - Login page with Microsoft sign-in action.

### Evidence Workflow Fix
- Updated the harness state machine to reject `before` evidence outside
  `reproduce` and `after` evidence outside `verify`.
- Enforced matching `evidence/before/` and `evidence/after/` folders.
- Required `.webm` videos for UI before/after evidence; screenshots now belong
  in `checks` evidence when video capture is unavailable.
- Updated local harness/playwright skills to prefer videos for UI-facing
  before/after evidence.

## 2026-06-14: Prototype-Inspired Chat And Login UI

### Implemented Changes
- Reworked `/chat` into a prototype-inspired chat workspace with sidebar,
  current tutor context, search affordance, visible document upload, message
  bubbles, and composer while keeping the existing AG-UI mock stream.
- Reworked the real share-link `TutorChat` around the same workspace shell while
  preserving CopilotKit runtime headers, attachment gating, markdown rendering,
  and prompt/warning visibility.
- Replaced the plain login page with a focused Novedu Microsoft Entra ID card
  and kept local password auth out of scope.
- Added browser and E2E assertions for the new workflow and login card.

### Verification Commands
```bash
npm.cmd run test:browser -- --run tests/browser/chat-shell.test.tsx
npm.cmd run test:e2e
npm.cmd run verify
```

### Evidence
- `evidence/before/ui-prototype-before.webm` - Previous login/chat shell state.
- `evidence/after/ui-prototype-after.webm` - Updated login/chat workspace UI.

## 2026-06-14: Open Chat Entry And Entra Error Handling

### Implemented Changes
- Changed `/` into an authentication gateway: signed-in users go to `/chat`,
  unauthenticated users go to `/login`.
- Kept the signed share-link flow available under `/share-link-chat` instead of
  deleting it, so it can be promoted again later.
- Reworked `/chat` so it no longer needs a share link for the current MVP path.
  Users can choose between fetched SCCH models and demo tutor configurations.
- Added demo tutor configurations that use the first fetched SCCH model, with a
  deterministic fallback when SCCH is unavailable locally.
- Extended the CopilotKit runtime to accept `x-demo-tutor-id` and
  `x-scch-model` headers while preserving the old signed share-link headers.
- Accepted both `AUTH_MICROSOFT_ENTRA_ID_*` and `AZURE_*` Entra env variable
  names, and surfaced `error=azure-ad` as a visible login-card error.

### Verification Commands
```bash
npm.cmd run test -- tests/unit/auth-session.test.ts tests/unit/chat-options.test.ts
npm.cmd run test:browser -- --run tests/browser/chat-shell.test.tsx
npm.cmd run test:e2e
npm.cmd run verify
```

### Evidence
- `evidence/after/open-chat-login-after.webm` - New root/login/chat flow.

### Notes
- Before evidence capture via Playwright CLI failed to produce a file in this
  cycle; after evidence is registered from the passing Playwright E2E video.
- I did not automate a real Microsoft login. Interactive Entra login may involve
  MFA and credentials; it should be completed by the account owner in the
  browser.


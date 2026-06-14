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


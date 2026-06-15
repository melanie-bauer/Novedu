---
name: copilotkit-chat-ui
description: Use for CoPilotKit chat UI integration, message rendering, upload affordances, Markdown, LaTeX, and code block behavior.
---

# CoPilotKit Chat UI

CoPilotKit is the target chat UI layer. The harness starts with a minimal shell
so tests can define expected behavior before the full UI is wired.

## Rules

- Keep message rendering accessible and testable.
- Preserve AG-UI as the backend stream contract.
- Render math, code blocks, and upload controls without layout shifts.
- Do not store uploaded file contents in the MVP unless a later task changes the privacy model.

## Verification

- Browser component tests for rendering.
- E2E tests for chat stream behavior.
- Playwright evidence for UI-facing changes.

---
name: mastra-agent-runtime
description: Use for Mastra agent setup, provider-independent runtime adapters, streaming, tool calls, and model/provider boundaries.
---

# Mastra Agent Runtime

Mastra is the target agent framework, but Novedu must stay provider-independent.

## Rules

- Keep provider details behind runtime adapters.
- Convert agent configs into runtime inputs in one place.
- Stream outward through AG-UI, not provider-native response shapes.
- Keep demo/runtime fixtures deterministic for tests.
- Do not couple tutor config schemas to a single LLM provider.

## Verification

- Unit test the runtime interface.
- Unit test provider selection behavior.
- E2E should observe AG-UI output, not Mastra internals.

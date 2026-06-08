---
name: agui-contract
description: Use for AG-UI event schemas, server-sent event parsing, stream emission, custom events, and frontend/backend chat boundaries.
---

# AG-UI Contract

AG-UI is the fixed boundary between the chat frontend and backend runtime. Do
not let UI code depend on Mastra/provider internals.

## Baseline Events

- `RUN_STARTED`
- `TEXT_MESSAGE_START`
- `TEXT_MESSAGE_CONTENT`
- `TEXT_MESSAGE_END`
- `RUN_FINISHED`
- `RUN_ERROR`
- `CUSTOM`

## Rules

- Validate inbound and outbound events.
- Keep parsing deterministic and covered by unit tests.
- Add new events through schema changes plus tests.
- Keep custom A2UI payloads behind typed helpers.

## Verification

Run:

```sh
npm.cmd run test
npm.cmd run test:e2e
```

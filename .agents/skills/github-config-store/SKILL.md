---
name: github-config-store
description: Use for agent config schemas, local fixtures, GitHub repository reads/writes, validation, and config migration behavior.
---

# GitHub Config Store

Agent and tutor configs are stored as files in a GitHub repository. Tests use
local fixtures so CI stays hermetic.

## Rules

- Validate configs with schemas before use.
- Keep fixture store and GitHub store behind the same interface.
- Do not introduce a database for agent configs in this MVP harness.
- Write future GitHub changes as reviewable commits.
- Avoid logging config secrets or access tokens.

## Verification

- Unit test valid and invalid fixtures.
- Unit test adapter error paths.
- Use GitHub API mocks only when implementing the real adapter.

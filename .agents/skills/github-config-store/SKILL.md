---
name: github-config-store
description: Use for agent config schemas, local fixtures, GitHub-hosted YAML tutor configs, validation, and config migration behavior.
---

# GitHub Config Store

Agent and tutor configs are stored as `.yaml` files in a GitHub repository.
Teachers create and edit those YAML files outside the MVP app. Tests use local
fixtures so CI stays hermetic.

## Rules

- Validate configs with schemas before use.
- Keep fixture store and GitHub store behind the same interface.
- Parse and validate YAML before exposing tutors to the app.
- Do not introduce a database for agent configs in this MVP harness.
- Do not add in-app YAML editing, version history, rollback, or pull request UI
  for the MVP.
- Avoid logging config secrets or access tokens.

## Verification

- Unit test valid and invalid fixtures.
- Unit test adapter error paths.
- Use GitHub API mocks only when implementing the real adapter.

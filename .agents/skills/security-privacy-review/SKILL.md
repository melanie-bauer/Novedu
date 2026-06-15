---
name: security-privacy-review
description: Use for privacy, school compliance, authentication, persistence, secrets, upload safety, and deployment risk review.
---

# Security And Privacy Review

Novedu is for schools. Privacy and operational clarity matter even in the MVP.

## Checklist

- No local passwords.
- No secrets in source, logs, screenshots, or evidence.
- No unintended chat persistence.
- No uploaded document content persisted unless explicitly required.
- Clear authorization failures.
- European/self-hostable deployment assumptions are not contradicted.
- Provider calls stay behind adapters.

## Verification

- Search for accidental secrets before finalizing.
- Confirm test fixtures do not contain real personal data.
- Add tests for authorization or persistence-sensitive behavior when changed.

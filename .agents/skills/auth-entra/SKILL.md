---
name: auth-entra
description: Use for Microsoft Entra ID, Auth.js, sessions, roles, claims, protected routes, and login/logout behavior.
---

# Auth.js And Microsoft Entra ID

Novedu uses Microsoft Entra ID as the only real identity provider. Local
passwords are out of scope.

## Expected Env Vars

- `AUTH_SECRET`
- `AUTH_MICROSOFT_ENTRA_ID_ID`
- `AUTH_MICROSOFT_ENTRA_ID_SECRET`
- `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID`
- `NEXTAUTH_URL` or the Auth.js equivalent required by the chosen version

## Rules

- Do not add local password auth.
- Keep mock auth explicit and test-only.
- Map roles from Entra claims or groups through a small helper with unit tests.
- Protect `/chat` and later admin routes on the server.
- Show authorization failures clearly in UI.

## Verification

- Unit test claim-to-role mapping.
- E2E test unauthenticated redirect.
- E2E test authenticated access with mock session.

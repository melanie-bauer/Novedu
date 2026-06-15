# Novedu MVP Harness

This folder contains the runnable NextJS harness for the Novedu MVP.

## Run Locally

From the repository root:

```sh
cd application
npm.cmd run dev
```

Then open:

```text
http://127.0.0.1:3000
```

The protected chat page is:

```text
http://127.0.0.1:3000/chat
```

In tests, `/chat` is accessed with the explicit `novedu-mock-session` cookie.
Production auth is intended to use Auth.js with Microsoft Entra ID.

## Microsoft Entra ID Auth

Production login uses Auth.js with the Azure AD / Microsoft Entra ID provider.
Configure these runtime environment variables:

```text
AUTH_SECRET=
AUTH_MICROSOFT_ENTRA_ID_ID=
AUTH_MICROSOFT_ENTRA_ID_SECRET=
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=
NEXTAUTH_URL=
```

The redirect URI in Entra ID must point to:

```text
https://<your-app-host>/api/auth/callback/azure-ad
```

## Verify

```sh
cd application
npm.cmd run verify
```

This runs typecheck, Biome, unit tests, browser component tests, Next build, and
Playwright E2E tests.

## Harness Workflow

```sh
cd application
npm.cmd run harness:status
```

Read the root `AGENTS.md` and `docs/harness/operating-model.md` before making
task changes.

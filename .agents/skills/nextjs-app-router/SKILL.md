---
name: nextjs-app-router
description: Use for NextJS App Router pages, layouts, route handlers, server/client component boundaries, middleware, and build behavior.
---

# NextJS App Router

This harness uses a root-level NextJS App Router app.

## Rules

- Put routes under `src/app`.
- Use server components by default.
- Add `"use client"` only for interactive components.
- Keep route handlers small and push contract logic into `src/lib` or `src/features`.
- Read local Next types/docs before relying on memory for APIs.

## Checks

Run at least:

```sh
npm.cmd run typecheck
npm.cmd run build
```

For UI route changes, add or update Playwright coverage.

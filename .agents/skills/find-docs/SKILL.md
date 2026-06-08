---
name: find-docs
description: Use when current documentation is needed for a library, framework, SDK, CLI, cloud service, or version-specific API.
---

# Documentation Lookup

Use current primary documentation before changing library-specific code. This is
mandatory for NextJS, Auth.js, Mastra, CoPilotKit, AG-UI, Playwright, Biome, and
Microsoft Entra ID when API details matter.

## Source Priority

1. Local package docs or type declarations in `node_modules`.
2. Official project documentation.
3. Package repository README and examples.
4. Community sources only as secondary context.

## Workflow

- Identify the exact package and installed version.
- Read the narrowest relevant docs or type declarations.
- Record important assumptions in the implementation or final response.
- Do not include secrets, tokens, private tenant IDs, or student data in doc queries.

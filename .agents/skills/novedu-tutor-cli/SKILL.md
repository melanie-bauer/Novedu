---
name: novedu-tutor-cli
description: >-
  Validate a Novedu tutor YAML -- or a fragment library on its own -- with the
  `novedu-cli` CLI, which runs the exact same checks the app enforces (YAML parse,
  tutor + fragment-file schema, cross-reference and variable consistency,
  per-fragment template rendering, system-prompt assembly). Use this skill
  whenever the user wants to validate, check, lint, or verify a tutor YAML or a
  fragment library, debug tutor/fragment schema or template errors, sanity-check
  fragment files or `tutor_instructions`/`fragment_files`, or confirm a tutor is
  correct before committing or publishing it -- even if they don't name the CLI.
  Validating a tutor now also fully validates every fragment library it
  references; validate a library by itself with `--kind fragment`.

  Reach for it on phrasings like "is this tutor valid?", "check my tutor.yaml",
  "is this fragment library okay?", "why won't this tutor load?", "did I break the
  fragments?", or any request to verify a tutor or fragment file authored for the
  Novedu chat app. Prefer this CLI over reading the YAML by eye or re-deriving the
  rules -- the CLI is the source of truth and reports precise error codes you can
  act on.
---

# Validating tutor YAML with `novedu-cli`

`novedu-cli` is the command-line companion for the Novedu chat app. Its first
command, `validate`, takes a tutor YAML (a local file or a public URL) and runs
the **same** validation pipeline the app uses: parse YAML → schema-check the
tutor and every referenced fragment file → check that fragment references and
their variables line up → **strict-render every fragment in every referenced
library** → assemble the final system prompt. If all of that succeeds the tutor
is valid.

With `--kind fragment`, `validate` instead checks a **fragment library on its
own**: parse YAML → schema-check the file → ensure fragment ids are unique →
strict-render each fragment's template against its own declared `input_schema`
(catching syntax errors and references to undeclared variables). This is the way
to verify a library a fragment author maintains, without needing a tutor.

A tutor (or fragment file) that passes here is the same one the app will accept —
so this is the authoritative way to check one, not a re-implementation to
second-guess. Note that validating a tutor is **thorough**: it renders even
fragments the tutor doesn't use, so a latent template bug anywhere in a
referenced library fails the tutor.

- **Exit code `0`** = valid, **`1`** = errors found. That makes it usable as a
  pre-commit / CI gate.
- `validate` is the only command today; the CLI is built to grow, so check
  `--help` if a task sounds like it might be covered by a newer command.

## Pick the right invocation: inside the repo vs. outside

The command differs depending on **where you are**. Decide first:

**Inside the app repo** — the working directory is the chat-prototype /
`novedu-chat-mvp` repository (tell-tale signs: the root `package.json` has
`"name": "chat-prototype"` and a `cli/` workspace; the tutor fixtures live in
`tutors/`). Run it straight from source, no build or install needed:

```bash
npm run cli -- validate <pathOrUrl> [--json]
```

Use this form in the repo because it runs the live workspace code, so it reflects
any local edits to the validation core (`lib/tutors`) — and there's nothing to
install. (The `--` passes the rest of the arguments through to the CLI.)

**Outside the repo** — any other folder, e.g. a teacher authoring tutors in their
own directory. Use the published package via `npx`:

```bash
npx @novedu/cli validate <pathOrUrl> [--json]
```

> `@novedu/cli` is published on npm, so `npx` fetches it on demand — no install
> or clone needed. Add `@latest` (`npx @novedu/cli@latest …`) to force the newest
> version if a stale one is cached. If `npx` genuinely can't reach the package,
> it's a network/registry issue, not a missing publish.

**How to decide:** if the current directory (or the file you're validating) is
inside the app repo, use `npm run cli`; otherwise use `npx @novedu/cli`. When
unsure, a quick check for a root `package.json` named `chat-prototype` settles it.

## The `validate` command

```
validate <pathOrUrl> [--kind tutor|fragment] [--json]
```

- **`<pathOrUrl>`** — either a **local file path** (e.g. `./tutors/my-tutor.yaml`)
  or a public **http(s) URL** (e.g. a raw GitHub link to a tutor or fragment YAML).
- **`--kind`** — what the file is: `tutor` (the default) or `fragment`. The CLI
  does **not** auto-detect; pass `--kind fragment` to validate a fragment library
  on its own. A tutor file has top-level `prompt`; a fragment library has top-level
  `fragments`.
- **Relative `fragment_files`** in a tutor resolve against the tutor's own
  location: a sibling file for a local tutor, a sibling URL for a remote one. So
  validate the tutor where its fragment files actually sit. (A fragment library is
  self-contained — `--kind fragment` fetches nothing else.)
- **`--json`** — print the raw result object instead of the formatted report.
  Use this when you need to inspect specifics programmatically (drill into the
  exact failing variable/fragment, feed CI, etc.). Without it you get a
  human-readable pass/fail summary.

## Reading the result

The report separates **errors** (the tutor is invalid — must fix) from
**warnings** (it still builds, but something is worth a look). On failure, act on
the specific error code rather than just relaying it:

| Code | Meaning |
| --- | --- |
| `YAML_PARSE_ERROR` | The file isn't valid YAML (indentation, syntax). |
| `TUTOR_SCHEMA_ERROR` | The tutor's fields are wrong/missing (often a typo'd key — the schema is strict). |
| `FRAGMENT_FILE_SCHEMA_ERROR` | A referenced fragment file has invalid structure. |
| `FRAGMENT_NOT_FOUND` | The tutor references a fragment id that doesn't exist in the file. |
| `MISSING_REQUIRED_VARIABLE` | A fragment needs a variable the tutor didn't supply. |
| `VARIABLE_TYPE_MISMATCH` | A supplied variable is the wrong type for what the fragment declares. |
| `FRAGMENT_TEMPLATE_ERROR` | A fragment's `content` template failed to render — a Handlebars syntax error, or a reference to a variable the fragment never declares in its `input_schema`. Reported by `--kind fragment` and by the thorough tutor check (whole-library). The `fragment`/`file` context points at the offender. |
| `FETCH_FAILED` | A file/URL couldn't be read (missing local file, bad URL, network). |

For the full set, the codes come from `lib/tutors/errors.ts` in the repo. When a
schema error is vague, re-run with `--json` to see the underlying issue detail.

## Scope — what this CLI does NOT do

It only **validates**. It does not authenticate, create or delete tutor codes,
deploy, or talk to the running app. Don't offer those via this CLI; validation
needs no login and touches no protected resource.

## Examples

Inside the repo, a known-good fixture:

```bash
npm run cli -- validate tutors/simple-tutor.yaml
# ✔ Valid tutor — tutors/simple-tutor.yaml   (exit 0)
```

Inside the repo, a broken tutor — exit 1, with actionable codes:

```bash
npm run cli -- validate tutors/broken-tutor.yaml
# ✘ Invalid tutor … MISSING_REQUIRED_VARIABLE / FRAGMENT_NOT_FOUND   (exit 1)
```

Inside the repo, validating a fragment library on its own:

```bash
npm run cli -- validate tutors/simple-fragments.yaml --kind fragment
# ✔ Valid fragment file — tutors/simple-fragments.yaml   (exit 0)
```

Outside the repo, validating a published tutor by URL:

```bash
npx @novedu/cli validate https://raw.githubusercontent.com/Teaching-HTL-Leonding/novedu-chat-mvp/refs/heads/main/tutors/simple-tutor.yaml
```

Machine-readable output for scripting/CI:

```bash
npx @novedu/cli validate ./my-tutor.yaml --json
```

// Consistency checking: given a validated tutor and the fetched fragment files,
// confirm every referenced fragment exists and every required input is supplied
// (variables-only — `bind` is intentionally ignored), then produce an ordered
// render plan. Pure: no network, no YAML, no Handlebars.

import { error, type ValidationError, type ValidationWarning, warning } from "./errors";
import type { Fragment, FragmentFile, InputSchema, Tutor, VariableValue } from "./schemas";

export interface ResolvedFragment {
  fileAlias: string;
  fragmentId: string;
  priority: number;
  content: string;
  variables: Record<string, VariableValue>;
}

export interface ConsistencyResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  /** Fragments to render, sorted by `priority` ascending. Meaningful only when `errors` is empty. */
  plan: ResolvedFragment[];
}

type DeclaredProperty = InputSchema["properties"][string];

/** Compare a supplied value against its declared property type. Returns null when it matches. */
function typeMismatch(
  prop: DeclaredProperty,
  value: VariableValue,
): { expected: string; actual: string } | null {
  const actual = Array.isArray(value) ? "array" : typeof value;
  switch (prop.type) {
    case "string":
      return typeof value === "string" ? null : { expected: "string", actual };
    case "boolean":
      return typeof value === "boolean" ? null : { expected: "boolean", actual };
    case "array":
      return Array.isArray(value) && value.every((v) => typeof v === "string")
        ? null
        : { expected: "array<string>", actual };
  }
}

export function checkConsistency(
  tutor: Tutor,
  fragmentFilesByAlias: Map<string, FragmentFile>,
): ConsistencyResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Duplicate fragment-file aliases (read from the raw declaration list).
  const aliasCounts = new Map<string, number>();
  for (const ref of tutor.prompt.fragment_files) {
    aliasCounts.set(ref.id, (aliasCounts.get(ref.id) ?? 0) + 1);
  }
  for (const [alias, count] of aliasCounts) {
    if (count > 1) {
      errors.push(
        error(
          "DUPLICATE_FRAGMENT_FILE_ALIAS",
          `Fragment-file alias "${alias}" is declared ${count} times`,
          {
            fileAlias: alias,
          },
        ),
      );
    }
  }

  // 2. Index fragments per file; flag duplicate ids within a single file.
  const fragmentIndex = new Map<string, Map<string, Fragment>>();
  for (const [alias, file] of fragmentFilesByAlias) {
    const byId = new Map<string, Fragment>();
    for (const frag of file.fragments) {
      if (byId.has(frag.id)) {
        errors.push(
          error(
            "DUPLICATE_FRAGMENT_ID_IN_FILE",
            `Fragment "${frag.id}" is declared more than once in file "${alias}"`,
            { fileAlias: alias, fragmentId: frag.id },
          ),
        );
        continue;
      }
      byId.set(frag.id, frag);
    }
    fragmentIndex.set(alias, byId);
  }

  // 3-5. Resolve each tutor fragment reference and validate its inputs.
  const resolved: ResolvedFragment[] = [];
  const seenRefs = new Set<string>();
  for (const ref of tutor.prompt.fragments) {
    const refKey = `${ref.file}::${ref.id}`;
    if (seenRefs.has(refKey)) {
      warnings.push(
        warning(
          "DUPLICATE_FRAGMENT_REFERENCE",
          `Fragment "${ref.id}" from "${ref.file}" is referenced more than once`,
          { fileAlias: ref.file, fragmentId: ref.id },
        ),
      );
    }
    seenRefs.add(refKey);

    const byId = fragmentIndex.get(ref.file);
    if (!byId) {
      errors.push(
        error(
          "UNKNOWN_FRAGMENT_FILE_ALIAS",
          `Fragment reference uses unknown file alias "${ref.file}"`,
          {
            fileAlias: ref.file,
            fragmentId: ref.id,
          },
        ),
      );
      continue;
    }
    const fragment = byId.get(ref.id);
    if (!fragment) {
      errors.push(
        error("FRAGMENT_NOT_FOUND", `Fragment "${ref.id}" not found in file "${ref.file}"`, {
          fileAlias: ref.file,
          fragmentId: ref.id,
        }),
      );
      continue;
    }

    // `bind` is dropped here on purpose; only literal `variables` count.
    const variables = ref.variables ?? {};
    const schema = fragment.input_schema;

    // The variables actually handed to the renderer: the tutor's values plus any
    // declared `default`s for optional inputs the tutor omitted (filled in below).
    const merged: Record<string, VariableValue> = { ...variables };

    if (schema) {
      for (const name of schema.required) {
        if (!(name in variables)) {
          errors.push(
            error(
              "MISSING_REQUIRED_VARIABLE",
              `Fragment "${ref.id}" requires variable "${name}", which is not supplied`,
              { fileAlias: ref.file, fragmentId: ref.id, variable: name },
            ),
          );
        }
      }
      for (const [name, value] of Object.entries(variables)) {
        const prop = schema.properties[name];
        if (!prop) {
          warnings.push(
            warning(
              "UNDECLARED_VARIABLE",
              `Variable "${name}" supplied to "${ref.id}" is not declared in its input schema`,
              { fileAlias: ref.file, fragmentId: ref.id, variable: name },
            ),
          );
          continue;
        }
        const mismatch = typeMismatch(prop, value);
        if (mismatch) {
          errors.push(
            error(
              "VARIABLE_TYPE_MISMATCH",
              `Variable "${name}" of "${ref.id}" should be ${mismatch.expected} but got ${mismatch.actual}`,
              {
                fileAlias: ref.file,
                fragmentId: ref.id,
                variable: name,
                expectedType: mismatch.expected,
                actualType: mismatch.actual,
              },
            ),
          );
        }
      }

      // Fill in defaults for optional inputs the tutor didn't supply. A `default` on a
      // `required` input can never apply (the required check above already fired if it
      // was absent), so flag that as a likely authoring mistake instead of injecting it.
      const requiredSet = new Set(schema.required);
      for (const [name, prop] of Object.entries(schema.properties)) {
        if (prop.default === undefined) continue;
        if (requiredSet.has(name)) {
          warnings.push(
            warning(
              "REQUIRED_PROPERTY_HAS_DEFAULT",
              `Variable "${name}" of "${ref.id}" is required, so its default is never used`,
              { fileAlias: ref.file, fragmentId: ref.id, variable: name },
            ),
          );
          continue;
        }
        if (!(name in merged)) merged[name] = prop.default; // a supplied value wins
      }
    } else {
      for (const name of Object.keys(variables)) {
        warnings.push(
          warning(
            "UNDECLARED_VARIABLE",
            `Variable "${name}" supplied to "${ref.id}", which declares no input schema`,
            { fileAlias: ref.file, fragmentId: ref.id, variable: name },
          ),
        );
      }
    }

    resolved.push({
      fileAlias: ref.file,
      fragmentId: ref.id,
      priority: fragment.priority,
      content: fragment.content,
      variables: merged,
    });
  }

  // 6. Deterministic ordering: sort by priority; a collision makes order ambiguous.
  const plan = [...resolved].sort((a, b) => a.priority - b.priority);
  const priorityOwners = new Map<number, string[]>();
  for (const r of resolved) {
    const owners = priorityOwners.get(r.priority) ?? [];
    owners.push(r.fragmentId);
    priorityOwners.set(r.priority, owners);
  }
  for (const [priority, owners] of priorityOwners) {
    if (owners.length > 1) {
      errors.push(
        error(
          "DUPLICATE_PRIORITY",
          `Priority ${priority} is shared by fragments: ${owners.join(", ")} — ordering is ambiguous`,
        ),
      );
    }
  }

  return { errors, warnings, plan };
}

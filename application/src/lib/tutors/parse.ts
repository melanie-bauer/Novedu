// YAML parsing + Zod validation, expressed as result objects (no throws).

import { parse as parseYamlText } from "yaml";
import { z } from "zod";
import { error, type ValidationError } from "./errors";

/** Parse a YAML document, mapping syntax errors to a structured `YAML_PARSE_ERROR`. */
export function parseYaml(
  text: string,
  url?: string,
): { ok: true; value: unknown } | { ok: false; error: ValidationError } {
  try {
    return { ok: true, value: parseYamlText(text) };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: error("YAML_PARSE_ERROR", `Invalid YAML: ${message}`, { url }) };
  }
}

/** Validate an already-parsed value against a Zod schema, attaching treeified issues on failure. */
export function validate<T>(
  value: unknown,
  schema: z.ZodType<T>,
  code: "TUTOR_SCHEMA_ERROR" | "FRAGMENT_FILE_SCHEMA_ERROR",
  url?: string,
): { ok: true; data: T } | { ok: false; error: ValidationError } {
  const result = schema.safeParse(value);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    error: error(code, "Document does not match the expected structure", {
      url,
      zodIssues: z.treeifyError(result.error),
    }),
  };
}

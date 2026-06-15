// Error and result model for the tutor validator/builder core.
//
// This module is framework-agnostic (no React/Next). Every consumer — the API
// route, future server code, tests — speaks in terms of these structured
// errors and the `BuildResult` discriminated union, never thrown exceptions.

/** Hard failures that prevent a system prompt from being built. */
export type ErrorCode =
  | "INVALID_URL"
  | "FETCH_FAILED"
  | "YAML_PARSE_ERROR"
  | "TUTOR_SCHEMA_ERROR"
  | "FRAGMENT_FILE_SCHEMA_ERROR"
  | "DUPLICATE_FRAGMENT_FILE_ALIAS"
  | "DUPLICATE_FRAGMENT_ID_IN_FILE"
  | "UNKNOWN_FRAGMENT_FILE_ALIAS"
  | "FRAGMENT_NOT_FOUND"
  | "MISSING_REQUIRED_VARIABLE"
  | "VARIABLE_TYPE_MISMATCH"
  | "DUPLICATE_PRIORITY"
  | "ASSEMBLY_ERROR";

/** Non-fatal smells: the prompt still builds, but something is worth flagging. */
export type WarningCode =
  | "UNDECLARED_VARIABLE"
  | "DUPLICATE_FRAGMENT_REFERENCE"
  | "REQUIRED_PROPERTY_HAS_DEFAULT";

export interface ValidationError {
  code: ErrorCode;
  /** Human-readable explanation, safe to show in the UI. */
  message: string;
  /** Which remote file the error concerns (fetch/YAML/schema errors). */
  url?: string;
  /** The tutor-side fragment-file alias (e.g. `general_fragments`). */
  fileAlias?: string;
  /** The fragment id within that file (e.g. `socratic_tutor`). */
  fragmentId?: string;
  /** The offending variable name (missing/typed wrong). */
  variable?: string;
  expectedType?: string;
  actualType?: string;
  /** HTTP status for FETCH_FAILED. */
  status?: number;
  /** Zod's treeified issues for *_SCHEMA_ERROR (machine + human readable). */
  zodIssues?: unknown;
}

export interface ValidationWarning {
  code: WarningCode;
  message: string;
  fileAlias?: string;
  fragmentId?: string;
  variable?: string;
}

/**
 * The single result type returned by the high-level entry point. A discriminated
 * union on `ok` so callers get either a prompt or a complete error list — never
 * both, never a thrown exception.
 */
export type BuildResult =
  | {
      ok: true;
      prompt: string;
      model: string;
      /** Whether students may attach images in the chat (tutor `llm.imageInput`, default true). */
      imageInput: boolean;
      /** Optional student-facing greeting shown instead of the chat's default welcome text. */
      title?: string;
      /** Student-facing description, rendered below the welcome greeting. */
      description: string;
      warnings: ValidationWarning[];
    }
  | { ok: false; errors: ValidationError[]; warnings: ValidationWarning[] };

/** Small helper to build an error object tersely at call sites. */
export function error(
  code: ErrorCode,
  message: string,
  extra: Partial<ValidationError> = {},
): ValidationError {
  return { code, message, ...extra };
}

export function warning(
  code: WarningCode,
  message: string,
  extra: Partial<ValidationWarning> = {},
): ValidationWarning {
  return { code, message, ...extra };
}

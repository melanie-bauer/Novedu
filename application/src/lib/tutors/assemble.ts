// Handlebars assembly of the final system prompt. Pure: takes the resolved,
// already-validated render plan and produces the prompt string.

import Handlebars from "handlebars";
import type { ResolvedFragment } from "./consistency";
import type { Tutor } from "./schemas";

// `noEscape`: the output is a markdown/LLM prompt, not HTML — ASCII diagrams
//   (`<-`, `->`), ampersands, and quotes must pass through verbatim.
// `strict`: referencing an undeclared variable throws instead of silently
//   rendering empty. Consistency checking already guarantees required inputs, so
//   a throw here is a backstop that the caller surfaces as `ASSEMBLY_ERROR`.
const COMPILE_OPTIONS = { strict: true, noEscape: true } as const;

/**
 * Render each fragment in priority order and append the tutor-specific
 * instructions last (they carry no priority, so "after everything" is the only
 * deterministic position). May throw if a template references a missing variable.
 */
export function assembleSystemPrompt(plan: ResolvedFragment[], tutor: Tutor): string {
  const parts = plan.map((fragment) => {
    const template = Handlebars.compile(fragment.content, COMPILE_OPTIONS);
    return template(fragment.variables).trimEnd();
  });
  parts.push(tutor.prompt.tutor_instructions.trimEnd());
  return `${parts.join("\n\n")}\n`;
}

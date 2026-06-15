import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { assembleSystemPrompt } from "./assemble";
import { checkConsistency } from "./consistency";
import type { BuildResult, ValidationWarning } from "./errors";
import { error } from "./errors";
import { parseYaml, validate } from "./parse";
import { type Tutor, TutorSchema } from "./schemas";

const TUTORS_DIR = path.join(process.cwd(), "tutors");

export type LocalTutorSummary = {
  id: string;
  title: string;
  description: string;
  model: string;
  imageInput: boolean;
};

async function readTutorYaml(filePath: string): Promise<BuildResult> {
  const warnings: ValidationWarning[] = [];

  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      errors: [error("FETCH_FAILED", `Failed to read ${filePath}: ${message}`)],
      warnings,
    };
  }

  const tutorYaml = parseYaml(raw, filePath);
  if (!tutorYaml.ok) {
    return { ok: false, errors: [tutorYaml.error], warnings };
  }

  const tutorValid = validate<Tutor>(
    tutorYaml.value,
    TutorSchema,
    "TUTOR_SCHEMA_ERROR",
    filePath,
  );
  if (!tutorValid.ok) {
    return { ok: false, errors: [tutorValid.error], warnings };
  }

  const tutor = tutorValid.data;
  const consistency = checkConsistency(tutor, new Map());
  warnings.push(...consistency.warnings);
  if (consistency.errors.length > 0) {
    return { ok: false, errors: consistency.errors, warnings };
  }

  try {
    const prompt = assembleSystemPrompt(consistency.plan, tutor);
    return {
      ok: true,
      prompt,
      model: tutor.llm.model,
      imageInput: tutor.llm.imageInput ?? true,
      title: tutor.title,
      description: tutor.description,
      warnings,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      errors: [
        error("ASSEMBLY_ERROR", `Failed to render system prompt: ${message}`),
      ],
      warnings,
    };
  }
}

export async function listLocalTutorSummaries(): Promise<LocalTutorSummary[]> {
  let entries: string[];
  try {
    entries = await readdir(TUTORS_DIR);
  } catch {
    return [];
  }

  const summaries: LocalTutorSummary[] = [];
  for (const entry of entries.filter((name) => name.endsWith(".yaml"))) {
    const filePath = path.join(TUTORS_DIR, entry);
    const parsed = await readTutorYaml(filePath);
    if (!parsed.ok) {
      console.warn(
        `[tutors] Skipping ${entry}: ${parsed.errors[0]?.message ?? "invalid"}`,
      );
      continue;
    }

    summaries.push({
      id: entry.replace(/\.yaml$/, ""),
      title: parsed.title ?? entry,
      description: parsed.description ?? "",
      model: parsed.model,
      imageInput: parsed.imageInput,
    });
  }

  return summaries.sort((a, b) => a.title.localeCompare(b.title));
}

export async function loadLocalTutorById(id: string): Promise<BuildResult> {
  const filePath = path.join(TUTORS_DIR, `${id}.yaml`);
  const parsed = await readTutorYaml(filePath);
  if (!parsed.ok) {
    return parsed;
  }

  const raw = await readFile(filePath, "utf8");
  const tutorYaml = parseYaml(raw, filePath);
  if (!tutorYaml.ok) {
    return { ok: false, errors: [tutorYaml.error], warnings: [] };
  }

  const tutorValid = validate<Tutor>(
    tutorYaml.value,
    TutorSchema,
    "TUTOR_SCHEMA_ERROR",
    filePath,
  );
  if (!tutorValid.ok) {
    return { ok: false, errors: [tutorValid.error], warnings: [] };
  }

  if (tutorValid.data.id !== id) {
    return {
      ok: false,
      errors: [
        error(
          "TUTOR_SCHEMA_ERROR",
          `Tutor id mismatch in ${filePath}: expected ${id}, got ${tutorValid.data.id}`,
        ),
      ],
      warnings: [],
    };
  }

  return parsed;
}

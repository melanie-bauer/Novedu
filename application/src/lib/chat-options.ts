import type { ScchModel } from "@/lib/mastra/scch";
import type { TutorSummary } from "./tutors/catalog";

export type ChatModelOption = ScchModel;

export type TutorOption = {
  id: string;
  title: string;
  description: string;
  model: string;
  imageInput: boolean;
};

const FALLBACK_MODEL = "demo-scch-model";

export function buildModelOptions(models: ScchModel[]): ChatModelOption[] {
  if (models.length > 0) {
    return models;
  }

  return [
    {
      id: "demo-scch-model",
      label: "Demo SCCH Modell (nicht verbunden)",
      model: FALLBACK_MODEL,
    },
  ];
}

export function buildTutorOptions(tutors: TutorSummary[]): TutorOption[] {
  return tutors.map((tutor) => ({
    id: tutor.id,
    title: tutor.title,
    description: tutor.description,
    model: tutor.model,
    imageInput: tutor.imageInput,
  }));
}

export function findTutorOption(
  tutors: TutorOption[],
  id: string | null,
): TutorOption | null {
  if (!id) {
    return null;
  }

  return tutors.find((tutor) => tutor.id === id) ?? null;
}

/** Models confirmed to accept image_url parts on the SCCH endpoint. */
const MULTIMODAL_MODELS = new Set([
  "RedHatAI/Llama-4-Scout-17B-16E-Instruct-quantized.w4a16",
  "RedHatAI/gemma-4-31B-it-FP8-Dynamic",
  "Qwen/Qwen3.6-27B-FP8",
]);

export function modelSupportsVision(model: string): boolean {
  return MULTIMODAL_MODELS.has(model);
}

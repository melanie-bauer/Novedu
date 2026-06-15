import { describe, expect, it } from "vitest";
import { buildModelOptions, buildTutorOptions } from "@/lib/chat-options";
import type { TutorSummary } from "@/lib/tutors/catalog";

describe("chat options", () => {
  it("keeps a fallback model visible when SCCH is unavailable", () => {
    const models = buildModelOptions([]);

    expect(models[0]).toMatchObject({
      label: "Demo SCCH Modell (nicht verbunden)",
      model: "demo-scch-model",
    });
  });

  it("maps local tutor summaries into picker options", () => {
    const tutors = buildTutorOptions([
      {
        id: "math-tutor",
        title: "Mathematik Tutor",
        description: "Hilft bei Mathe.",
        model: "Qwen/Qwen3",
        imageInput: false,
      },
    ] satisfies TutorSummary[]);

    expect(tutors[0]).toMatchObject({
      id: "math-tutor",
      title: "Mathematik Tutor",
      model: "Qwen/Qwen3",
      imageInput: false,
    });
  });
});

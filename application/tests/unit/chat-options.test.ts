import { describe, expect, it } from "vitest";
import {
  buildDemoTutors,
  buildModelOptions,
  findDemoTutor,
} from "@/lib/chat-options";

describe("chat options", () => {
  it("keeps a fallback model and demo tutors visible when SCCH is unavailable", () => {
    const models = buildModelOptions([]);
    const tutors = buildDemoTutors([]);

    expect(models[0]).toMatchObject({
      label: "Demo SCCH Modell (nicht verbunden)",
      model: "demo-scch-model",
    });
    expect(tutors.map((tutor) => tutor.title)).toContain(
      "Demo Mathematik Tutor",
    );
    expect(tutors[0].model).toBe("demo-scch-model");
  });

  it("uses fetched SCCH models for demo tutors", () => {
    const models = buildModelOptions([
      { id: "qwen", label: "Qwen", model: "Qwen/Qwen3" },
    ]);
    const tutors = buildDemoTutors(models);

    expect(findDemoTutor(tutors, "demo-math")?.model).toBe("Qwen/Qwen3");
  });
});

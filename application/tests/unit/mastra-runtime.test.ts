import { describe, expect, it } from "vitest";
import { mastra } from "@/lib/mastra";

describe("Mastra runtime wiring", () => {
  it("boots with the tutor agent registered without optional logger packages", () => {
    expect(mastra.getAgent("tutor")).toBeDefined();
  });
});

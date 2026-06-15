import { describe, expect, it } from "vitest";
import { agentConfigSchema } from "@/features/agents/config-schema";
import { FixtureAgentConfigStore } from "@/lib/config-store/agent-config-store";
import { fixturePath } from "@/test-utils/fixtures";

describe("agent config store", () => {
  it("validates agent config fixtures", () => {
    const agent = agentConfigSchema.parse({
      id: "german-demo",
      displayName: "German Tutor",
      subject: "German",
      systemPrompt: "Help students write clearly.",
      model: { provider: "demo", modelId: "demo-local" },
      assignments: { classes: [], users: [] },
      features: { fileUpload: false, latex: true, syntaxHighlighting: true },
    });

    expect(agent.displayName).toBe("German Tutor");
  });

  it("loads configs through a fixture-backed store", async () => {
    const store = new FixtureAgentConfigStore(fixturePath("agents.valid.json"));

    await expect(store.listAgents()).resolves.toEqual([
      expect.objectContaining({ id: "math-demo", subject: "Mathematics" }),
    ]);
  });
});

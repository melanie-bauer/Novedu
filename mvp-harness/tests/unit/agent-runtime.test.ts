import { describe, expect, it } from "vitest";
import { agentConfigSchema } from "@/features/agents/config-schema";
import {
  DemoAgentRuntime,
  runtimeIntegrationPackages,
} from "@/lib/agent-runtime/provider";

describe("agent runtime boundary", () => {
  it("documents the runtime packages without provider lock-in", () => {
    expect(runtimeIntegrationPackages.mastraCore).toBe("@mastra/core");
    expect(runtimeIntegrationPackages.agUiCore).toBe("@ag-ui/core");
  });

  it("streams through the provider-independent runtime interface", async () => {
    const agent = agentConfigSchema.parse({
      id: "runtime-demo",
      displayName: "Runtime Demo",
      subject: "Programming",
      systemPrompt: "Help with code.",
      model: { provider: "demo", modelId: "demo-local" },
      assignments: { classes: [], users: [] },
      features: { fileUpload: false, latex: true, syntaxHighlighting: true },
    });
    const runtime = new DemoAgentRuntime();
    const chunks = [];

    for await (const chunk of runtime.stream({
      agent,
      input: "hello",
      history: [],
    })) {
      chunks.push(chunk.delta);
    }

    expect(chunks.join("")).toContain("Runtime Demo");
  });
});

import type { AgentConfig } from "@/features/agents/config-schema";

export type AgentRuntimeRequest = {
  agent: AgentConfig;
  input: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
};

export type AgentRuntimeChunk = {
  type: "text-delta";
  delta: string;
};

export type AgentRuntime = {
  stream(request: AgentRuntimeRequest): AsyncIterable<AgentRuntimeChunk>;
};

export const runtimeIntegrationPackages = {
  agUiCore: "@ag-ui/core",
  agUiClient: "@ag-ui/client",
  copilotKitReactCore: "@copilotkit/react-core",
  mastraCore: "@mastra/core",
} as const;

export class DemoAgentRuntime implements AgentRuntime {
  async *stream(
    request: AgentRuntimeRequest,
  ): AsyncIterable<AgentRuntimeChunk> {
    yield {
      type: "text-delta",
      delta: `Demo runtime used ${request.agent.displayName}: ${request.input}`,
    };
  }
}

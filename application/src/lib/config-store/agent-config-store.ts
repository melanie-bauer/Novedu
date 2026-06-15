import { readFile } from "node:fs/promises";
import {
  type AgentConfig,
  agentConfigListSchema,
} from "@/features/agents/config-schema";

export type AgentConfigStore = {
  listAgents(): Promise<AgentConfig[]>;
};

export class FixtureAgentConfigStore implements AgentConfigStore {
  constructor(private readonly fixturePath: string) {}

  async listAgents(): Promise<AgentConfig[]> {
    const raw = await readFile(this.fixturePath, "utf8");

    return agentConfigListSchema.parse(JSON.parse(raw));
  }
}

export class GitHubAgentConfigStore implements AgentConfigStore {
  constructor(
    private readonly options: {
      owner: string;
      repo: string;
      path: string;
      ref?: string;
    },
  ) {}

  async listAgents(): Promise<AgentConfig[]> {
    throw new Error(
      `GitHub config loading is intentionally deferred for ${this.options.owner}/${this.options.repo}/${this.options.path}. Use FixtureAgentConfigStore in tests.`,
    );
  }
}

import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { tutorAgent } from "./tutor-agent";

const logger = new PinoLogger({ name: "Mastra", level: "info" });

// Simple in-memory storage for MVP testing. Not suitable for production.
class InMemoryStorage {
  private store = new Map<string, unknown>();

  async get(key: string): Promise<unknown> {
    return this.store.get(key);
  }

  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

// MVP: Use in-memory storage for testing. In production, use MSSQLStore
// (see sample/app/mastra/index.ts for Azure SQL configuration).
const storage = new InMemoryStorage();

export const mastra = new Mastra({
  // The `tutor` agent is configured per request from a tutor-definition YAML
  // (system prompt + model) and persists its conversation via the shared store.
  // NOTE: the registry KEY (not the agent's `id`) is the AG-UI agentId the
  // frontend references — so this must be `tutor` to match `agentId="tutor"`.
  agents: { tutor: tutorAgent },
  storage,
  logger,
});

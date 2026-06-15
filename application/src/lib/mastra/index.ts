import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";
import { tutorAgent } from "./tutor-agent";

const logger = createLogger({ name: "Mastra", level: "info" });

// MVP harness: No database storage. The app still boots (non-chat flows like
// tutor validation work without a DB), but the tutor's Memory REQUIRES a
// store — chatting will fail until storage is configured. We don't degrade
// gracefully; that surfaces as a server error.
logger.warn(
  "No storage configured for MVP — tutor chat will fail without storage",
);

export const mastra = new Mastra({
  // The `tutor` agent is configured per request from a tutor-definition YAML
  // (system prompt + model) and persists its conversation via the shared store.
  // NOTE: the registry KEY (not the agent's `id`) is the AG-UI agentId the
  // frontend references — so this must be `tutor` to match `agentId="tutor"`.
  agents: { tutor: tutorAgent },
  // Persistent storage is not configured for MVP. When MSSQL_CONNECTION_STRING
  // is set, add the MSSQLStore here (see sample/app/mastra/index.ts).
  storage: undefined,
  logger,
});

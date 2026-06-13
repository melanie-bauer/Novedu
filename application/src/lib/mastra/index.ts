import { Mastra } from "@mastra/core/mastra";
import { FilesystemStore, MastraCompositeStore } from "@mastra/core/storage";
import { PinoLogger } from "@mastra/loggers";
import { tutorAgent } from "./tutor-agent";

const logger = new PinoLogger({ name: "Mastra", level: "info" });

// MVP: Use FilesystemStore for local development. Stores data as JSON files
// in .mastra-storage/ directory. Not suitable for production.
const filesystemStore = new FilesystemStore({
  dir: ".mastra-storage",
});

// Composite store routes all domains to the filesystem backend.
const storage = new MastraCompositeStore({
  id: "mvp-storage",
  default: filesystemStore,
});

export const mastra = new Mastra({
  // The `tutor` agent is configured per request from a tutor-definition YAML
  // (system prompt + model) and persists its conversation via the shared store.
  // NOTE: the registry KEY (not the agent's `id`) is the AG-UI agentId the
  // frontend references — so this must be `tutor` to match `agentId="tutor"`.
  agents: { tutor: tutorAgent },
  storage,
  logger,
});

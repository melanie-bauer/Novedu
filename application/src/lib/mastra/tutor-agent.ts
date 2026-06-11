import { Agent } from "@mastra/core/agent";
import type { RequestContext } from "@mastra/core/request-context";
import { Memory } from "@mastra/memory";
import { defaultFetcher, loadAndBuildTutorPrompt } from "@/lib/tutors";
import { scchProvider } from "./scch";

// A single agent that is configured entirely by a tutor-definition YAML. The
// tutor's URL arrives per request via `requestContext` (set by the CopilotKit
// route after it verified the signed share link); this agent resolves its
// system prompt and model from that URL at request time using the reusable
// `lib/tutors` core.

interface LoadedTutor {
  prompt: string;
  model: string;
}

// Memoize by URL so the YAML is fetched + assembled once, not on every chat
// message. A failed load is evicted so a corrected URL can succeed on retry.
const cache = new Map<string, Promise<LoadedTutor>>();

function loadTutor(url: string): Promise<LoadedTutor> {
  const cached = cache.get(url);
  if (cached) return cached;

  const promise = loadAndBuildTutorPrompt(url, defaultFetcher).then(
    (result) => {
      if (!result.ok) {
        const first = result.errors[0];
        throw new Error(
          first
            ? `Tutor validation failed (${first.code}): ${first.message}`
            : "Tutor validation failed",
        );
      }
      return { prompt: result.prompt, model: result.model };
    },
  );

  promise.catch(() => cache.delete(url));
  cache.set(url, promise);
  return promise;
}

function tutorUrl(requestContext: RequestContext): string {
  const url = requestContext.get("tutor-url");
  if (typeof url !== "string" || url === "") {
    throw new Error("No tutor URL provided for this chat. Load a tutor first.");
  }
  return url;
}

export const tutorAgent = new Agent({
  id: "tutor",
  name: "Tutor",
  // Both resolvers run per request and share the same memoized load. The prompt
  // is used verbatim — no app-level formatting guidance is appended.
  instructions: async ({ requestContext }) =>
    (await loadTutor(tutorUrl(requestContext))).prompt,
  model: async ({ requestContext }) =>
    scchProvider.chat((await loadTutor(tutorUrl(requestContext))).model),
  // Persist the conversation so the tutor remembers earlier turns. No explicit
  // storage here: Memory inherits the Mastra instance's store (see `index.ts`),
  // so threads/messages land in the storage. The frontend supplies the thread id
  // and the CopilotKit route the resource id (the signed-in user's stable id,
  // so storage is per user). `semanticRecall` is disabled — it would require
  // a vector store + embedder we don't run; plain recent-message history is all
  // the tutor needs.
  //
  // NOTE: `Memory` REQUIRES a storage provider — if no store is configured,
  // the instance has no store and a tutor chat fails ("Memory requires a
  // storage provider"). That's acceptable: storage is effectively required to chat.
  memory: new Memory({
    options: {
      lastMessages: 20,
      semanticRecall: false,
    },
  }),
});

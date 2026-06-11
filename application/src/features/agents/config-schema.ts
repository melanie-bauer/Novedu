import { z } from "zod";

export const agentConfigSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  subject: z.string().min(1),
  description: z.string().default(""),
  systemPrompt: z.string().min(1),
  model: z.object({
    provider: z.enum([
      "azure-openai",
      "openai",
      "anthropic",
      "google",
      "mistral",
      "demo",
    ]),
    modelId: z.string().min(1),
  }),
  assignments: z.object({
    classes: z.array(z.string()).default([]),
    users: z.array(z.string()).default([]),
  }),
  features: z.object({
    fileUpload: z.boolean().default(false),
    latex: z.boolean().default(true),
    syntaxHighlighting: z.boolean().default(true),
  }),
});

export const agentConfigListSchema = z.array(agentConfigSchema);

export type AgentConfig = z.infer<typeof agentConfigSchema>;

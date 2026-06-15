import { z } from "zod";

const baseEventSchema = z.object({
  timestamp: z.number().int().nonnegative().optional(),
});

const runStartedSchema = baseEventSchema.extend({
  type: z.literal("RUN_STARTED"),
  threadId: z.string(),
  runId: z.string(),
  input: z.unknown().optional(),
});

const textMessageStartSchema = baseEventSchema.extend({
  type: z.literal("TEXT_MESSAGE_START"),
  messageId: z.string(),
  role: z.literal("assistant"),
});

const textMessageContentSchema = baseEventSchema.extend({
  type: z.literal("TEXT_MESSAGE_CONTENT"),
  messageId: z.string(),
  delta: z.string(),
});

const textMessageEndSchema = baseEventSchema.extend({
  type: z.literal("TEXT_MESSAGE_END"),
  messageId: z.string(),
});

const runFinishedSchema = baseEventSchema.extend({
  type: z.literal("RUN_FINISHED"),
  threadId: z.string(),
  runId: z.string(),
  result: z.unknown().optional(),
});

const runErrorSchema = baseEventSchema.extend({
  type: z.literal("RUN_ERROR"),
  threadId: z.string().optional(),
  runId: z.string().optional(),
  message: z.string(),
  code: z.string().optional(),
});

const customSchema = baseEventSchema.extend({
  type: z.literal("CUSTOM"),
  name: z.string(),
  value: z.unknown(),
});

export const agUiEventSchema = z.discriminatedUnion("type", [
  runStartedSchema,
  textMessageStartSchema,
  textMessageContentSchema,
  textMessageEndSchema,
  runFinishedSchema,
  runErrorSchema,
  customSchema,
]);

export type AgUiEvent = z.infer<typeof agUiEventSchema>;

export function encodeSseEvent(event: AgUiEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function parseSseFrames(streamText: string): AgUiEvent[] {
  return parseSseEventChunks([streamText]).events;
}

export function parseSseEventChunks(
  chunks: Iterable<string>,
  initialRemainder = "",
): { events: AgUiEvent[]; remainder: string } {
  let buffer = initialRemainder;
  const events: AgUiEvent[] = [];

  for (const chunk of chunks) {
    buffer += chunk;

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 2);

      if (frame) {
        events.push(parseSseFrame(frame));
      }

      boundary = buffer.indexOf("\n\n");
    }
  }

  return { events, remainder: buffer };
}

function parseSseFrame(frame: string): AgUiEvent {
  const dataLine = frame.split("\n").find((line) => line.startsWith("data: "));

  if (!dataLine) {
    throw new Error(`Invalid AG-UI frame: ${frame}`);
  }

  return agUiEventSchema.parse(JSON.parse(dataLine.slice(6)));
}

export function collectAssistantText(events: AgUiEvent[]): string {
  return events
    .filter((event) => event.type === "TEXT_MESSAGE_CONTENT")
    .map((event) => event.delta)
    .join("");
}

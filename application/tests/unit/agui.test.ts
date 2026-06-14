import { describe, expect, it } from "vitest";
import {
  collectAssistantText,
  encodeSseEvent,
  parseSseEventChunks,
  parseSseFrames,
} from "@/lib/agui/events";

describe("AG-UI contract", () => {
  it("parses server-sent AG-UI frames", () => {
    const stream = [
      encodeSseEvent({
        type: "TEXT_MESSAGE_START",
        messageId: "m1",
        role: "assistant",
      }),
      encodeSseEvent({
        type: "TEXT_MESSAGE_CONTENT",
        messageId: "m1",
        delta: "Hello ",
      }),
      encodeSseEvent({
        type: "TEXT_MESSAGE_CONTENT",
        messageId: "m1",
        delta: "Novedu",
      }),
      encodeSseEvent({ type: "TEXT_MESSAGE_END", messageId: "m1" }),
    ].join("");

    const events = parseSseFrames(stream);

    expect(events).toHaveLength(4);
    expect(collectAssistantText(events)).toBe("Hello Novedu");
  });

  it("rejects unknown AG-UI event shapes", () => {
    expect(() => parseSseFrames('data: {"type":"UNKNOWN"}\n\n')).toThrow();
  });

  it("parses AG-UI frames split across arbitrary stream chunks", () => {
    const stream = [
      encodeSseEvent({
        type: "TEXT_MESSAGE_START",
        messageId: "m1",
        role: "assistant",
      }),
      encodeSseEvent({
        type: "TEXT_MESSAGE_CONTENT",
        messageId: "m1",
        delta: "Chunked hello",
      }),
      encodeSseEvent({ type: "TEXT_MESSAGE_END", messageId: "m1" }),
    ].join("");

    const chunks = [
      stream.slice(0, 11),
      stream.slice(11, 48),
      stream.slice(48, 93),
      stream.slice(93),
    ];

    const result = parseSseEventChunks(chunks);

    expect(result.remainder).toBe("");
    expect(result.events).toHaveLength(3);
    expect(collectAssistantText(result.events)).toBe("Chunked hello");
  });

  it("returns incomplete trailing frame text as remainder", () => {
    const result = parseSseEventChunks([
      'data: {"type":"TEXT_MESSAGE_CONTENT","messageId":"m1","delta":"Hel',
    ]);

    expect(result.events).toEqual([]);
    expect(result.remainder).toBe(
      'data: {"type":"TEXT_MESSAGE_CONTENT","messageId":"m1","delta":"Hel',
    );
  });
});

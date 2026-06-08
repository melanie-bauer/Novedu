import { describe, expect, it } from "vitest";
import {
  collectAssistantText,
  encodeSseEvent,
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
});

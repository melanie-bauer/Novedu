import { type AgUiEvent, encodeSseEvent } from "@/lib/agui/events";

export function createDemoAgUiEvents(): AgUiEvent[] {
  return [
    {
      type: "RUN_STARTED",
      threadId: "thread-demo",
      runId: "run-demo",
      timestamp: 1,
    },
    {
      type: "TEXT_MESSAGE_START",
      messageId: "msg-demo",
      role: "assistant",
      timestamp: 2,
    },
    {
      type: "TEXT_MESSAGE_CONTENT",
      messageId: "msg-demo",
      delta:
        "This response arrived through the AG-UI contract. It can render $$a^2+b^2=c^2$$ and code.",
      timestamp: 3,
    },
    {
      type: "TEXT_MESSAGE_END",
      messageId: "msg-demo",
      timestamp: 4,
    },
    {
      type: "RUN_FINISHED",
      threadId: "thread-demo",
      runId: "run-demo",
      result: { messageId: "msg-demo" },
      timestamp: 5,
    },
  ];
}

export function createDemoAgUiFrames(): string[] {
  return createDemoAgUiEvents().map(encodeSseEvent);
}

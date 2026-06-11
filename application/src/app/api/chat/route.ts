import { createDemoAgUiFrames } from "@/features/chat/mock-stream";

export async function POST() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      for (const frame of createDemoAgUiFrames()) {
        controller.enqueue(encoder.encode(frame));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

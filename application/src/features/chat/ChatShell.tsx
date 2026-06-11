"use client";

import { useState } from "react";
import { MessageRenderer } from "@/features/chat/MessageRenderer";
import { parseSseFrames } from "@/lib/agui/events";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const starterMessage = `Welcome to the Novedu chat harness.

Math renders as $$x^2 + y^2 = z^2$$.

\`\`\`ts
const answer = 42;
\`\`\``;

export function ChatShell({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: starterMessage },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  async function sendMessage() {
    setIsStreaming(true);
    setMessages((current) => [
      ...current,
      { id: "user-1", role: "user", content: "Explain the demo contract." },
    ]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const text = await response.text();
    const events = parseSseFrames(text);
    const content = events
      .filter((event) => event.type === "TEXT_MESSAGE_CONTENT")
      .map((event) => event.delta)
      .join("");

    setMessages((current) => [
      ...current,
      { id: "assistant-1", role: "assistant", content },
    ]);
    setIsStreaming(false);
  }

  return (
    <div className="panel chat-layout" data-testid="chat-shell">
      <header className="chat-header">
        <div>
          <h1>Novedu Tutor Chat</h1>
          <p>AG-UI stream boundary with CoPilotKit-ready chat surface.</p>
        </div>
        <div className="upload-row">
          <label htmlFor="document-upload">Document upload</label>
          <input
            aria-label="Upload document"
            data-testid="document-upload"
            id="document-upload"
            type="file"
          />
        </div>
      </header>
      <div className="message-list" aria-live="polite">
        {messages.map((message) => (
          <article className={`message ${message.role}`} key={message.id}>
            <MessageRenderer content={message.content} />
          </article>
        ))}
      </div>
      <footer className="composer">
        <input
          aria-label="Message"
          readOnly
          value="Explain the demo contract."
        />
        <button
          className="button"
          disabled={isStreaming}
          onClick={sendMessage}
          type="button"
        >
          {isStreaming ? "Streaming" : "Send"}
        </button>
      </footer>
    </div>
  );
}

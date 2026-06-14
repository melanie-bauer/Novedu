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
    <div className="chat-workspace" data-testid="chat-shell">
      <aside className="chat-sidebar" aria-label="Chat navigation">
        <div className="sidebar-brand">
          <span className="brand-mark">N</span>
          <div>
            <strong>Novedu</strong>
            <span>Tutor Workspace</span>
          </div>
        </div>

        <button className="button sidebar-action" type="button">
          <span aria-hidden="true">+</span>
          Neuer Chat
        </button>

        <label className="sidebar-search">
          <span className="visually-hidden">Chats durchsuchen</span>
          <input placeholder="Chats durchsuchen..." type="search" />
        </label>

        <section className="sidebar-section" aria-labelledby="current-tutor">
          <h2 id="current-tutor">Aktueller Tutor</h2>
          <button className="sidebar-list-item active" type="button">
            <span className="subject-dot" aria-hidden="true" />
            <span>
              <strong>Mathematics demo tutor</strong>
              <small>GitHub adapter fixture</small>
            </span>
          </button>
        </section>

        <section className="sidebar-section" aria-labelledby="history">
          <h2 id="history">Verlauf</h2>
          <button className="sidebar-list-item" type="button">
            <span aria-hidden="true">#</span>
            <span>
              <strong>AG-UI contract demo</strong>
              <small>Heute aktualisiert</small>
            </span>
          </button>
        </section>

        <section className="sidebar-section sidebar-section-bottom">
          <h2>Dokumente</h2>
          <div className="upload-card">
            <label htmlFor="document-upload">Document upload</label>
            <input
              aria-label="Upload document"
              data-testid="document-upload"
              id="document-upload"
              type="file"
            />
            <p>Temporar im Browser, nicht persistiert.</p>
          </div>
        </section>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <div>
            <span className="eyebrow">Live Tutor</span>
            <h1>Novedu Tutor Chat</h1>
            <p>AG-UI stream boundary with CoPilotKit-ready chat surface.</p>
          </div>
          <div className="chat-status">
            <span className={isStreaming ? "status-dot busy" : "status-dot"} />
            {isStreaming ? "Streaming" : "Bereit"}
          </div>
        </header>

        <div className="message-list" aria-live="polite">
          {messages.map((message) => (
            <article className={`message ${message.role}`} key={message.id}>
              <div className="message-avatar" aria-hidden="true">
                {message.role === "user" ? "U" : "N"}
              </div>
              <div className="message-bubble">
                <MessageRenderer content={message.content} />
              </div>
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
      </main>
    </div>
  );
}

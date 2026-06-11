"use client";

import { CopilotChat, CopilotKitProvider } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import { type ComponentProps, type HTMLAttributes, useMemo, useState } from "react";
import type { ExampleQuestion, ValidationWarning } from "@/lib/tutors";
import { CodeBlock } from "./CodeBlock";
import { MarkdownRenderer } from "./MarkdownRenderer";

// The chat surface. There is no tutor input here anymore: the server component
// (app/page.tsx) verifies the signed share link and the tutor YAML and passes
// the result down — including the ready-made runtime headers carrying the
// signed parameters, which travel along on every runtime request so the
// backend can re-verify them. The client is never trusted.
//
// The prompt preview is intentionally visible to everyone with a valid link:
// the app is in early preview and the preview is a debugging aid.
// Attachments are capped client-side at 5 MB per image: photos are inlined as
// base64 into the chat request AND replayed from Mastra memory on every
// following turn, so big files would bloat both the request body and the
// model's context.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function TutorChat({
  tutorUrl,
  runtimeHeaders,
  prompt,
  warnings,
  imageInput,
  title,
  description,
  exampleQuestions = [],
}: {
  tutorUrl: string;
  runtimeHeaders: Record<string, string>;
  prompt: string;
  warnings: ValidationWarning[];
  /** Tutor `llm.imageInput`: students may attach images (vision-capable model). */
  imageInput: boolean;
  /** Tutor `title`: replaces the default "How can I help you today?" greeting. */
  title?: string;
  /** Tutor `description`: rendered below the greeting on the welcome screen. */
  description: string;
  /** ≤5 questions, sampled server-side; clicking one fills the chat input. */
  exampleQuestions?: ExampleQuestion[];
}) {
  // The welcome screen needs to write into the chat input (clicking an example
  // question fills it in), but CopilotChat keeps the input value in internal
  // state and overrides any `inputValue`/`onInputChange` passed to it directly.
  // The one public hook into that state is the `chatView` slot: CopilotChat
  // hands its view all props including `onInputChange` (the internal setter),
  // so we wrap CopilotChat.View and compose the welcome screen here — the
  // built-in greeting (renders `labels.welcomeMessageText`), the description,
  // and the clickable example questions.
  //
  // Memoized: the chat view contains the live input, so a fresh component
  // identity on every TutorChat render (e.g. when uploadError flips) could
  // remount it and lose the student's draft text.
  const ChatView = useMemo(() => {
    type ChatViewProps = ComponentProps<typeof CopilotChat.View>;
    function TutorChatView({ onInputChange, ...viewProps }: ChatViewProps) {
      const WelcomeWithDescription = (props: HTMLAttributes<HTMLDivElement>) => (
        <div {...props}>
          <CopilotChat.View.WelcomeMessage />
          {description ? <p style={{ marginTop: "0.5rem", color: "#57606a" }}>{description}</p> : null}
          {exampleQuestions.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
              {exampleQuestions.map((q) => (
                // Titles alone are not guaranteed unique; the question text is
                // part of the key. The list is static, so content keys are safe.
                <li key={`${q.title}\n${q.question}`}>
                  <button
                    type="button"
                    style={{
                      padding: "0.5rem 0.75rem",
                      marginBottom: "0.5rem",
                      background: "#f6f8fa",
                      border: "1px solid #d0d7de",
                      borderRadius: "6px",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                    }}
                    title={q.question}
                    onClick={() => onInputChange?.(q.question)}
                  >
                    {q.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      );
      return (
        <CopilotChat.View
          {...viewProps}
          onInputChange={onInputChange}
          welcomeScreen={
            description || exampleQuestions.length > 0
              ? { welcomeMessage: WelcomeWithDescription }
              : undefined
          }
        />
      );
    }
    // The chatView slot's type is `typeof CopilotChat.View`, which carries the
    // namespace statics (WelcomeMessage, ScrollView, …) — copy them onto the
    // wrapper so it satisfies the slot without a type assertion.
    return Object.assign(TutorChatView, CopilotChat.View);
  }, [description, exampleQuestions]);
  // Rejected uploads (too large, wrong type) call onUploadFailed and silently
  // drop the file — without this notice the student would never learn why.
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <>
      <div style={{ padding: "0.75rem", background: "#f6f8fa", borderBottom: "1px solid #d0d7de", fontSize: "0.85rem" }}>
        <span style={{ color: "#57606a" }} title={tutorUrl}>
          {tutorUrl}
        </span>
      </div>

      <details style={{ marginBottom: "1rem" }}>
        <summary style={{ cursor: "pointer", padding: "0.5rem", fontWeight: 500 }}>System prompt &amp; warnings</summary>
        <div style={{ padding: "0.5rem", background: "#f6f8fa", borderTop: "1px solid #d0d7de" }}>
          {warnings.length > 0 ? (
            <div style={{ marginBottom: "1rem" }}>
              {warnings.map((w, i) => (
                <div key={i} style={{ padding: "0.5rem", background: "#fff8c5", border: "1px solid #e3b341", borderRadius: "4px", marginBottom: "0.5rem" }}>
                  <strong>{w.code}:</strong> {w.message}
                </div>
              ))}
            </div>
          ) : null}
          <CodeBlock className="language-markdown">{prompt}</CodeBlock>
        </div>
      </details>

      {uploadError ? (
        <div style={{ padding: "0.75rem", background: "#fff8c5", border: "1px solid #e3b341", borderRadius: "6px", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }} role="alert">
          <span>{uploadError}</span>
          <button
            type="button"
            style={{ padding: "0.25rem 0.5rem", background: "transparent", border: "1px solid #d0d7de", borderRadius: "4px", cursor: "pointer" }}
            onClick={() => setUploadError(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div style={{ minHeight: "400px" }}>
        {/*
          The tutor URL must NOT go in runtimeUrl's query string: CopilotKit
          builds sub-route URLs (e.g. /info) by appending to runtimeUrl, which
          would yield `/api/copilotkit?tutor=...yaml/info` (404). Pass it — and
          the share-link signature material — as headers instead, sent on every
          runtime request and verified server-side.
        */}
        <CopilotKitProvider key={tutorUrl} runtimeUrl="/api/copilotkit" headers={runtimeHeaders}>
          <CopilotChat
            agentId="tutor"
            labels={title ? { welcomeMessageText: title } : undefined}
            chatView={ChatView}
            messageView={{ assistantMessage: { markdownRenderer: MarkdownRenderer } }}
            attachments={
              imageInput
                ? {
                    enabled: true,
                    accept: "image/*",
                    maxSize: MAX_IMAGE_BYTES,
                    onUploadFailed: ({ file, message }) =>
                      setUploadError(`${file.name}: ${message}`),
                  }
                : undefined
            }
          />
        </CopilotKitProvider>
      </div>
    </>
  );
}

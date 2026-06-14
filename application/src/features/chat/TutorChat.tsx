"use client";

import { CopilotChat, CopilotKitProvider } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import {
  type ComponentProps,
  type HTMLAttributes,
  useMemo,
  useState,
} from "react";
import type { ExampleQuestion, ValidationWarning } from "@/lib/tutors";
import { CodeBlock } from "./CodeBlock";
import { MarkdownRenderer } from "./MarkdownRenderer";

// The server component verifies the signed share link and tutor YAML before
// this client surface receives runtime headers. The client never gets to decide
// which tutor or availability window is valid.
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
  /** Tutor `llm.imageInput`: students may attach images. */
  imageInput: boolean;
  /** Tutor `title`: replaces the default greeting. */
  title?: string;
  /** Tutor `description`: rendered below the greeting. */
  description: string;
  /** Up to five sampled questions; clicking one fills the chat input. */
  exampleQuestions?: ExampleQuestion[];
}) {
  const ChatView = useMemo(() => {
    type ChatViewProps = ComponentProps<typeof CopilotChat.View>;
    function TutorChatView({ onInputChange, ...viewProps }: ChatViewProps) {
      const WelcomeWithDescription = (
        props: HTMLAttributes<HTMLDivElement>,
      ) => (
        <div {...props}>
          <CopilotChat.View.WelcomeMessage />
          {description ? (
            <p className="copilot-welcome-copy">{description}</p>
          ) : null}
          {exampleQuestions.length > 0 ? (
            <ul className="copilot-example-list">
              {exampleQuestions.map((q) => (
                <li key={`${q.title}\n${q.question}`}>
                  <button
                    type="button"
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

    return Object.assign(TutorChatView, CopilotChat.View);
  }, [description, exampleQuestions]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <div className="chat-workspace chat-workspace-real">
      <aside className="chat-sidebar" aria-label="Tutor details">
        <div className="sidebar-brand">
          <span className="brand-mark">N</span>
          <div>
            <strong>Novedu</strong>
            <span>Share-Link Sitzung</span>
          </div>
        </div>

        <section className="sidebar-section">
          <h2>Aktueller Tutor</h2>
          <div className="sidebar-info">
            <strong>{title ?? "Tutor Chat"}</strong>
            <span title={tutorUrl}>{tutorUrl}</span>
          </div>
        </section>

        <section className="sidebar-section">
          <h2>Funktionen</h2>
          <ul className="feature-list">
            <li>
              <span className="status-dot" aria-hidden="true" />
              Signierter Share-Link
            </li>
            <li>
              <span className="status-dot" aria-hidden="true" />
              CopilotKit Runtime
            </li>
            <li>
              <span
                className={imageInput ? "status-dot" : "status-dot muted"}
                aria-hidden="true"
              />
              {imageInput ? "Bild-Upload aktiv" : "Bild-Upload deaktiviert"}
            </li>
          </ul>
        </section>

        {exampleQuestions.length > 0 ? (
          <section className="sidebar-section">
            <h2>Beispiele</h2>
            <div className="example-stack">
              {exampleQuestions.map((q) => (
                <span key={`${q.title}\n${q.question}`}>{q.title}</span>
              ))}
            </div>
          </section>
        ) : null}

        <details className="sidebar-section prompt-details">
          <summary>System prompt &amp; warnings</summary>
          {warnings.length > 0 ? (
            <div className="warning-stack">
              {warnings.map((w) => (
                <div className="warning-box" key={`${w.code}-${w.message}`}>
                  <strong>{w.code}:</strong> {w.message}
                </div>
              ))}
            </div>
          ) : (
            <p className="sidebar-muted">Keine Warnungen.</p>
          )}
          <CodeBlock className="language-markdown">{prompt}</CodeBlock>
        </details>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <div>
            <span className="eyebrow">Tutor Session</span>
            <h1>{title ?? "Novedu Tutor Chat"}</h1>
            <p>{description}</p>
          </div>
          <div className="chat-status">
            <span className="status-dot" />
            Bereit
          </div>
        </header>

        {uploadError ? (
          <div className="upload-error" role="alert">
            <span>{uploadError}</span>
            <button type="button" onClick={() => setUploadError(null)}>
              Dismiss
            </button>
          </div>
        ) : null}

        <div className="copilot-chat-frame">
          {/*
            The tutor URL must not go in runtimeUrl's query string. CopilotKit
            appends sub-routes such as /info to runtimeUrl, so the verified
            share-link material travels as headers on every runtime request.
          */}
          <CopilotKitProvider
            key={tutorUrl}
            runtimeUrl="/api/copilotkit"
            headers={runtimeHeaders}
          >
            <CopilotChat
              agentId="tutor"
              labels={title ? { welcomeMessageText: title } : undefined}
              chatView={ChatView}
              messageView={{
                assistantMessage: { markdownRenderer: MarkdownRenderer },
              }}
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
      </main>
    </div>
  );
}

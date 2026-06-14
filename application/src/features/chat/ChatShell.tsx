"use client";

import { CopilotChat, CopilotKitProvider } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import { useMemo, useState } from "react";
import type { ChatModelOption, DemoTutorOption } from "@/lib/chat-options";
import { MarkdownRenderer } from "./MarkdownRenderer";

type Selection = { kind: "tutor"; id: string } | { kind: "model"; id: string };

function optionValue(selection: Selection): string {
  return `${selection.kind}:${selection.id}`;
}

function parseSelection(value: string): Selection {
  const [kind, id] = value.split(":");

  if (kind === "tutor") {
    return { kind, id };
  }

  return { kind: "model", id };
}

export function ChatShell({
  models,
  tutors,
  userId,
}: {
  models: ChatModelOption[];
  tutors: DemoTutorOption[];
  userId: string;
}) {
  const initialSelection: Selection =
    tutors[0] !== undefined
      ? { kind: "tutor", id: tutors[0].id }
      : { kind: "model", id: models[0]?.id ?? "demo-scch-model" };
  const [selection, setSelection] = useState<Selection>(initialSelection);

  const selectedTutor =
    selection.kind === "tutor"
      ? tutors.find((tutor) => tutor.id === selection.id)
      : undefined;
  const selectedModel =
    selection.kind === "model"
      ? models.find((model) => model.id === selection.id)
      : undefined;
  const selectedModelName = selectedTutor?.model ?? selectedModel?.model ?? "";
  const selectedTitle =
    selectedTutor?.title ?? selectedModel?.label ?? "SCCH Modellchat";
  const selectedDescription =
    selectedTutor?.description ??
    "Direkter SCCH Modellchat ohne Tutor-Konfiguration.";

  const runtimeHeaders = useMemo<Record<string, string>>(() => {
    if (selectedTutor) {
      const headers: Record<string, string> = {
        "x-chat-user": userId,
        "x-demo-tutor-id": selectedTutor.id,
      };
      return headers;
    }

    const headers: Record<string, string> = {
      "x-chat-user": userId,
      "x-scch-model": selectedModelName,
    };
    return headers;
  }, [selectedModelName, selectedTutor, userId]);

  return (
    <div
      className="chat-workspace chat-workspace-real"
      data-testid="chat-shell"
    >
      <aside className="chat-sidebar" aria-label="Chat navigation">
        <div className="sidebar-brand">
          <span className="brand-mark">N</span>
          <div>
            <strong>Novedu</strong>
            <span>Offener Chat</span>
          </div>
        </div>

        <label className="option-picker">
          <span>Chat-Ziel</span>
          <select
            aria-label="Chat-Ziel"
            value={optionValue(selection)}
            onChange={(event) =>
              setSelection(parseSelection(event.target.value))
            }
          >
            <optgroup label="Tutor-Konfiguration">
              {tutors.map((tutor) => (
                <option key={tutor.id} value={`tutor:${tutor.id}`}>
                  {tutor.title}
                </option>
              ))}
            </optgroup>
            <optgroup label="SCCH Modelle">
              {models.map((model) => (
                <option key={model.id} value={`model:${model.id}`}>
                  {model.label}
                </option>
              ))}
            </optgroup>
          </select>
          <small>Tutor-Konfiguration oder SCCH Modell</small>
        </label>

        <section className="sidebar-section" aria-labelledby="current-tutor">
          <h2 id="current-tutor">Aktueller Tutor</h2>
          <div className="sidebar-info">
            <strong>{selectedTitle}</strong>
            <span>{selectedDescription}</span>
          </div>
        </section>

        <section className="sidebar-section">
          <h2>Modell</h2>
          <div className="sidebar-info">
            <strong>{selectedModelName}</strong>
            <span>
              {selectedTutor
                ? "Tutor-Konfiguration nutzt dieses SCCH Modell."
                : "Direkter SCCH Modellchat"}
            </span>
          </div>
        </section>

        <section className="sidebar-section">
          <h2>Funktionen</h2>
          <ul className="feature-list">
            <li>
              <span className="status-dot" aria-hidden="true" />
              CopilotKit Runtime
            </li>
            <li>
              <span className="status-dot" aria-hidden="true" />
              Kein Share-Link fuer diesen MVP-Einstieg
            </li>
            <li>
              <span
                className={
                  selectedTutor?.imageInput ? "status-dot" : "status-dot muted"
                }
                aria-hidden="true"
              />
              {selectedTutor?.imageInput
                ? "Bild-Upload aktiv"
                : "Bild-Upload aus"}
            </li>
          </ul>
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
            <p>{selectedDescription}</p>
          </div>
          <div className="chat-status">
            <span className="status-dot" />
            Bereit
          </div>
        </header>

        <div className="copilot-chat-frame">
          <CopilotKitProvider
            key={optionValue(selection)}
            runtimeUrl="/api/copilotkit"
            headers={runtimeHeaders}
          >
            <CopilotChat
              agentId="tutor"
              labels={{ welcomeMessageText: selectedTitle }}
              messageView={{
                assistantMessage: { markdownRenderer: MarkdownRenderer },
              }}
            />
          </CopilotKitProvider>
        </div>
      </main>
    </div>
  );
}

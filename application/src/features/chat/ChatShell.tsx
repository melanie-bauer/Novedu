"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { useMemo, useState } from "react";
import {
  buildPickerOptions,
  type ChatPickerOption,
  ModelTutorPicker,
} from "@/features/chat/ModelTutorPicker";
import {
  type ChatModelOption,
  modelSupportsVision,
  type TutorOption,
} from "@/lib/chat-options";
import { ChatTopBar } from "./ChatTopBar";
import { NoveduChatSurface } from "./NoveduChatSurface";

function optionKey(option: ChatPickerOption): string {
  return `${option.kind}:${option.id}`;
}

export function ChatShell({
  models,
  tutors,
  userLabel,
  userId,
}: {
  models: ChatModelOption[];
  tutors: TutorOption[];
  userLabel: string;
  userId: string;
}) {
  const pickerOptions = useMemo(
    () =>
      buildPickerOptions(
        tutors.map((tutor) => ({ id: tutor.id, title: tutor.title })),
        models.map((model) => ({ id: model.id, label: model.label })),
      ),
    [models, tutors],
  );

  const initialSelection =
    pickerOptions[0] ??
    ({
      kind: "model",
      id: models[0]?.id ?? "demo-scch-model",
      label: models[0]?.label ?? "Modell",
      group: "Modelle",
    } satisfies ChatPickerOption);

  const [selection, setSelection] =
    useState<ChatPickerOption>(initialSelection);

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
    selectedTutor?.title ?? selectedModel?.label ?? "Novedu Chat";
  const selectedDescription =
    selectedTutor?.description ??
    "Direkter Modellchat ohne Tutor-Konfiguration.";
  const imageUploadsEnabled = selectedTutor
    ? selectedTutor.imageInput
    : modelSupportsVision(selectedModelName);

  const runtimeHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = {
      "x-chat-user": userId,
    };

    if (selectedTutor) {
      headers["x-tutor-id"] = selectedTutor.id;
      return headers;
    }

    headers["x-scch-model"] = selectedModelName;
    return headers;
  }, [selectedModelName, selectedTutor, userId]);

  return (
    <div className="gpt-app" data-testid="chat-shell">
      <ChatTopBar
        left={
          <ModelTutorPicker
            options={pickerOptions}
            value={selection}
            onChange={setSelection}
          />
        }
        userLabel={userLabel}
      />

      <div className="gpt-main">
        <CopilotKitProvider
          key={optionKey(selection)}
          runtimeUrl="/api/copilotkit"
          headers={runtimeHeaders}
        >
          <NoveduChatSurface
            agentId="tutor"
            imageUploadsEnabled={imageUploadsEnabled}
            welcome={{
              title: selectedTitle,
              description: selectedDescription,
            }}
          />
        </CopilotKitProvider>
      </div>
    </div>
  );
}

"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { ChatTopBar } from "./ChatTopBar";
import { NoveduChatSurface } from "./NoveduChatSurface";

export function TutorChat({
  tutorUrl,
  runtimeHeaders,
  imageInput,
  title,
  description,
  exampleQuestions = [],
}: {
  tutorUrl: string;
  runtimeHeaders: Record<string, string>;
  imageInput: boolean;
  title?: string;
  description: string;
  exampleQuestions?: Array<{ title: string; question: string }>;
}) {
  return (
    <div className="gpt-app" data-testid="share-chat-shell">
      <ChatTopBar
        left={
          <div className="gpt-share-title">
            <strong>{title ?? "Tutor Chat"}</strong>
            <span title={tutorUrl}>Share-Link</span>
          </div>
        }
      />

      <div className="gpt-main">
        <CopilotKitProvider
          key={tutorUrl}
          runtimeUrl="/api/copilotkit"
          headers={runtimeHeaders}
        >
          <NoveduChatSurface
            agentId="tutor"
            imageUploadsEnabled={imageInput}
            welcome={{
              title: title ?? "Tutor Chat",
              description,
              exampleQuestions,
            }}
          />
        </CopilotKitProvider>
      </div>
    </div>
  );
}

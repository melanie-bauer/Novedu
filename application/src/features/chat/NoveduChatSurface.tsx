"use client";

import type { InputContent } from "@ag-ui/core";
import {
  CopilotChatConfigurationProvider,
  CopilotChatInput,
  CopilotChatUserMessage,
  CopilotChatView,
  useAgent,
  useAttachments,
  useCopilotKit,
} from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";
import {
  type ChangeEvent,
  type ComponentProps,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { DOCUMENT_ACCEPT, extractDocumentText } from "@/lib/document-extract";
import { MarkdownRenderer } from "./MarkdownRenderer";

type PendingDocument = {
  id: string;
  name: string;
  text: string;
  mimeType: string;
};

type SentDocumentBadge = {
  name: string;
  mimeType: string;
};

type UserMessageDisplay = {
  text: string;
  documents: SentDocumentBadge[];
};

function buildAgentMessageText(
  documents: PendingDocument[],
  typedText: string,
): string {
  const docPrefix = documents
    .map((doc) => `[Dokument: ${doc.name}]\n${doc.text}`)
    .join("\n\n");
  return [docPrefix, typedText].filter(Boolean).join("\n\n").trim();
}

function fileTypeLabel(name: string, mimeType: string): string {
  const lower = name.toLowerCase();
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    return "PDF";
  }
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
    return "MD";
  }
  return "TXT";
}

function SentDocumentBadges({ documents }: { documents: SentDocumentBadge[] }) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="gpt-sent-attachment-bar">
      {documents.map((doc) => (
        <span
          key={doc.name}
          className="gpt-attachment-chip gpt-attachment-chip-sent"
        >
          <span className="gpt-attachment-type">
            {fileTypeLabel(doc.name, doc.mimeType)}
          </span>
          <span className="gpt-attachment-name">{doc.name}</span>
        </span>
      ))}
    </div>
  );
}

function DocumentAttachmentBar({
  documents,
  onRemove,
}: {
  documents: PendingDocument[];
  onRemove: (id: string) => void;
}) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="gpt-attachment-bar">
      {documents.map((doc) => (
        <span key={doc.id} className="gpt-attachment-chip">
          <span className="gpt-attachment-type">
            {fileTypeLabel(doc.name, doc.mimeType)}
          </span>
          <span className="gpt-attachment-name">{doc.name}</span>
          <button
            type="button"
            aria-label={`${doc.name} entfernen`}
            onClick={() => onRemove(doc.id)}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

function ChatComposer({
  pendingDocs,
  onRemoveDocument,
  ...inputProps
}: ComponentProps<typeof CopilotChatInput> & {
  pendingDocs: PendingDocument[];
  onRemoveDocument: (id: string) => void;
}) {
  return (
    <div className="gpt-composer-wrap">
      <DocumentAttachmentBar
        documents={pendingDocs}
        onRemove={onRemoveDocument}
      />
      <CopilotChatInput {...inputProps} />
    </div>
  );
}

type WelcomeProps = {
  title: string;
  description?: string;
  exampleQuestions?: Array<{ title: string; question: string }>;
};

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

function WelcomeScreen({
  title,
  description,
  exampleQuestions = [],
  onPickQuestion,
}: WelcomeProps & { onPickQuestion?: (question: string) => void }) {
  return (
    <div className="gpt-welcome">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {exampleQuestions.length > 0 ? (
        <ul className="gpt-example-list">
          {exampleQuestions.map((item) => (
            <li key={`${item.title}\n${item.question}`}>
              <button
                type="button"
                title={item.question}
                onClick={() => onPickQuestion?.(item.question)}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function NoveduChatSurface({
  agentId,
  welcome,
  imageUploadsEnabled,
}: {
  agentId: string;
  welcome: WelcomeProps;
  imageUploadsEnabled: boolean;
}) {
  const { agent } = useAgent({ agentId });
  const { copilotkit } = useCopilotKit();
  const [inputValue, setInputValue] = useState("");
  const [pendingDocs, setPendingDocs] = useState<PendingDocument[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const mixedInputRef = useRef<HTMLInputElement>(null);
  const userMessageDisplayRef = useRef(new Map<string, UserMessageDisplay>());

  const {
    attachments,
    fileInputRef,
    handleFileUpload,
    consumeAttachments,
    removeAttachment,
  } = useAttachments({
    config: {
      enabled: imageUploadsEnabled,
      accept: "image/*",
      maxSize: MAX_ATTACHMENT_BYTES,
      onUpload: async (file) => {
        const value = await readAsDataUrl(file);
        return { type: "url", value, mimeType: file.type };
      },
      onUploadFailed: ({ file, message }) => {
        setUploadError(`${file.name}: ${message}`);
      },
    },
  });

  const hasMessages = agent.messages.length > 0;

  const removePendingDoc = useCallback((id: string) => {
    setPendingDocs((current) => current.filter((doc) => doc.id !== id));
  }, []);

  const inputSlot = useMemo(() => {
    function Composer(props: ComponentProps<typeof CopilotChatInput>) {
      return (
        <ChatComposer
          {...props}
          bottomAnchored
          showDisclaimer
          className="gpt-chat-input"
          pendingDocs={pendingDocs}
          onRemoveDocument={removePendingDoc}
        />
      );
    }
    return Composer as typeof CopilotChatInput;
  }, [pendingDocs, removePendingDoc]);

  const userMessageSlot = useMemo(() => {
    function NoveduUserMessage(
      props: ComponentProps<typeof CopilotChatUserMessage>,
    ) {
      const display = userMessageDisplayRef.current.get(props.message.id);
      const displayText = display?.text ?? "";
      const sentDocuments = display?.documents ?? [];
      const originalContent = Array.isArray(props.message.content)
        ? props.message.content
        : [];
      const nonTextContent = originalContent.filter(
        (part) => part.type !== "text",
      );
      const displayContent: InputContent[] = displayText
        ? [{ type: "text", text: displayText }]
        : [];
      const visibleContent = display
        ? [...displayContent, ...nonTextContent]
        : originalContent;

      return (
        <div className="gpt-user-message-block">
          <SentDocumentBadges documents={sentDocuments} />
          {visibleContent.length > 0 || !display ? (
            <CopilotChatUserMessage
              {...props}
              message={
                display
                  ? { ...props.message, content: visibleContent }
                  : props.message
              }
            />
          ) : null}
        </div>
      );
    }

    return NoveduUserMessage as typeof CopilotChatUserMessage;
  }, []);

  const welcomeScreen = useMemo(() => {
    if (hasMessages) {
      return undefined;
    }

    function Screen() {
      return (
        <WelcomeScreen
          title={welcome.title}
          description={welcome.description}
          exampleQuestions={welcome.exampleQuestions}
          onPickQuestion={setInputValue}
        />
      );
    }

    return { welcomeMessage: Screen };
  }, [hasMessages, welcome]);

  const submitMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    const docsSnapshot = [...pendingDocs];
    const agentText = buildAgentMessageText(docsSnapshot, trimmed);
    const readyAttachments = consumeAttachments();

    if (!agentText && readyAttachments.length === 0) {
      return;
    }

    const messageId = crypto.randomUUID();
    userMessageDisplayRef.current.set(messageId, {
      text: trimmed,
      documents: docsSnapshot.map((doc) => ({
        name: doc.name,
        mimeType: doc.mimeType,
      })),
    });

    const content: InputContent[] = [];
    if (agentText) {
      content.push({ type: "text", text: agentText });
    }

    for (const attachment of readyAttachments) {
      content.push({
        type: attachment.type,
        source: attachment.source,
        metadata: {
          ...(attachment.filename ? { filename: attachment.filename } : {}),
          ...attachment.metadata,
        },
      } as InputContent);
    }

    agent.addMessage({
      id: messageId,
      role: "user",
      content,
    });
    setInputValue("");
    setPendingDocs([]);
    setUploadError(null);
    await copilotkit.runAgent({ agent });
  };

  const handleMixedUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    if (
      file.type.startsWith("image/") &&
      imageUploadsEnabled &&
      fileInputRef.current
    ) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      fileInputRef.current.files = transfer.files;
      handleFileUpload({
        target: fileInputRef.current,
      } as ChangeEvent<HTMLInputElement>);
      return;
    }

    try {
      const text = await extractDocumentText(file);
      if (!text.trim()) {
        setUploadError(`${file.name}: Kein Text gefunden.`);
        return;
      }
      setPendingDocs((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          name: file.name,
          text,
          mimeType:
            file.type ||
            (file.name.toLowerCase().endsWith(".pdf")
              ? "application/pdf"
              : "text/plain"),
        },
      ]);
      setUploadError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setUploadError(message);
    }
  };

  const accept = imageUploadsEnabled
    ? `image/*,${DOCUMENT_ACCEPT}`
    : DOCUMENT_ACCEPT;

  return (
    <div className="gpt-chat-surface">
      <input
        ref={mixedInputRef}
        type="file"
        accept={accept}
        className="visually-hidden"
        onChange={handleMixedUpload}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="visually-hidden"
        onChange={handleFileUpload}
      />

      {uploadError ? (
        <div className="gpt-upload-error" role="alert">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError(null)}>
            Schließen
          </button>
        </div>
      ) : null}

      <CopilotChatConfigurationProvider
        labels={{ chatInputPlaceholder: "Nachricht an Novedu..." }}
      >
        <CopilotChatView
          messages={agent.messages}
          isRunning={agent.isRunning}
          onSubmitMessage={submitMessage}
          onStop={() => agent.abortRun()}
          inputValue={inputValue}
          onInputChange={setInputValue}
          attachments={attachments}
          onRemoveAttachment={removeAttachment}
          welcomeScreen={welcomeScreen}
          onAddFile={() => mixedInputRef.current?.click()}
          messageView={{
            assistantMessage: { markdownRenderer: MarkdownRenderer },
            userMessage: userMessageSlot,
            className: "gpt-message-view",
          }}
          scrollView={{
            feather: () => null,
            scrollToBottomButton: () => null,
          }}
          input={inputSlot}
          className="gpt-chat-view"
        />
      </CopilotChatConfigurationProvider>
    </div>
  );
}

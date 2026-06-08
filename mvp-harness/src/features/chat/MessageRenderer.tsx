type Segment =
  | { type: "text"; value: string }
  | { type: "latex"; value: string }
  | { type: "code"; language: string; value: string };

export function MessageRenderer({ content }: { content: string }) {
  return (
    <>
      {parseMessageSegments(content).map((segment, index) => {
        const key = `${segment.type}-${index}`;

        if (segment.type === "latex") {
          return (
            <span
              className="latex-formula"
              data-testid="latex-formula"
              key={key}
            >
              {segment.value}
            </span>
          );
        }

        if (segment.type === "code") {
          return (
            <pre className="code-block" data-testid="code-block" key={key}>
              <code data-language={segment.language}>{segment.value}</code>
            </pre>
          );
        }

        return <p key={key}>{segment.value}</p>;
      })}
    </>
  );
}

export function parseMessageSegments(content: string): Segment[] {
  const segments: Segment[] = [];
  const blockPattern = /```(\w*)\n([\s\S]*?)```|\$\$([\s\S]*?)\$\$/g;
  let cursor = 0;
  let match = blockPattern.exec(content);

  while (match) {
    if (match.index > cursor) {
      pushText(segments, content.slice(cursor, match.index));
    }

    if (match[2] !== undefined) {
      segments.push({
        type: "code",
        language: match[1] || "text",
        value: match[2].trim(),
      });
    } else if (match[3] !== undefined) {
      segments.push({ type: "latex", value: match[3].trim() });
    }

    cursor = blockPattern.lastIndex;
    match = blockPattern.exec(content);
  }

  if (cursor < content.length) {
    pushText(segments, content.slice(cursor));
  }

  return segments;
}

function pushText(segments: Segment[], value: string) {
  const trimmed = value.trim();

  if (trimmed) {
    segments.push({ type: "text", value: trimmed });
  }
}

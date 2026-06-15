"use client";

import type { ComponentProps } from "react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// Renders a fenced code block: a header (language label + copy button) above a
// syntax-highlighted body with soft-wrapped long lines, plus line numbers for
// multi-line snippets. Inline code (no language fence) falls through to a plain
// <code>.
//
// The theme is hard-coded to the light Prism theme (oneLight) and the surrounding
// chrome uses fixed light colors — it intentionally does NOT follow the system
// color scheme.
export function CodeBlock({
  className,
  children,
  // `node` is react-markdown's hast node; drop it so it doesn't leak onto the DOM.
  node: _node,
  ...rest
}: ComponentProps<"code"> & { node?: unknown }) {
  const match = /language-(\w+)/.exec(className ?? "");
  const text = String(children).replace(/\n$/, "");

  // No language class → inline code (or a fence without a language). Render plainly.
  if (!match) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  }

  const language = match[1];
  const multiline = text.includes("\n");

  return (
    <div
      style={{
        background: "#f6f8fa",
        border: "1px solid #d0d7de",
        borderRadius: "6px",
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.5rem 0.75rem",
          borderBottom: "1px solid #d0d7de",
        }}
      >
        <span
          style={{ fontSize: "0.85rem", color: "#57606a", fontWeight: 500 }}
        >
          {language}
        </span>
        <CopyButton text={text} />
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneLight}
        showLineNumbers={multiline}
        wrapLongLines
        PreTag="div"
        // Let the wrapping div own the background, border, and rounding.
        customStyle={{
          margin: 0,
          background: "transparent",
          padding: "0.75rem",
          fontSize: "0.85rem",
        }}
        lineNumberStyle={{ color: "#afb8c1", minWidth: "2.2em" }}
      >
        {text}
      </SyntaxHighlighter>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable (e.g. an insecure context) — ignore.
    }
  };

  return (
    <button
      type="button"
      style={{
        fontSize: "0.85rem",
        padding: "0.25rem 0.75rem",
        background: copied ? "#1a7f37" : "#f6f8fa",
        color: copied ? "#ffffff" : "#24292f",
        border: "1px solid #d0d7de",
        borderRadius: "4px",
        cursor: "pointer",
      }}
      onClick={copy}
      aria-label="Copy code to clipboard"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

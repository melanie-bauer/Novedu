"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "./CodeBlock";

// Drop-in replacement for CopilotKit v2's default Streamdown markdown renderer.
//
// Streamdown defaults to `singleDollarTextMath: false` (so inline `$...$` is not
// treated as math) AND runs rehype-sanitize, which strips KaTeX's class names and
// breaks the rendered output. CopilotKit doesn't expose Streamdown's plugin config,
// so we swap the whole renderer via the `markdownRenderer` slot.
//
// This pipeline enables inline + block math (no `singleDollarTextMath: false`), runs
// rehype-katex with no sanitize step (KaTeX classes survive), and renders fenced
// code through ./CodeBlock. Dropping rehype-sanitize is safe here: react-markdown
// does not parse raw HTML and allowlists URL schemes.
export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code: CodeBlock,
        // CodeBlock renders its own styled container, so drop react-markdown's
        // default <pre> wrapper (CopilotKit styles bare <pre> with a dark frame).
        pre: ({ children }) => <>{children}</>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

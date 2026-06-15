"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "./CodeBlock";

// Pre-process LaTeX-style delimiters to remark-math compatible format
function convertLatexDelimiters(content: string): string {
  // Convert \[...\] to $$...$$ (block math)
  let processed = content.replace(/\\\[(.*?)\\\]/gs, (_, p1) => `$$${p1}$$`);
  // Convert \(...\) to $...$ (inline math)
  processed = processed.replace(/\\\((.*?)\\\)/g, (_, p1) => `$${p1}$`);
  return processed;
}

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
//
// Supports both $/$$ (Pandoc-style) and \(...\)/\[...\] (LaTeX-style) delimiters.
export function MarkdownRenderer({ content }: { content: string }) {
  const processedContent = convertLatexDelimiters(content);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, [remarkMath, { singleDollarTextMath: true }]]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code: CodeBlock,
        // CodeBlock renders its own styled container, so drop react-markdown's
        // default <pre> wrapper (CopilotKit styles bare <pre> with a dark frame).
        pre: ({ children }) => <>{children}</>,
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
}

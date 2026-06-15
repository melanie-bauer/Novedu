"use client";

const TEXT_EXTENSIONS = new Set([".txt", ".md", ".markdown", ".csv", ".json"]);

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

async function readTextFile(file: File): Promise<string> {
  return file.text();
}

async function readPdfFile(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .trim();
    if (text) {
      pages.push(text);
    }
  }

  return pages.join("\n\n").trim();
}

export async function extractDocumentText(file: File): Promise<string> {
  const extension = extensionOf(file.name);

  if (file.type === "application/pdf" || extension === ".pdf") {
    return readPdfFile(file);
  }

  if (
    file.type.startsWith("text/") ||
    TEXT_EXTENSIONS.has(extension) ||
    extension === ""
  ) {
    return readTextFile(file);
  }

  throw new Error(
    `Dateityp nicht unterstützt: ${file.name}. Erlaubt sind PDF, TXT und Markdown.`,
  );
}

export const DOCUMENT_ACCEPT =
  "application/pdf,.pdf,text/plain,.txt,.md,.markdown";

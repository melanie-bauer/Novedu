import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  listGitHubTutorSummaries,
  loadGitHubTutorById,
} from "@/lib/tutors/github-catalog";

const originalEnv = { ...process.env };

const tutorYaml = `id: math-tutor
name: Mathematik Tutor
title: Mathematik Tutor
description: Hilft bei Mathe.
llm:
  model: Qwen/Qwen3
  imageInput: false
prompt:
  tutor_instructions: |
    Du bist ein Mathe-Tutor.
`;

function mockResponse(body: string, init?: ResponseInit): Response {
  return new Response(body, init);
}

describe("GitHub tutor catalog", () => {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      TUTOR_CONFIG_GITHUB_OWNER: "school",
      TUTOR_CONFIG_GITHUB_REPO: "tutors",
      TUTOR_CONFIG_GITHUB_PATH: "AI",
      TUTOR_CONFIG_GITHUB_REF: "main",
    };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("lists YAML tutor summaries from GitHub", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        const accept = new Headers(init?.headers).get("accept") ?? "";

        if (url.includes("/contents/AI?ref=main") && accept.includes("json")) {
          return mockResponse(
            JSON.stringify([
              {
                name: "math-tutor.yaml",
                path: "AI/math-tutor.yaml",
                type: "file",
              },
              { name: "README.md", path: "AI/README.md", type: "file" },
            ]),
          );
        }

        if (
          url.includes("/contents/AI/math-tutor.yaml") &&
          accept.includes("raw")
        ) {
          return mockResponse(tutorYaml);
        }

        return mockResponse("not found", { status: 404 });
      }),
    );

    await expect(listGitHubTutorSummaries()).resolves.toEqual([
      {
        id: "math-tutor",
        title: "Mathematik Tutor",
        description: "Hilft bei Mathe.",
        model: "Qwen/Qwen3",
        imageInput: false,
      },
    ]);
  });

  it("loads and builds a selected GitHub tutor", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        const accept = new Headers(init?.headers).get("accept") ?? "";

        if (url.includes("/contents/AI?ref=main") && accept.includes("json")) {
          return mockResponse(
            JSON.stringify([
              {
                name: "math-tutor.yaml",
                path: "AI/math-tutor.yaml",
                type: "file",
              },
            ]),
          );
        }

        if (
          url.includes("/contents/AI/math-tutor.yaml") &&
          accept.includes("raw")
        ) {
          return mockResponse(tutorYaml);
        }

        return mockResponse("not found", { status: 404 });
      }),
    );

    const result = await loadGitHubTutorById("math-tutor");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.model).toBe("Qwen/Qwen3");
      expect(result.prompt).toContain("Du bist ein Mathe-Tutor.");
    }
  });
});
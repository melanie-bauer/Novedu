import type { TutorSummary } from "./catalog-types";
import type { BuildResult, ValidationError } from "./errors";
import { error } from "./errors";
import type { Fetcher, FetchResponse } from "./fetcher";
import { loadAndBuildTutorPrompt } from "./load";
import { parseYaml, validate } from "./parse";
import { type Tutor, TutorSchema } from "./schemas";

const GITHUB_API_ROOT = "https://api.github.com";
const GITHUB_API_VERSION = "2022-11-28";
const DEFAULT_TUTOR_PATH = "AI";
const DEFAULT_REF = "main";

export type GitHubTutorCatalogConfig = {
  owner: string;
  repo: string;
  path: string;
  ref: string;
  token?: string;
};

type GitHubContentsEntry = {
  name: string;
  path: string;
  type: string;
};

type TutorMetadataResult =
  | { ok: true; sourceUrl: string; tutor: Tutor }
  | { ok: false; error: ValidationError };

function envValue(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function cleanRepoPath(value: string | undefined): string {
  return (value ?? DEFAULT_TUTOR_PATH).trim().replace(/^\/+|\/+$/g, "");
}

function encodeGitHubPath(value: string): string {
  return value
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function githubHeaders(config: GitHubTutorCatalogConfig, accept: string) {
  const headers: Record<string, string> = {
    Accept: accept,
    "User-Agent": "novedu-application",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  };

  if (config.token) {
    headers.Authorization = `Bearer ${config.token}`;
  }

  return headers;
}

export function getGitHubTutorCatalogConfig(): GitHubTutorCatalogConfig | null {
  const owner = envValue("TUTOR_CONFIG_GITHUB_OWNER");
  const repo = envValue("TUTOR_CONFIG_GITHUB_REPO");

  if (!owner || !repo) {
    return null;
  }

  return {
    owner,
    repo,
    path: cleanRepoPath(envValue("TUTOR_CONFIG_GITHUB_PATH")),
    ref: envValue("TUTOR_CONFIG_GITHUB_REF") ?? DEFAULT_REF,
    token: envValue("TUTOR_CONFIG_GITHUB_TOKEN"),
  };
}

export function isGitHubTutorCatalogConfigured(): boolean {
  return getGitHubTutorCatalogConfig() !== null;
}

function githubContentsUrl(
  config: GitHubTutorCatalogConfig,
  path: string,
): string {
  const repoPath = `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(
    config.repo,
  )}/contents`;
  const encodedPath = encodeGitHubPath(path);
  const url = new URL(
    `${GITHUB_API_ROOT}${repoPath}${encodedPath ? `/${encodedPath}` : ""}`,
  );
  url.searchParams.set("ref", config.ref);
  return url.href;
}

function isSameGitHubContentsUrl(
  url: URL,
  config: GitHubTutorCatalogConfig,
): boolean {
  const expectedPrefix = `/repos/${config.owner}/${config.repo}/contents`;
  return (
    url.hostname === "api.github.com" &&
    decodeURIComponent(url.pathname).startsWith(expectedPrefix)
  );
}

function withDefaultGitHubRef(
  url: string,
  config: GitHubTutorCatalogConfig,
): string {
  const parsed = new URL(url);
  if (
    isSameGitHubContentsUrl(parsed, config) &&
    !parsed.searchParams.has("ref")
  ) {
    parsed.searchParams.set("ref", config.ref);
  }
  return parsed.href;
}

async function githubFetch(
  url: string,
  config: GitHubTutorCatalogConfig,
  accept: string,
): Promise<Response> {
  return fetch(url, {
    cache: "no-store",
    headers: githubHeaders(config, accept),
  });
}

function githubRawFetcher(config: GitHubTutorCatalogConfig): Fetcher {
  return async (url): Promise<FetchResponse> => {
    const parsed = new URL(url);

    if (isSameGitHubContentsUrl(parsed, config)) {
      return githubFetch(
        withDefaultGitHubRef(url, config),
        config,
        "application/vnd.github.raw+json",
      );
    }

    if (parsed.hostname === "raw.githubusercontent.com") {
      return fetch(url, {
        cache: "no-store",
        headers: config.token
          ? { Authorization: `Bearer ${config.token}` }
          : undefined,
        redirect: "follow",
      });
    }

    return fetch(url, { cache: "no-store", redirect: "follow" });
  };
}

async function listGitHubYamlFiles(
  config: GitHubTutorCatalogConfig,
): Promise<GitHubContentsEntry[]> {
  const res = await githubFetch(
    githubContentsUrl(config, config.path),
    config,
    "application/vnd.github+json",
  );

  if (!res.ok) {
    throw new Error(`GitHub returned HTTP ${res.status} for tutor catalog`);
  }

  const json = (await res.json()) as unknown;
  if (!Array.isArray(json)) {
    throw new Error(`GitHub tutor path "${config.path}" is not a directory`);
  }

  return json
    .filter(
      (entry): entry is GitHubContentsEntry =>
        typeof entry === "object" &&
        entry !== null &&
        "name" in entry &&
        "path" in entry &&
        "type" in entry &&
        typeof entry.name === "string" &&
        typeof entry.path === "string" &&
        entry.type === "file" &&
        /\.ya?ml$/i.test(entry.name),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchGitHubText(
  config: GitHubTutorCatalogConfig,
  filePath: string,
): Promise<
  | { ok: true; sourceUrl: string; text: string }
  | { ok: false; error: ValidationError }
> {
  const sourceUrl = githubContentsUrl(config, filePath);

  try {
    const res = await githubRawFetcher(config)(sourceUrl);
    if (!res.ok) {
      return {
        ok: false,
        error: error(
          "FETCH_FAILED",
          `Failed to fetch ${filePath} from GitHub (HTTP ${res.status})`,
          { status: res.status, url: sourceUrl },
        ),
      };
    }

    return { ok: true, sourceUrl, text: await res.text() };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: error("FETCH_FAILED", `Failed to fetch ${filePath}: ${message}`, {
        url: sourceUrl,
      }),
    };
  }
}

async function readTutorMetadata(
  config: GitHubTutorCatalogConfig,
  filePath: string,
): Promise<TutorMetadataResult> {
  const fetched = await fetchGitHubText(config, filePath);
  if (!fetched.ok) return { ok: false, error: fetched.error };

  const parsed = parseYaml(fetched.text, fetched.sourceUrl);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const valid = validate<Tutor>(
    parsed.value,
    TutorSchema,
    "TUTOR_SCHEMA_ERROR",
    fetched.sourceUrl,
  );
  if (!valid.ok) return { ok: false, error: valid.error };

  return { ok: true, sourceUrl: fetched.sourceUrl, tutor: valid.data };
}

function summaryFromTutor(tutor: Tutor): TutorSummary {
  return {
    id: tutor.id,
    title: tutor.title ?? tutor.name,
    description: tutor.description,
    model: tutor.llm.model,
    imageInput: tutor.llm.imageInput ?? true,
  };
}

export async function listGitHubTutorSummaries(): Promise<TutorSummary[]> {
  const config = getGitHubTutorCatalogConfig();
  if (!config) return [];

  let files: GitHubContentsEntry[];
  try {
    files = await listGitHubYamlFiles(config);
  } catch (e) {
    console.warn(
      `[tutors] Could not list GitHub tutor catalog: ${(e as Error).message}`,
    );
    return [];
  }

  const seenIds = new Set<string>();
  const summaries: TutorSummary[] = [];

  for (const file of files) {
    const metadata = await readTutorMetadata(config, file.path);
    if (!metadata.ok) {
      console.warn(`[tutors] Skipping ${file.path}: ${metadata.error.message}`);
      continue;
    }

    if (seenIds.has(metadata.tutor.id)) {
      console.warn(`[tutors] Skipping duplicate tutor id ${metadata.tutor.id}`);
      continue;
    }

    seenIds.add(metadata.tutor.id);
    summaries.push(summaryFromTutor(metadata.tutor));
  }

  return summaries.sort((a, b) => a.title.localeCompare(b.title));
}

export async function loadGitHubTutorById(id: string): Promise<BuildResult> {
  const config = getGitHubTutorCatalogConfig();
  if (!config) {
    return {
      ok: false,
      errors: [
        error(
          "FETCH_FAILED",
          "GitHub tutor catalog is not configured. Set TUTOR_CONFIG_GITHUB_OWNER and TUTOR_CONFIG_GITHUB_REPO.",
        ),
      ],
      warnings: [],
    };
  }

  let files: GitHubContentsEntry[];
  try {
    files = await listGitHubYamlFiles(config);
  } catch (e) {
    return {
      ok: false,
      errors: [
        error(
          "FETCH_FAILED",
          `Failed to list GitHub tutor catalog: ${(e as Error).message}`,
        ),
      ],
      warnings: [],
    };
  }

  for (const file of files) {
    const metadata = await readTutorMetadata(config, file.path);
    if (!metadata.ok) continue;
    if (metadata.tutor.id !== id) continue;

    return loadAndBuildTutorPrompt(
      metadata.sourceUrl,
      githubRawFetcher(config),
    );
  }

  return {
    ok: false,
    errors: [error("FETCH_FAILED", `Tutor "${id}" was not found in GitHub.`)],
    warnings: [],
  };
}

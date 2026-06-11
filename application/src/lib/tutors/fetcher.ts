// The single network seam. Everything else in lib/tutors is pure; injecting a
// `Fetcher` lets tests run fully offline against local fixtures.

/** The subset of the Fetch `Response` the core needs. The real `Response` satisfies it structurally. */
export interface FetchResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

export type Fetcher = (url: string) => Promise<FetchResponse>;

const DEFAULT_TIMEOUT_MS = 10_000;

/** Production fetcher: global `fetch` with an abort-based timeout so a slow host can't hang the request. */
export const defaultFetcher: Fetcher = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal, redirect: "follow" });
  } finally {
    clearTimeout(timeout);
  }
};

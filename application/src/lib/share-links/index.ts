import { createHmac, timingSafeEqual } from "node:crypto";

// SERVER-ONLY: uses node:crypto and handles the signing secret. Never import
// from client components.

export interface SharePayload {
  /** Public URL of the tutor-definition YAML. */
  tutor: string;
  /** Window start, unix seconds (UTC). */
  start: number;
  /** Window end, unix seconds (UTC). */
  end: number;
}

// The exact string that is signed. Raw (un-encoded) values by design: both sides
// sign the decoded parameter values, so URL encoding never has to match.
//
// NOTE: this format is injective ONLY because start/end are validated against
// TIMESTAMP_PATTERN (digits only) BEFORE signing and BEFORE verifying. That
// rules out re-splitting a tutor URL that itself contains "&start=": the
// alternative split would have to absorb "&start=..." into the end value, which
// then fails the digit check. Keep the pattern checks ahead of the HMAC on both
// sides.
export function canonicalPayload({ tutor, start, end }: SharePayload): string {
  return `tutor=${tutor}&start=${start}&end=${end}`;
}

export function signSharePayload(
  payload: SharePayload,
  secret: string,
): string {
  return createHmac("sha256", secret)
    .update(canonicalPayload(payload))
    .digest("hex");
}

/**
 * Assembles the full deep link to the chat from a payload and its signature.
 * Takes the PRECOMPUTED sig (from `signSharePayload`) so callers that also
 * persist the signature sign exactly once — the issued URL and the stored row
 * can never drift.
 */
export function buildShareLink(
  chatUrl: string,
  payload: SharePayload,
  sig: string,
): string {
  const url = new URL(chatUrl);
  url.searchParams.set("tutor", payload.tutor);
  url.searchParams.set("start", String(payload.start));
  url.searchParams.set("end", String(payload.end));
  url.searchParams.set("sig", sig);
  return url.toString();
}

export type ShareLinkVerification =
  // Success echoes the verified sig so callers can forward the exact parameter
  // set (e.g. as chat-runtime headers) without re-reading the request.
  | ({ ok: true; sig: string } & SharePayload)
  // A parameter is absent, empty, or malformed — most likely the chat was
  // opened without a (complete) share link.
  | { ok: false; reason: "missing-params" }
  // The signature does not match the parameters — tampered or truncated link.
  | { ok: false; reason: "invalid-signature" }
  // Signature is valid but "now" is outside the signed window; the bounds are
  // included so the UI can say WHEN the link opens/closed, in local time.
  | {
      ok: false;
      reason: "not-started" | "expired";
      start: number;
      end: number;
    };

export type ShareLinkRejection = Extract<
  ShareLinkVerification,
  { ok: false }
>["reason"];

// Unix-seconds values are 10 digits today; 15 caps far beyond year 9999 while
// staying well inside Number.isSafeInteger territory. Also load-bearing for the
// canonical string's injectivity — see canonicalPayload.
const TIMESTAMP_PATTERN = /^\d{1,15}$/;

function safeEqualHex(candidate: string, expected: string): boolean {
  // Reject non-hex up front: Buffer.from(.., "hex") silently stops at the first
  // invalid character, which would otherwise accept e.g. `<sig>zz`.
  if (!/^[0-9a-f]+$/i.test(candidate)) return false;
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Verifies the four deep-link parameters (as decoded strings) against the
 * signing secret and the current time. `nowSeconds` is injected for testability;
 * callers pass `Math.floor(Date.now() / 1000)`. Both window bounds are inclusive.
 */
export function verifyShareLink(
  params: { tutor?: unknown; start?: unknown; end?: unknown; sig?: unknown },
  secret: string,
  nowSeconds: number,
): ShareLinkVerification {
  const { tutor, start, end, sig } = params;
  if (
    typeof tutor !== "string" ||
    typeof start !== "string" ||
    typeof end !== "string" ||
    typeof sig !== "string" ||
    tutor === "" ||
    sig === "" ||
    !TIMESTAMP_PATTERN.test(start) ||
    !TIMESTAMP_PATTERN.test(end)
  ) {
    return { ok: false, reason: "missing-params" };
  }

  const payload: SharePayload = {
    tutor,
    start: Number(start),
    end: Number(end),
  };
  if (!safeEqualHex(sig, signSharePayload(payload, secret))) {
    return { ok: false, reason: "invalid-signature" };
  }

  if (nowSeconds < payload.start) {
    return {
      ok: false,
      reason: "not-started",
      start: payload.start,
      end: payload.end,
    };
  }
  if (nowSeconds > payload.end) {
    return {
      ok: false,
      reason: "expired",
      start: payload.start,
      end: payload.end,
    };
  }
  return { ok: true, sig, ...payload };
}

export type ShareRequestValidation =
  | { ok: true; payload: SharePayload }
  | { ok: false; message: string };

/**
 * Validates a teacher's raw "create share link" form input (tutor URL string,
 * start/end as unix-second strings). Pure so the server action stays a thin,
 * auth-handling shell around it.
 *
 * The tutor URL is NORMALIZED to `URL.href` before it goes into the payload:
 * that percent-encodes non-ASCII characters, which matters because the URL is
 * later sent as an HTTP header (header values must be Latin-1 — a raw unicode
 * URL would make every chat-runtime fetch throw in the browser). Signing and
 * verification both see the normalized form, so they stay consistent.
 */
export function validateShareRequest(input: {
  tutor: unknown;
  start: unknown;
  end: unknown;
}): ShareRequestValidation {
  let url: URL;
  try {
    url = new URL(typeof input.tutor === "string" ? input.tutor.trim() : "");
  } catch {
    return {
      ok: false,
      message: "Provide a public http(s) URL to a tutor YAML file.",
    };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      ok: false,
      message: "Provide a public http(s) URL to a tutor YAML file.",
    };
  }

  const start = typeof input.start === "string" ? input.start : "";
  const end = typeof input.end === "string" ? input.end : "";
  if (!TIMESTAMP_PATTERN.test(start) || !TIMESTAMP_PATTERN.test(end)) {
    return {
      ok: false,
      message: "Pick both a start and an end date and time.",
    };
  }
  const payload: SharePayload = {
    tutor: url.href,
    start: Number(start),
    end: Number(end),
  };
  if (payload.end <= payload.start) {
    return {
      ok: false,
      message: "The end of the availability window must be after its start.",
    };
  }
  return { ok: true, payload };
}

/** The server-side signing secret. Known only to the server — never sent to clients. */
export function getShareLinkSecret(): string {
  const secret = process.env.SHARE_LINK_SECRET;
  if (!secret) throw new Error("Missing required env var: SHARE_LINK_SECRET");
  return secret;
}

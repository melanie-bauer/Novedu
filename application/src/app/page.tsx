import { TutorChat } from "@/features/chat/TutorChat";
import { getShareLinkSecret, verifyShareLink } from "@/lib/share-links";
import { defaultFetcher, loadAndBuildTutorPrompt } from "@/lib/tutors";

// The chat is reachable ONLY through a signed share link created by a teacher
// (`/?tutor=...&start=...&end=...&sig=...`). This is a server component on purpose:
// the signature, the availability window, and the tutor YAML are all verified
// server-side, so nothing the browser does can skip the checks. (The CopilotKit
// runtime route re-verifies the same parameters on every chat request — this page
// only decides what to render.)
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const single = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const raw = {
    tutor: single(params.tutor),
    start: single(params.start),
    end: single(params.end),
    sig: single(params.sig),
  };

  const nowSeconds = Math.floor(Date.now() / 1000);
  const verification = verifyShareLink(raw, getShareLinkSecret(), nowSeconds);

  if (!verification.ok) {
    return (
      <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Share link error
        </h1>
        <p style={{ marginBottom: "1rem" }}>
          {verification.reason === "missing-params" &&
            "The chat requires a tutor share link."}
          {verification.reason === "invalid-signature" &&
            "The tutor share link is invalid."}
          {verification.reason === "not-started" &&
            "This tutor's availability window has not started yet."}
          {verification.reason === "expired" &&
            "This tutor's availability window has ended."}
        </p>
        {verification.reason === "not-started" ||
        verification.reason === "expired" ? (
          <p style={{ fontSize: "0.9rem", color: "#57606a" }}>
            Window: {new Date(verification.start * 1000).toLocaleString()} -{" "}
            {new Date(verification.end * 1000).toLocaleString()}
          </p>
        ) : null}
      </main>
    );
  }

  // The link is genuine and within its window — now the tutor itself must be valid.
  // (Deliberately uncached for this early preview: one fetch chain per page load
  // keeps edits to the tutor YAML visible immediately.)
  const result = await loadAndBuildTutorPrompt(
    verification.tutor,
    defaultFetcher,
  );
  if (!result.ok) {
    const first = result.errors[0];
    return (
      <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          This tutor cannot be loaded
        </h1>
        <p style={{ marginBottom: "1rem" }}>
          The tutor behind this share link failed validation. Ask your teacher
          to check the tutor definition.
        </p>
        {result.warnings.length > 0 ? (
          <div style={{ marginBottom: "1rem" }}>
            {result.warnings.map((w) => (
              <div
                key={`${w.code}-${w.message}`}
                style={{
                  padding: "0.5rem",
                  background: "#fff8c5",
                  border: "1px solid #e3b341",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                }}
              >
                <strong>{w.code}:</strong> {w.message}
              </div>
            ))}
          </div>
        ) : null}
        {first ? (
          <div
            style={{
              padding: "0.5rem",
              background: "#ffebe9",
              border: "1px solid #cf222e",
              borderRadius: "4px",
            }}
          >
            <strong>{first.code}:</strong> {first.message}
          </div>
        ) : null}
      </main>
    );
  }

  return (
    <main style={{ padding: "0", margin: "0" }}>
      <TutorChat
        tutorUrl={verification.tutor}
        runtimeHeaders={{
          "x-tutor-url": verification.tutor,
          "x-share-start": String(verification.start),
          "x-share-end": String(verification.end),
          "x-share-sig": verification.sig,
        }}
        prompt={result.prompt}
        warnings={result.warnings}
        imageInput={result.imageInput}
        title={result.title}
        description={result.description}
        exampleQuestions={[]}
      />
    </main>
  );
}

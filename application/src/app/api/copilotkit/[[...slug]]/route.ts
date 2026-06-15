import { MastraAgent } from "@ag-ui/mastra";
import { CopilotRuntime, createCopilotEndpoint } from "@copilotkit/runtime/v2";
import { RequestContext } from "@mastra/core/request-context";
import { mastra } from "@/lib/mastra";
import {
  getShareLinkSecret,
  type ShareLinkRejection,
  verifyShareLink,
} from "@/lib/share-links";
import { loadLocalTutorById } from "@/lib/tutors/local-catalog";

// Human-readable rejection texts: a 403 can surface mid-session in the chat's
// error UI (e.g. when the window closes while the student is typing), so the
// message should explain, not just name a reason code.
const REJECTION_MESSAGES: Record<ShareLinkRejection, string> = {
  "missing-params": "The chat requires a tutor share link.",
  "invalid-signature": "The tutor share link is invalid.",
  "not-started": "This tutor's availability window has not started yet.",
  expired: "This tutor's availability window has ended.",
};

// The chat backend. Two server-side checks gate every runtime request — the
// frontend already performed both, but headers are client-controlled, so they
// are re-verified here where they actually matter:
//
//  1. AUTHENTICATION — a valid session is required. The signed-in user's
//     stable id becomes the Mastra memory `resourceId`, so every user gets
//     their own thread/message storage.
//  2. SHARE LINK — the tutor URL only counts when it arrives with the teacher's
//     HMAC signature and the current time is inside the signed window. Checked
//     on EVERY request, so an open chat stops accepting messages once the
//     window closes.
//
// The verified tutor URL is handed to the `tutor` agent via RequestContext,
// where its dynamic `instructions`/`model` resolvers read it. (Headers — not a
// query string — because CopilotKit appends sub-paths like `/info` to the
// runtime URL, which a query string would corrupt.) The runtime is built per
// request; the heavy work (fetch + assemble the YAML) is memoized inside the
// tutor agent, so this stays cheap.
async function handler(req: Request): Promise<Response> {
  // MVP: Use mock session from cookie. In production, this would use NextAuth.
  const cookieHeader = req.headers.get("cookie");
  const sessionCookie = cookieHeader
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("novedu-mock-session="));
  const sessionValue = sessionCookie?.split("=")[1];

  // For MVP, we'll use a mock user ID. In production, this would come from the session.
  const resourceId = sessionValue ? `mock-${sessionValue}` : "mock-student";

  const requestContext = new RequestContext();
  const tutorUrl = req.headers.get("x-tutor-url");
  const shareSig = req.headers.get("x-share-sig");
  const demoTutorId = req.headers.get("x-demo-tutor-id");
  const localTutorId = req.headers.get("x-local-tutor-id");
  const scchModel = req.headers.get("x-scch-model");

  if (tutorUrl || shareSig) {
    const verification = verifyShareLink(
      {
        tutor: tutorUrl ?? undefined,
        start: req.headers.get("x-share-start") ?? undefined,
        end: req.headers.get("x-share-end") ?? undefined,
        sig: shareSig ?? undefined,
      },
      getShareLinkSecret(),
      Math.floor(Date.now() / 1000),
    );
    if (!verification.ok) {
      return Response.json(
        { error: REJECTION_MESSAGES[verification.reason] },
        { status: 403 },
      );
    }
    requestContext.set("tutor-url", verification.tutor);
  } else if (localTutorId || demoTutorId) {
    const tutorId = localTutorId ?? demoTutorId;
    const result = await loadLocalTutorById(tutorId ?? "");
    if (!result.ok) {
      return Response.json({ error: "Unknown tutor." }, { status: 404 });
    }
    requestContext.set("tutor-config", {
      model: result.model,
      prompt: result.prompt,
    });
  } else if (scchModel) {
    requestContext.set("scch-model", scchModel);
  } else {
    return Response.json(
      { error: "Choose an SCCH model or tutor configuration first." },
      { status: 400 },
    );
  }

  const runtime = new CopilotRuntime({
    // @ts-expect-error - @ag-ui/mastra's AbstractAgent type does not line up with
    // the runtime's expected agent type in this beta. Known upstream issue.
    agents: MastraAgent.getLocalAgents({ mastra, resourceId, requestContext }),
  });

  // createCopilotEndpoint returns a Hono app whose `.fetch` is a standard
  // (Request) => Response handler. Mounted on an optional catch-all route so it
  // serves both the base path and sub-routes like `/info`.
  const app = createCopilotEndpoint({ runtime, basePath: "/api/copilotkit" });
  return app.fetch(req);
}

export const GET = handler;
export const POST = handler;
export const OPTIONS = handler;

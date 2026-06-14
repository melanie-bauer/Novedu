import { describe, expect, it } from "vitest";
import {
  getEvidenceRegistrationError,
  serializeHarnessState,
} from "../../scripts/harness/state-machine";

describe("harness state machine", () => {
  const state = {
    evidence: {
      after: [],
      before: [],
      checks: [],
    },
    stage: "verify" as const,
  };

  it("serializes state with CRLF on Windows", () => {
    expect(serializeHarnessState(state, "win32")).toContain("\r\n");
  });

  it("serializes state with LF on non-Windows platforms", () => {
    expect(serializeHarnessState(state, "linux")).toContain("\n");
    expect(serializeHarnessState(state, "linux")).not.toContain("\r\n");
  });

  it("keeps evidence arrays compact for Biome formatting", () => {
    expect(
      serializeHarnessState(
        {
          evidence: {
            after: ["evidence/after/login-entra.png"],
            before: [],
            checks: [],
          },
          stage: "close",
        },
        "linux",
      ),
    ).toContain('"after": ["evidence/after/login-entra.png"]');
  });

  it("allows before evidence only during reproduce", () => {
    expect(
      getEvidenceRegistrationError(
        "before",
        "evidence/before/login-before.webm",
        "reproduce",
      ),
    ).toBeNull();
    expect(
      getEvidenceRegistrationError(
        "before",
        "evidence/before/login-before.webm",
        "verify",
      ),
    ).toContain("before evidence can only be registered during reproduce");
  });

  it("allows after evidence only during verify", () => {
    expect(
      getEvidenceRegistrationError(
        "after",
        "evidence/after/login-after.webm",
        "verify",
      ),
    ).toBeNull();
    expect(
      getEvidenceRegistrationError(
        "after",
        "evidence/after/login-after.webm",
        "reproduce",
      ),
    ).toContain("after evidence can only be registered during verify");
  });

  it("requires matching evidence folders", () => {
    expect(
      getEvidenceRegistrationError(
        "before",
        "evidence/after/login-before.webm",
        "reproduce",
      ),
    ).toContain("before evidence must live under evidence/before/");
  });

  it("requires videos for before and after UI evidence", () => {
    expect(
      getEvidenceRegistrationError(
        "after",
        "evidence/after/login-entra.png",
        "verify",
      ),
    ).toContain("before/after UI evidence must be a .webm video");
  });
});

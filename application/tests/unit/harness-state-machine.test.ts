import { describe, expect, it } from "vitest";
import { serializeHarnessState } from "../../scripts/harness/state-machine";

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
});

import { describe, expect, it } from "vitest";
import {
  createChildProcessEnv,
  createE2eServerEnv,
} from "../../scripts/run-e2e";

describe("E2E runner process environment", () => {
  it("deduplicates Windows PATH keys before spawning child processes", () => {
    const env = createChildProcessEnv(
      {
        Path: "C:\\Windows",
        PATH: "C:\\Node",
        FOO: "bar",
      },
      "win32",
    );

    expect(
      Object.keys(env).filter((key) => key.toLowerCase() === "path"),
    ).toEqual(["Path"]);
    expect(env.Path).toBe("C:\\Windows");
    expect(env.FOO).toBe("bar");
  });

  it("leaves non-Windows environment keys unchanged", () => {
    const env = createChildProcessEnv(
      {
        PATH: "/usr/bin",
        FOO: "bar",
      },
      "linux",
    );

    expect(env).toEqual({ PATH: "/usr/bin", FOO: "bar" });
  });

  it("provides a deterministic share-link secret for the test server", () => {
    const env = createE2eServerEnv({ PATH: "/usr/bin" }, "linux");

    expect(env.SHARE_LINK_SECRET).toBe("dev-secret-local");
  });

  it("does not overwrite an explicitly configured share-link secret", () => {
    const env = createE2eServerEnv(
      {
        PATH: "/usr/bin",
        SHARE_LINK_SECRET: "configured",
      },
      "linux",
    );

    expect(env.SHARE_LINK_SECRET).toBe("configured");
  });
});

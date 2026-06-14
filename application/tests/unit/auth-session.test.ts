import { describe, expect, it } from "vitest";
import { buildAuthOptions } from "@/features/auth/auth-options";
import {
  deriveRoleFromClaims,
  getMockSessionFromCookie,
  getNoveduSessionFromAuthSession,
  getPostLoginPath,
} from "@/features/auth/session";

describe("auth session helpers", () => {
  it("maps Entra role claims to Novedu roles", () => {
    expect(deriveRoleFromClaims({ roles: ["novedu.admin"] })).toBe("admin");
    expect(deriveRoleFromClaims({ roles: ["novedu.teacher"] })).toBe("teacher");
    expect(deriveRoleFromClaims({ roles: [] })).toBe("student");
  });

  it("creates explicit test sessions from mock cookies", () => {
    const session = getMockSessionFromCookie("teacher");

    expect(session?.user.role).toBe("teacher");
    expect(session ? getPostLoginPath(session) : null).toBe("/chat");
  });

  it("builds Auth.js options for Microsoft Entra ID when env is configured", () => {
    const options = buildAuthOptions({
      AUTH_MICROSOFT_ENTRA_ID_ID: "client-id",
      AUTH_MICROSOFT_ENTRA_ID_SECRET: "client-secret",
      AUTH_MICROSOFT_ENTRA_ID_TENANT_ID: "tenant-id",
      AUTH_SECRET: "auth-secret",
    });

    expect(options.secret).toBe("auth-secret");
    expect(options.pages?.signIn).toBe("/login");
    expect(options.providers).toHaveLength(1);
    expect(options.providers[0].id).toBe("azure-ad");
  });

  it("keeps Auth.js provider disabled until all Entra env vars exist", () => {
    const options = buildAuthOptions({
      AUTH_MICROSOFT_ENTRA_ID_ID: "client-id",
      AUTH_SECRET: "auth-secret",
    });

    expect(options.providers).toEqual([]);
  });

  it("normalizes Auth.js sessions into Novedu sessions", () => {
    const session = getNoveduSessionFromAuthSession({
      user: {
        email: "student@school.example",
        id: "entra-user",
        name: "Student One",
        role: "student",
      },
    });

    expect(session).toEqual({
      user: {
        classIds: [],
        email: "student@school.example",
        id: "entra-user",
        name: "Student One",
        role: "student",
      },
    });
  });
});

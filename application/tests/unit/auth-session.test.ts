import { describe, expect, it } from "vitest";
import {
  deriveRoleFromClaims,
  getMockSessionFromCookie,
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
});

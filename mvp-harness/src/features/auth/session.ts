export type NoveduRole = "student" | "teacher" | "admin";

export type NoveduSession = {
  user: {
    id: string;
    email: string;
    name: string;
    role: NoveduRole;
    classIds: string[];
  };
};

export function deriveRoleFromClaims(claims: {
  roles?: string[];
  groups?: string[];
  email?: string;
}): NoveduRole {
  const roles = new Set((claims.roles ?? []).map((role) => role.toLowerCase()));

  if (roles.has("novedu.admin")) {
    return "admin";
  }

  if (roles.has("novedu.teacher")) {
    return "teacher";
  }

  return "student";
}

export function getMockSessionFromCookie(
  value: string | undefined,
): NoveduSession | null {
  if (!value) {
    return null;
  }

  const role = value === "admin" || value === "teacher" ? value : "student";

  return {
    user: {
      id: `mock-${role}`,
      email: `${role}@school.example`,
      name: `Mock ${role}`,
      role,
      classIds: role === "student" ? ["4AHIF"] : [],
    },
  };
}

export function getPostLoginPath(session: NoveduSession): string {
  return session.user.role === "admin" ? "/admin" : "/chat";
}

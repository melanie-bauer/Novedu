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

type AuthSessionLike = {
  user?: {
    classIds?: string[] | null;
    email?: string | null;
    id?: string | null;
    name?: string | null;
    role?: NoveduRole | null;
  } | null;
} | null;

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

export function getNoveduSessionFromAuthSession(
  session: AuthSessionLike,
): NoveduSession | null {
  const user = session?.user;

  if (!user?.email) {
    return null;
  }

  return {
    user: {
      id: user.id || user.email,
      email: user.email,
      name: user.name || user.email,
      role: user.role ?? "student",
      classIds: user.classIds ?? [],
    },
  };
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

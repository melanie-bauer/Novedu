import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";
import {
  getMockSessionFromCookie,
  getNoveduSessionFromAuthSession,
  type NoveduSession,
} from "./session";

export async function getCurrentNoveduSession(): Promise<NoveduSession | null> {
  const cookieStore = await cookies();
  const mockSession = getMockSessionFromCookie(
    cookieStore.get("novedu-mock-session")?.value,
  );

  if (mockSession) {
    return mockSession;
  }

  return getNoveduSessionFromAuthSession(await getServerSession(authOptions));
}

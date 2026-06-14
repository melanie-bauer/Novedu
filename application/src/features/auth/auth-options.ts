import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { deriveRoleFromClaims } from "./session";

type EntraProfile = {
  email?: string;
  name?: string;
  oid?: string;
  preferred_username?: string;
  roles?: string[];
  sub?: string;
};

type NoveduTokenUser = {
  classIds: string[];
  email: string;
  id: string;
  name: string;
  role: ReturnType<typeof deriveRoleFromClaims>;
};

type AuthEnv = Record<string, string | undefined>;

export function buildAuthOptions(env: AuthEnv = process.env): NextAuthOptions {
  const clientId = env.AUTH_MICROSOFT_ENTRA_ID_ID;
  const clientSecret = env.AUTH_MICROSOFT_ENTRA_ID_SECRET;
  const tenantId = env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID;

  return {
    callbacks: {
      jwt({ profile, token }) {
        if (profile) {
          const entraProfile = profile as EntraProfile;
          const email = entraProfile.email ?? entraProfile.preferred_username;

          if (email) {
            (token as { noveduUser?: NoveduTokenUser }).noveduUser = {
              classIds: [],
              email,
              id: entraProfile.oid ?? entraProfile.sub ?? email,
              name: entraProfile.name ?? email,
              role: deriveRoleFromClaims({ roles: entraProfile.roles }),
            };
          }
        }

        return token;
      },
      session({ session, token }) {
        const noveduUser = (token as { noveduUser?: NoveduTokenUser })
          .noveduUser;

        if (noveduUser) {
          session.user = noveduUser;
        }

        return session;
      },
    },
    pages: {
      signIn: "/login",
    },
    session: {
      strategy: "jwt",
    },
    secret: env.AUTH_SECRET,
    providers:
      clientId && clientSecret && tenantId
        ? [
            AzureADProvider({
              clientId,
              clientSecret,
              tenantId,
            }),
          ]
        : [],
  };
}

export const authOptions = buildAuthOptions();

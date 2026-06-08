import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export function buildAuthOptions(
  env: NodeJS.ProcessEnv = process.env,
): NextAuthOptions {
  const clientId = env.AUTH_MICROSOFT_ENTRA_ID_ID;
  const clientSecret = env.AUTH_MICROSOFT_ENTRA_ID_SECRET;
  const tenantId = env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID;

  return {
    session: {
      strategy: "jwt",
    },
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

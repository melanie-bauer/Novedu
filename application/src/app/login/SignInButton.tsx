"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function SignInButton({ callbackUrl }: { callbackUrl: string }) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className="button microsoft-button"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void signIn("azure-ad", { callbackUrl });
      }}
    >
      <span className="microsoft-mark" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      {pending
        ? "Weiterleitung zu Microsoft..."
        : "Mit Microsoft Entra ID anmelden"}
    </button>
  );
}

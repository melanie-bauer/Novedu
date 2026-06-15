"use client";

import type { ReactNode } from "react";

function LogOutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

async function handleSignOut() {
  // biome-ignore lint/suspicious/noDocumentCookie: test-only mock session cookie
  document.cookie = "novedu-mock-session=; path=/; max-age=0; SameSite=Lax";
  const { signOut } = await import("next-auth/react");
  await signOut({ callbackUrl: "/login" });
}

export function ChatTopBar({
  left,
  userLabel,
}: {
  left: ReactNode;
  userLabel?: string;
}) {
  return (
    <header className="gpt-topbar">
      <div className="gpt-topbar-left">{left}</div>
      {userLabel ? (
        <div className="gpt-topbar-user">
          <div className="gpt-topbar-user-row">
            <span className="gpt-topbar-avatar" aria-hidden="true">
              {userLabel.charAt(0).toUpperCase()}
            </span>
            <div className="gpt-topbar-email-wrap">
              <span className="gpt-topbar-email">{userLabel}</span>
              <button
                type="button"
                className="gpt-topbar-user-logout"
                onClick={() => {
                  void handleSignOut();
                }}
              >
                <LogOutIcon />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

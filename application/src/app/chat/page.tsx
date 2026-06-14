import { redirect } from "next/navigation";
import { getCurrentNoveduSession } from "@/features/auth/server-session";
import { ChatShell } from "@/features/chat/ChatShell";

export default async function ChatPage() {
  const session = await getCurrentNoveduSession();

  if (!session) {
    redirect("/login?callbackUrl=/chat");
  }

  return (
    <main className="page-shell page-shell--flush">
      <div className="session-pill" title="Signed in user">
        {session.user.email}
      </div>
      <div className="content-full">
        <ChatShell userId={session.user.id} />
      </div>
    </main>
  );
}

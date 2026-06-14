import { redirect } from "next/navigation";
import { getCurrentNoveduSession } from "@/features/auth/server-session";
import { ChatShell } from "@/features/chat/ChatShell";
import { buildDemoTutors, buildModelOptions } from "@/lib/chat-options";
import { scchModels } from "@/lib/mastra/scch";

export default async function ChatPage() {
  const session = await getCurrentNoveduSession();

  if (!session) {
    redirect("/login?callbackUrl=/chat");
  }

  const models = buildModelOptions(scchModels);
  const tutors = buildDemoTutors(scchModels);

  return (
    <main className="page-shell page-shell--flush">
      <div className="session-pill" title="Signed in user">
        {session.user.email}
      </div>
      <div className="content-full">
        <ChatShell models={models} tutors={tutors} userId={session.user.id} />
      </div>
    </main>
  );
}

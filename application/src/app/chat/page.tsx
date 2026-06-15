import { redirect } from "next/navigation";
import { getCurrentNoveduSession } from "@/features/auth/server-session";
import { ChatShell } from "@/features/chat/ChatShell";
import { buildModelOptions, buildTutorOptions } from "@/lib/chat-options";
import { scchModels } from "@/lib/mastra/scch";
import { listTutorSummaries } from "@/lib/tutors/catalog";

export default async function ChatPage() {
  const session = await getCurrentNoveduSession();

  if (!session) {
    redirect("/login?callbackUrl=/chat");
  }

  const models = buildModelOptions(scchModels);
  const tutors = buildTutorOptions(await listTutorSummaries());

  return (
    <ChatShell
      models={models}
      tutors={tutors}
      userId={session.user.id}
      userLabel={session.user.email}
    />
  );
}

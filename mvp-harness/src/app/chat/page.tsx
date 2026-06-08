import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMockSessionFromCookie } from "@/features/auth/session";
import { ChatShell } from "@/features/chat/ChatShell";

export default async function ChatPage() {
  const cookieStore = await cookies();
  const session = getMockSessionFromCookie(
    cookieStore.get("novedu-mock-session")?.value,
  );

  if (!session) {
    redirect("/login?callbackUrl=/chat");
  }

  return (
    <main className="page-shell">
      <nav className="topbar" aria-label="Main navigation">
        <div className="brand">
          <span className="brand-mark">N</span>
          <span>Novedu Chat</span>
        </div>
        <span>{session.user.email}</span>
      </nav>
      <div className="main-grid">
        <aside className="sidebar">
          <h2>Available tutor</h2>
          <p>Mathematics demo tutor</p>
          <p>Config source: GitHub adapter fixture</p>
        </aside>
        <section className="content">
          <ChatShell userId={session.user.id} />
        </section>
      </div>
    </main>
  );
}

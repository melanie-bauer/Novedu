import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <nav className="topbar" aria-label="Main navigation">
        <div className="brand">
          <span className="brand-mark">N</span>
          <span>Novedu</span>
        </div>
        <Link className="button secondary" href="/chat">
          Chat
        </Link>
      </nav>
      <section className="hero">
        <div className="hero-inner">
          <h1>Novedu MVP Harness</h1>
          <p>
            A small, testable NextJS baseline for secure Entra login, AG-UI chat
            streaming, provider-independent agent runtime boundaries, and
            GitHub-backed tutor configuration.
          </p>
          <Link className="button" href="/chat">
            Open chat harness
          </Link>
        </div>
      </section>
    </main>
  );
}

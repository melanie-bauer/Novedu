import Link from "next/link";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  void searchParams;

  return (
    <main className="page-shell">
      <nav className="topbar" aria-label="Main navigation">
        <div className="brand">
          <span className="brand-mark">N</span>
          <span>Novedu</span>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-inner">
          <h1>Sign in with Microsoft Entra ID</h1>
          <p>
            The MVP harness keeps local passwords out of scope. The production
            path is Auth.js with Microsoft Entra ID; tests use an explicit mock
            session cookie.
          </p>
          <Link className="button" href="/">
            Back to overview
          </Link>
        </div>
      </section>
    </main>
  );
}

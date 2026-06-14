import Link from "next/link";

function safeCallbackUrl(value: string | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return "/chat";
  }

  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const callbackUrl = safeCallbackUrl(params.callbackUrl);
  const signInHref = `/api/auth/signin/azure-ad?callbackUrl=${encodeURIComponent(
    callbackUrl,
  )}`;

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
          <Link className="button" href={signInHref}>
            Continue with Microsoft
          </Link>
          <Link className="button secondary" href="/">
            Back to overview
          </Link>
        </div>
      </section>
    </main>
  );
}

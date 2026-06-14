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
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="brand-mark brand-mark-large">N</span>
          <div>
            <h1 id="login-title">Novedu</h1>
            <p>Anmeldung mit Schulaccount</p>
          </div>
        </div>

        <div className="login-copy">
          <h2>Willkommen zuruck</h2>
          <p>
            Melde dich mit deinem Microsoft Entra ID Konto an. Lokale
            Passwoerter bleiben im MVP bewusst ausserhalb der Anwendung.
          </p>
        </div>

        <Link className="button microsoft-button" href={signInHref}>
          <span className="microsoft-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          Mit Microsoft Entra ID anmelden
        </Link>

        <div className="login-note" role="note">
          <strong>Geschutzter Zugriff</strong>
          <span>
            Nach der Anmeldung prueft die App serverseitig deine Session und
            bringt dich zur angefragten Seite zuruck.
          </span>
        </div>

        <div className="login-links">
          <Link href="/">Zur Share-Link-Seite</Link>
          <span aria-hidden="true">/</span>
          <Link href="/chat">Chat-Demo</Link>
        </div>
      </section>
    </main>
  );
}

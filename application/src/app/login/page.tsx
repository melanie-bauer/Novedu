import { SignInButton } from "./SignInButton";

function safeCallbackUrl(value: string | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return "/chat";
  }

  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const callbackUrl = safeCallbackUrl(params.callbackUrl);
  const authError = params.error;

  return (
    <main className="login-page login-page-minimal">
      <section
        className="login-card login-card-minimal"
        aria-labelledby="login-title"
      >
        <h1 id="login-title" className="login-title-minimal">
          Login
        </h1>

        {authError ? (
          <div className="login-error" role="alert">
            <strong>Anmeldung fehlgeschlagen</strong>
            <span>Bitte versuche es erneut.</span>
          </div>
        ) : null}

        <SignInButton callbackUrl={callbackUrl} />
      </section>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

function getLoginErrorMessage(error?: string): string | null {
  if (!error) return null;
  if (error === "google") {
    return "Google sign-in failed. Verify AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET and the Google redirect URI.";
  }
  return `Sign-in failed (${error}).`;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const error = params?.error;
  const errorMessage = getLoginErrorMessage(error);
  const hasGoogle = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  const hasGitHub = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-[0.03em]">Sign in to ChartFlow</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Quick YOLO login for market scouting and watchlists.</p>
        </header>

        {errorMessage ? (
          <p className="mb-4 rounded-md border border-red-400/25 bg-red-400/10 px-3 py-2 text-xs text-red-300">
            {errorMessage}
          </p>
        ) : null}

        <div className="space-y-3">
          {hasGoogle ? (
            <Link
              href="/api/auth/signin/google?callbackUrl=/"
              className="block w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-medium hover:bg-white/10"
            >
              Continue with Google
            </Link>
          ) : null}
          {hasGitHub ? (
            <Link
              href="/api/auth/signin/github?callbackUrl=/"
              className="block w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-medium hover:bg-white/10"
            >
              Continue with GitHub
            </Link>
          ) : null}
          {!hasGoogle && !hasGitHub ? (
            <p className="rounded-md border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs text-amber-200">
              No auth providers are configured. Add provider keys in `.env.local`.
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-xs text-[var(--text-muted)]">
          By signing in, you agree to your app terms. <Link className="text-[var(--accent)]" href="/">Back to app</Link>
        </p>
      </section>
    </main>
  );
}

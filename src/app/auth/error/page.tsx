import Link from "next/link";

const messages: Record<string, string> = {
  GOOGLE_OAUTH_NOT_CONFIGURED:
    "Google OAuth is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
  OAUTH_STATE_INVALID:
    "The Google sign-in state expired. Start again from the landing page.",
  INSUFFICIENT_SCOPES:
    "Gmail did not grant enough access to create reversible labels and filters.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  const code = params.code || "AUTH_ERROR";
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-10 sm:px-8">
      <Link href="/" className="text-sm font-semibold text-[#7b3f00]">
        InboxExorcist
      </Link>
      <div className="mt-6 rounded-lg border border-[#d8d1bd] bg-white p-6">
        <p className="font-mono text-sm text-[#7b3f00]">{code}</p>
        <h1 className="mt-3 text-3xl font-semibold">Gmail connection paused.</h1>
        <p className="mt-3 leading-7 text-[#4d473b]">
          {messages[code] ||
            "Google OAuth did not complete. No inbox action was taken."}
        </p>
        <Link
          href="/api/auth/google/start"
          className="mt-5 inline-flex h-11 items-center rounded-md bg-[#17150f] px-4 font-semibold text-white"
        >
          Try connecting again
        </Link>
      </div>
    </main>
  );
}

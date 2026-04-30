import { NextRequest, NextResponse } from "next/server";

import { buildGoogleOAuthUrl, revokeGoogleToken } from "@/lib/gmail/oauth";
import { requireUserId } from "@/lib/auth/connection";
import { createOauthStateCookie } from "@/lib/security/session";
import { getStore } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const store = getStore();
    const connection = await store.getConnection(userId);

    if (connection && connection.status !== "disconnected") {
      try {
        await revokeGoogleToken(connection);
      } catch {
        // Token revocation best-effort; proceed with upgrade flow
      }
    }

    const state = await createOauthStateCookie();
    const includeSend = request.nextUrl.searchParams.get("includeSend") === "true";
    return NextResponse.redirect(buildGoogleOAuthUrl(state, { incremental: false, includeSend }));
  } catch (error) {
    const code =
      error instanceof Error && "code" in error
        ? String((error as Error & { code?: string }).code)
        : "GOOGLE_OAUTH_NOT_CONFIGURED";
    return NextResponse.redirect(
      new URL(`/auth/error?code=${encodeURIComponent(code)}`, request.url),
    );
  }
}

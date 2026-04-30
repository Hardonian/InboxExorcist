import { NextRequest, NextResponse } from "next/server";

import {
  buildConnectionFromTokens,
  exchangeGoogleCode,
} from "@/lib/gmail/oauth";
import { newId } from "@/lib/ids";
import { setSessionUserId, verifyOauthState } from "@/lib/security/session";
import { getStore } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const appUrl = request.nextUrl.origin;
  const error = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/error?code=${encodeURIComponent(error)}`, appUrl),
    );
  }

  if (!code || !(await verifyOauthState(state))) {
    return NextResponse.redirect(new URL("/auth/error?code=OAUTH_STATE_INVALID", appUrl));
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    const userId = newId("user");
    const connection = await buildConnectionFromTokens({ userId, tokens });
    const store = getStore();
    await store.upsertUser(userId);
    await store.saveConnection(connection);
    await setSessionUserId(userId);

    if (connection.status === "insufficient_scopes") {
      return NextResponse.redirect(
        new URL("/auth/error?code=INSUFFICIENT_SCOPES", appUrl),
      );
    }

    if (connection.status === "scan_only") {
      return NextResponse.redirect(new URL("/scan?connected=1&incremental=1", appUrl));
    }

    return NextResponse.redirect(new URL("/scan?connected=1", appUrl));
  } catch (callbackError) {
    const code =
      callbackError instanceof Error && "code" in callbackError
        ? String((callbackError as Error & { code?: string }).code)
        : "GOOGLE_CALLBACK_FAILED";
    return NextResponse.redirect(
      new URL(`/auth/error?code=${encodeURIComponent(code)}`, appUrl),
    );
  }
}

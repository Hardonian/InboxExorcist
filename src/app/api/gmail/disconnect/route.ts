import { handleApiError, buildSharedResponse } from "@/lib/api";
import { requireUserId } from "@/lib/auth/connection";
import { revokeGoogleToken } from "@/lib/gmail/oauth";
import { getStore } from "@/lib/storage";
import { emitDisconnectClicked, emitDisconnectFailed } from "@/lib/diagnostics";

export const runtime = "nodejs";

export async function POST() {
  try {
    const userId = await requireUserId();
    const store = getStore();
    const connection = await store.getConnection(userId);
    let revokeFailed = false;
    if (connection) {
      try {
        await revokeGoogleToken(connection);
      } catch {
        revokeFailed = true;
        emitDisconnectFailed(userId, "Token revocation failed");
      }
    }
    await store.deleteConnection(userId);
    emitDisconnectClicked(userId);

    return buildSharedResponse({
      disconnected: true,
      revokeFailed,
    }, {
      degraded: revokeFailed,
      resultId: `disconnect_${userId}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

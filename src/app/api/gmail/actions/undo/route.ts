import { handleApiError, readJsonBody, buildSharedResponse } from "@/lib/api";
import { requireGmailClient } from "@/lib/auth/connection";
import { undoActions } from "@/lib/services/undo";
import { getStore } from "@/lib/storage";
import { emitUndoStarted, emitUndoCompleted, emitUndoPartial } from "@/lib/diagnostics";

export const runtime = "nodejs";

type UndoRequest = {
  actionIds?: string[];
};

export async function POST(request: Request) {
  try {
    const body = await readJsonBody<UndoRequest>(request);
    const store = getStore();
    const { userId, gmail } = await requireGmailClient(store);

    const actions = await store.listActions(userId);
    const selectedCount = body.actionIds?.length
      ? actions.filter((a) => body.actionIds!.includes(a.id)).length
      : Math.min(actions.filter((a) => a.reversible).length, 25);

    emitUndoStarted(userId, selectedCount);

    const result = await undoActions({
      userId,
      actionIds: body.actionIds,
      gmail,
      store,
    });

    if (result.failures.length > 0) {
      emitUndoPartial(userId, result.failures);
    } else {
      emitUndoCompleted(userId, result.removedFilters);
    }

    return buildSharedResponse({
      removedFilters: result.removedFilters,
      failures: result.failures,
      undoAvailable: result.failures.length === 0 ? false : true,
    }, {
      degraded: result.failures.length > 0,
      score: result.failures.length === 0 ? 100 : 50,
      reasons: result.failures.map((f) => `Filter removal failed for ${f}`),
      resultId: `undo_${Date.now()}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { handleApiError } from "@/lib/api";
import { buildSharedResponse } from "@/lib/api";
import { requireUserId } from "@/lib/auth/connection";
import { AppError } from "@/lib/errors";
import { getStore } from "@/lib/storage";
import { emitPreviewViewed } from "@/lib/diagnostics";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const userId = await requireUserId();
    const store = getStore();
    const scan = await store.getScanRun(id, userId);
    if (!scan) {
      throw new AppError({
        code: "SCAN_NOT_FOUND",
        message: "That scan was not found for this user.",
        status: 404,
      });
    }
    const candidates = await store.listCandidates(id, userId);

    emitPreviewViewed(userId, id);

    const noisySenders = candidates.filter(
      (c) => c.proposedAction === "QUIET_BY_FILTER" || c.proposedAction === "UNSUBSCRIBE_THEN_FILTER",
    );
    const reviewSenders = candidates.filter(
      (c) => c.proposedAction === "REVIEW",
    );
    const protectedSenders = candidates.filter(
      (c) => c.proposedAction === "SKIP" && c.protectedReason,
    );

    return buildSharedResponse({
      noisySenders,
      reviewSenders,
      protectedSenders,
      scanId: scan.id,
      status: scan.status,
      messageCount: scan.messageCount,
      candidateCount: scan.candidateCount,
      selectedCount: scan.selectedCount,
      skippedCount: scan.skippedCount,
    }, {
      degraded: scan.degraded,
      score: candidates.reduce((sum, c) => sum + c.score, 0) / Math.max(1, candidates.length),
      reasons: candidates.flatMap((c) => c.reasons),
      resultId: scan.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

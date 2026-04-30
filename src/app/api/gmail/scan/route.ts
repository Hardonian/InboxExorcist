import { AppError } from "@/lib/errors";
import { handleApiError, readJsonBody, buildSharedResponse } from "@/lib/api";
import { requireGmailClient } from "@/lib/auth/connection";
import { runScan } from "@/lib/services/scan";
import { getStore } from "@/lib/storage";
import { emitPreviewViewed } from "@/lib/diagnostics";
import { hashValue } from "@inbox-exorcist/shared-core/hashing";

export const runtime = "nodejs";

type ScanRequest = {
  maxMessages?: number;
  query?: string;
};

export async function POST(request: Request) {
  try {
    const body = await readJsonBody<ScanRequest>(request);
    const maxMessages = body.maxMessages ?? 250;
    if (!Number.isInteger(maxMessages) || maxMessages < 10 || maxMessages > 500) {
      throw new AppError({
        code: "INVALID_SCAN_LIMIT",
        message: "Scan limit must be between 10 and 500 messages.",
        status: 400,
      });
    }

    const store = getStore();
    const { userId, gmail } = await requireGmailClient(store);
    const scan = await runScan({
      userId,
      gmail,
      store,
      query: body.query,
      maxMessages,
    });

    emitPreviewViewed(userId, scan.id);
    hashValue(userId);
    hashValue(userId);

    const noisySenders = scan.candidates.filter(
      (c) => c.proposedAction === "QUIET_BY_FILTER" || c.proposedAction === "UNSUBSCRIBE_THEN_FILTER",
    );
    const reviewSenders = scan.candidates.filter(
      (c) => c.proposedAction === "REVIEW",
    );
    const protectedSenders = scan.candidates.filter(
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
      score: scan.candidates.reduce((sum, c) => sum + c.score, 0) / Math.max(1, scan.candidates.length),
      reasons: scan.candidates.flatMap((c) => c.reasons),
      resultId: scan.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

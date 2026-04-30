import { handleApiError, readJsonBody, buildSharedResponse } from "@/lib/api";
import { requireGmailClient } from "@/lib/auth/connection";
import { AppError } from "@/lib/errors";
import { quietSenders } from "@/lib/services/quiet";
import { getStore } from "@/lib/storage";
import { emitQuietStarted, emitQuietCompleted, emitQuietPartial } from "@/lib/diagnostics";
import { hashValue } from "@inbox-exorcist/shared-core/hashing";

export const runtime = "nodejs";

type QuietRequest = {
  scanId?: string;
  candidateIds?: string[];
  allowHttpsUnsubscribe?: boolean;
  allowMailtoUnsubscribe?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = await readJsonBody<QuietRequest>(request);
    if (!body.scanId) {
      throw new AppError({
        code: "SCAN_ID_REQUIRED",
        message: "A scan id is required to quiet senders.",
        status: 400,
      });
    }
    const store = getStore();
    const { userId, gmail, connection } = await requireGmailClient(store);

    const candidates = await store.listCandidates(body.scanId, userId);
    emitQuietStarted(userId, body.scanId, body.candidateIds?.length ?? candidates.length);

    const summary = await quietSenders({
      userId,
      scanRunId: body.scanId,
      candidateIds: body.candidateIds,
      gmail,
      store,
      grantedScopes: connection.scopes,
      allowHttpsUnsubscribe: body.allowHttpsUnsubscribe ?? true,
      allowMailtoUnsubscribe: body.allowMailtoUnsubscribe ?? false,
    });

    if (summary.failedFilters > 0) {
      emitQuietPartial(userId, body.scanId, `${summary.failedFilters} filters failed`);
    } else {
      emitQuietCompleted(userId, body.scanId, summary.quietedSenders);
    }

    const userIdHash = hashValue(userId);
    return buildSharedResponse({
      quietedSenders: summary.quietedSenders,
      messagesArchivedOrLabeled: summary.messagesArchivedOrLabeled,
      filtersCreated: summary.filtersCreated,
      unsubscribeAttempts: summary.unsubscribeAttemptsSent,
      skippedForSafety: summary.skippedForSafety,
      failedFilters: summary.failedFilters,
      warnings: summary.warnings,
      undoAvailable: true,
    }, {
      degraded: summary.warnings.length > 0,
      score: 100,
      reasons: summary.warnings.map((w) => w.message),
      resultId: `quiet_${body.scanId}`,
      diagnosticsId: userIdHash,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

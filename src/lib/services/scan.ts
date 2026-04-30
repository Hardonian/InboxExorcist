import { classifySender, type SenderEvidence } from "../classification/classifier.ts";
import type { ScanRunWithCandidates, SenderCandidate } from "../domain.ts";
import { AppError } from "../errors.ts";
import { getHeader, parseSender, extractUnsubscribeMethods } from "../gmail/headers.ts";
import type { GmailClient, GmailMessageHeader } from "../gmail/client.ts";
import { encryptSecret } from "../security/crypto.ts";
import { hashPii } from "../security/hash.ts";
import type { AppStore } from "../storage/store.ts";
import { newId, nowIso } from "../ids.ts";
import { emitScanStarted, emitScanCompleted, emitPartialScan } from "../diagnostics.ts";
import { costTracker, trackGmailApiCall, trackRetry } from "../scan-cache.ts";

export const defaultScanQuery =
  "newer_than:90d (category:promotions OR list:* OR unsubscribe) -from:me";

type SenderAggregate = SenderEvidence & {
  messageIds: string[];
};

function aggregateMessages(
  messages: GmailMessageHeader[],
  allowlistedDomains: string[],
) {
  const grouped = new Map<string, SenderAggregate>();

  for (const message of messages) {
    const sender =
      parseSender(getHeader(message.headers, "From")) ||
      parseSender(getHeader(message.headers, "Sender"));
    if (!sender) continue;

    const listUnsubscribe = getHeader(message.headers, "List-Unsubscribe");
    const listUnsubscribePost = getHeader(message.headers, "List-Unsubscribe-Post");
    const listId = getHeader(message.headers, "List-ID");
    const precedence = getHeader(message.headers, "Precedence");
    const autoSubmitted = getHeader(message.headers, "Auto-Submitted");
    const xMailer = getHeader(message.headers, "X-Mailer");
    const subject = getHeader(message.headers, "Subject");
    const key = sender.domain;
    const existing = grouped.get(key);
    const unsubscribeMethods = extractUnsubscribeMethods(listUnsubscribe);
    const hasOneClick = /List-Unsubscribe=One-Click/i.test(listUnsubscribePost || "");

    if (existing) {
      existing.messageCount += 1;
      existing.messageIds.push(message.id);
      existing.hasListUnsubscribe =
        existing.hasListUnsubscribe || Boolean(listUnsubscribe);
      existing.hasOneClickUnsubscribe = existing.hasOneClickUnsubscribe || hasOneClick;
      existing.bulkHeaders =
        existing.bulkHeaders ||
        Boolean(listId || /bulk|list|auto/i.test(`${precedence} ${autoSubmitted}`));
      existing.unsubscribeMethods = [
        ...new Set([...existing.unsubscribeMethods, ...unsubscribeMethods]),
      ];
      existing.labelIds = [...new Set([...existing.labelIds, ...message.labelIds])];
      if (subject) existing.subjectHints?.push(subject);
      if (xMailer && !existing.xMailer) existing.xMailer = xMailer;
      continue;
    }

    grouped.set(key, {
      senderDomain: sender.domain,
      senderEmail: sender.email,
      senderDisplayName: sender.displayName,
      messageCount: 1,
      hasListUnsubscribe: Boolean(listUnsubscribe),
      hasOneClickUnsubscribe: hasOneClick,
      unsubscribeMethods,
      bulkHeaders: Boolean(
        listId || /bulk|list|auto/i.test(`${precedence} ${autoSubmitted}`),
      ),
      precedenceHeader: precedence,
      autoSubmittedHeader: autoSubmitted,
      xMailer,
      labelIds: message.labelIds,
      subjectHints: subject ? [subject] : [],
      allowlistedDomains,
      messageIds: [message.id],
    });
  }

  return [...grouped.values()];
}

export async function runScan({
  userId,
  gmail,
  store,
  query = defaultScanQuery,
  maxMessages = 250,
}: {
  userId: string;
  gmail: GmailClient;
  store: AppStore;
  query?: string;
  maxMessages?: number;
}): Promise<ScanRunWithCandidates> {
  const startedAt = nowIso();
  const scanRun = {
    id: newId("scan"),
    userId,
    status: "running" as const,
    query,
    messageCount: 0,
    candidateCount: 0,
    selectedCount: 0,
    skippedCount: 0,
    degraded: false,
    startedAt,
  };
  await store.createScanRun(scanRun);

  emitScanStarted(userId, scanRun.id);

  try {
    const allowlist = await store.listAllowlist(userId);

    const startTime = Date.now();
    const messages = await gmail.listRecentMessageHeaders({ query, maxMessages });
    const elapsed = Date.now() - startTime;

    trackGmailApiCall("messages_list");
    trackRetry("messages_list", 0, elapsed, true);

    const aggregates = aggregateMessages(messages, allowlist);
    const createdAt = nowIso();

    const candidates: SenderCandidate[] = aggregates.map((aggregate) => {
      const result = classifySender(aggregate);
      return {
        id: newId("sender"),
        scanRunId: scanRun.id,
        userId,
        senderDomain: aggregate.senderDomain,
        senderEmailHash: aggregate.senderEmail
          ? hashPii(aggregate.senderEmail)
          : undefined,
        senderDisplayNameEncrypted: aggregate.senderDisplayName
          ? encryptSecret(aggregate.senderDisplayName)
          : undefined,
        senderDisplayName: aggregate.senderDisplayName,
        classification: result.classification,
        score: result.score,
        reasons: result.reasons,
        messageCount: aggregate.messageCount,
        proposedAction: result.proposedAction,
        selectedByDefault: result.selectedByDefault,
        unsubscribeMethods: aggregate.unsubscribeMethods,
        protectedReason: result.protectedReason,
        createdAt,
      };
    });

    await store.saveCandidates(candidates);

    costTracker.recordScanSize(
      messages.length * 256,
      candidates.length,
    );

    const completed = {
      ...scanRun,
      status: "completed" as const,
      messageCount: messages.length,
      candidateCount: candidates.length,
      selectedCount: candidates.filter((candidate) => candidate.selectedByDefault)
        .length,
      skippedCount: candidates.filter((candidate) => candidate.proposedAction === "SKIP")
        .length,
      finishedAt: nowIso(),
    };
    await store.updateScanRun(completed);

    emitScanCompleted(userId, scanRun.id, candidates.length);

    return { ...completed, candidates };
  } catch (error) {
    const appError =
      error instanceof AppError
        ? error
        : new AppError({
            code: "SCAN_FAILED",
            message: "Scan failed before actions were taken.",
            retryable: true,
            degraded: true,
            status: 502,
          });

    const failed = {
      ...scanRun,
      status: "failed" as const,
      degraded: true,
      errorCode: appError.code,
      finishedAt: nowIso(),
    };
    await store.updateScanRun(failed);

    if (appError.code === "GMAIL_QUOTA_LIMITED") {
      emitPartialScan(userId, scanRun.id, appError.message);
    }

    throw appError;
  }
}

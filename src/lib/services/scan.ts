import { classifySender, type SenderEvidence } from "../classification/classifier";
import type { ScanRunWithCandidates, SenderCandidate } from "../domain";
import { AppError } from "../errors";
import { getHeader, parseSender, extractUnsubscribeMethods } from "../gmail/headers";
import type { GmailClient, GmailMessageHeader } from "../gmail/client";
import { hashPii } from "../security/hash";
import type { AppStore } from "../storage/store";
import { newId, nowIso } from "../ids";

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
    const listId = getHeader(message.headers, "List-ID");
    const precedence = getHeader(message.headers, "Precedence");
    const autoSubmitted = getHeader(message.headers, "Auto-Submitted");
    const subject = getHeader(message.headers, "Subject");
    const key = sender.domain;
    const existing = grouped.get(key);
    const unsubscribeMethods = extractUnsubscribeMethods(listUnsubscribe);

    if (existing) {
      existing.messageCount += 1;
      existing.messageIds.push(message.id);
      existing.hasListUnsubscribe =
        existing.hasListUnsubscribe || Boolean(listUnsubscribe);
      existing.bulkHeaders =
        existing.bulkHeaders ||
        Boolean(listId || /bulk|list|auto/i.test(`${precedence} ${autoSubmitted}`));
      existing.unsubscribeMethods = [
        ...new Set([...existing.unsubscribeMethods, ...unsubscribeMethods]),
      ];
      existing.labelIds = [...new Set([...existing.labelIds, ...message.labelIds])];
      if (subject) existing.subjectHints?.push(subject);
      continue;
    }

    grouped.set(key, {
      senderDomain: sender.domain,
      senderEmail: sender.email,
      senderDisplayName: sender.displayName,
      messageCount: 1,
      hasListUnsubscribe: Boolean(listUnsubscribe),
      unsubscribeMethods,
      bulkHeaders: Boolean(
        listId || /bulk|list|auto/i.test(`${precedence} ${autoSubmitted}`),
      ),
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

  try {
    const allowlist = await store.listAllowlist(userId);
    const messages = await gmail.listRecentMessageHeaders({ query, maxMessages });
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
    throw appError;
  }
}

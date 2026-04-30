import { hashValue } from "@inbox-exorcist/shared-core/hashing";
import { emitDiagnosticEvent } from "@inbox-exorcist/shared-diagnostics/events";
import type { DiagnosticEventType } from "@inbox-exorcist/shared-diagnostics/types";

export function emitEvent(
  userId: string,
  type: DiagnosticEventType,
  metadata: Record<string, unknown> = {},
  runId?: string,
) {
  const userIdHash = hashValue(userId);
  return emitDiagnosticEvent(userIdHash, type, metadata, undefined, runId);
}

export function emitOauthStarted(userId: string) {
  return emitEvent(userId, "oauth_started");
}

export function emitOauthCompleted(userId: string) {
  return emitEvent(userId, "oauth_completed");
}

export function emitOauthFailed(userId: string, reason?: string) {
  return emitEvent(userId, "oauth_failed", { reason });
}

export function emitScanStarted(userId: string, runId: string) {
  return emitEvent(userId, "scan_started", {}, runId);
}

export function emitScanCompleted(userId: string, runId: string, candidateCount: number) {
  return emitEvent(userId, "scan_completed", { candidateCount }, runId);
}

export function emitPartialScan(userId: string, runId: string, reason: string) {
  return emitEvent(userId, "partial_scan", { reason }, runId);
}

export function emitPreviewViewed(userId: string, runId: string) {
  return emitEvent(userId, "preview_viewed", {}, runId);
}

export function emitQuietStarted(userId: string, runId: string, senderCount: number) {
  return emitEvent(userId, "quiet_action_started", { senderCount }, runId);
}

export function emitQuietCompleted(userId: string, runId: string, quietedCount: number) {
  return emitEvent(userId, "quiet_action_completed", { quietedCount }, runId);
}

export function emitQuietPartial(userId: string, runId: string, reason: string) {
  return emitEvent(userId, "quiet_action_partial", { reason }, runId);
}

export function emitUndoStarted(userId: string, actionCount: number) {
  return emitEvent(userId, "undo_started", { actionCount });
}

export function emitUndoCompleted(userId: string, removedCount: number) {
  return emitEvent(userId, "undo_completed", { removedCount });
}

export function emitUndoPartial(userId: string, failures: string[]) {
  return emitEvent(userId, "undo_partial", { failureCount: failures.length });
}

export function emitDisconnectClicked(userId: string) {
  return emitEvent(userId, "disconnect_clicked");
}

export function emitDataDeleteRequested(userId: string) {
  return emitEvent(userId, "data_delete_requested");
}

export function emitProtectedSenderSkipped(userId: string, domainHash: string) {
  return emitEvent(userId, "protected_sender_skipped", { domainHash });
}

export function emitGmailQuotaLimited(userId: string, runId?: string) {
  return emitEvent(userId, "gmail_quota_limited", {}, runId);
}

export function emitGmailRateLimited(userId: string, runId?: string) {
  return emitEvent(userId, "gmail_rate_limited", {}, runId);
}

export function emitTokenExpired(userId: string) {
  return emitEvent(userId, "token_expired");
}

export function emitTokenRefreshFailed(userId: string) {
  return emitEvent(userId, "token_refresh_failed");
}

export function emitLabelCreateFailed(userId: string, reason: string) {
  return emitEvent(userId, "label_create_failed", { reason });
}

export function emitFilterCreateFailed(userId: string, domainHash: string) {
  return emitEvent(userId, "filter_create_failed", { domainHash });
}

export function emitUnsubscribeUnavailable(userId: string, domainHash: string) {
  return emitEvent(userId, "unsubscribe_unavailable", { domainHash });
}

export function emitUndoPartialFailure(userId: string, failureCount: number) {
  return emitEvent(userId, "undo_partial_failure", { failureCount });
}

export function emitDisconnectFailed(userId: string, reason: string) {
  return emitEvent(userId, "disconnect_failed", { reason });
}

export function emitDataDeletePartialFailure(userId: string, reason: string) {
  return emitEvent(userId, "data_delete_partial_failure", { reason });
}

export function emitInsufficientScopes(userId: string) {
  return emitEvent(userId, "insufficient_scopes");
}

export function emitAuthDenied(userId: string, reason: string) {
  return emitEvent(userId, "auth_denied", { reason });
}

import { registerFailures } from "@inbox-exorcist/shared-intelligence/failure-registry";
import type { FailureEntry } from "@inbox-exorcist/shared-intelligence/types";

export const gmailFailures: FailureEntry[] = [
  {
    code: "oauth_denied",
    userSafeMessage: "Google denied the connection. Please try connecting Gmail again.",
    retryable: false,
    confidenceImpact: "invalidate",
    actionImpact: "block",
  },
  {
    code: "insufficient_scopes",
    userSafeMessage: "Gmail did not grant enough access to quiet senders.",
    retryable: false,
    confidenceImpact: "invalidate",
    actionImpact: "block",
  },
  {
    code: "token_expired",
    userSafeMessage: "Gmail session expired. Please reconnect Gmail and retry.",
    retryable: true,
    confidenceImpact: "none",
    actionImpact: "partial",
  },
  {
    code: "token_refresh_failed",
    userSafeMessage: "Gmail could not refresh the session. Please reconnect and retry.",
    retryable: true,
    confidenceImpact: "reduce",
    actionImpact: "partial",
  },
  {
    code: "gmail_quota_limited",
    userSafeMessage: "Gmail quota limited this scan. Retry in a few minutes.",
    retryable: true,
    confidenceImpact: "reduce",
    actionImpact: "partial",
  },
  {
    code: "gmail_rate_limited",
    userSafeMessage: "Gmail is rate limiting requests. Please wait and retry.",
    retryable: true,
    confidenceImpact: "reduce",
    actionImpact: "partial",
  },
  {
    code: "partial_scan",
    userSafeMessage: "Scan completed with partial results. Some senders may not appear.",
    retryable: true,
    confidenceImpact: "reduce",
    actionImpact: "partial",
  },
  {
    code: "label_create_failed",
    userSafeMessage: "Could not create the quiet label. Filters were not applied.",
    retryable: true,
    confidenceImpact: "reduce",
    actionImpact: "block",
  },
  {
    code: "filter_create_failed",
    userSafeMessage: "Filter creation failed for a sender. Please retry.",
    retryable: true,
    confidenceImpact: "reduce",
    actionImpact: "partial",
  },
  {
    code: "unsubscribe_unavailable",
    userSafeMessage: "Unsubscribe was not available. Filter quieting still applied.",
    retryable: false,
    confidenceImpact: "none",
    actionImpact: "partial",
  },
  {
    code: "undo_partial_failure",
    userSafeMessage: "Some filters could not be removed. The rest were reversed.",
    retryable: true,
    confidenceImpact: "reduce",
    actionImpact: "partial",
  },
  {
    code: "disconnect_failed",
    userSafeMessage: "Gmail disconnect had an issue. Revoke access in Google Account settings.",
    retryable: true,
    confidenceImpact: "none",
    actionImpact: "none",
  },
  {
    code: "data_delete_partial_failure",
    userSafeMessage: "Some data could not be deleted. Contact support if needed.",
    retryable: true,
    confidenceImpact: "none",
    actionImpact: "none",
  },
];

export function registerGmailFailures(): void {
  registerFailures(gmailFailures);
}

export function getGmailFailure(code: string): FailureEntry | undefined {
  return gmailFailures.find((f) => f.code === code);
}

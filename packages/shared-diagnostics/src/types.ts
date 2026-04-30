export type DiagnosticEventType =
  | "oauth_started"
  | "oauth_completed"
  | "oauth_failed"
  | "scan_started"
  | "scan_completed"
  | "partial_scan"
  | "preview_viewed"
  | "quiet_action_started"
  | "quiet_action_completed"
  | "quiet_action_partial"
  | "undo_started"
  | "undo_completed"
  | "undo_partial"
  | "disconnect_clicked"
  | "data_delete_requested"
  | "protected_sender_skipped"
  | "gmail_quota_limited"
  | "gmail_rate_limited"
  | "token_expired"
  | "token_refresh_failed"
  | "label_create_failed"
  | "filter_create_failed"
  | "unsubscribe_unavailable"
  | "undo_partial_failure"
  | "disconnect_failed"
  | "data_delete_partial_failure"
  | "insufficient_scopes"
  | "auth_denied";

export type DiagnosticEvent = {
  id: string;
  userIdHash: string;
  sessionId?: string;
  runId?: string;
  type: DiagnosticEventType;
  timestamp: string;
  metadata: Record<string, unknown>;
};

export type UserRecord = {
  userIdHash: string;
  firstSeen: string;
  lastSeen: string;
  eventCount: number;
};

export type SessionRecord = {
  sessionId: string;
  userIdHash: string;
  startedAt: string;
  endedAt?: string;
  eventCount: number;
};

export type RunRecord = {
  runId: string;
  userIdHash: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "completed" | "partial" | "failed";
  eventCount: number;
};

export type IssueTimelineEntry = {
  timestamp: string;
  type: string;
  code?: string;
  message: string;
  resolved: boolean;
};

export type SupportSafeLog = {
  userIdHash: string;
  runId?: string;
  events: DiagnosticEvent[];
  summary: string;
};

export type ProductUsageDiagnostics = {
  userIdHash: string;
  totalScans: number;
  totalQuietActions: number;
  totalUndoActions: number;
  lastActiveAt: string;
  connectedSince: string;
  errorRate: number;
};

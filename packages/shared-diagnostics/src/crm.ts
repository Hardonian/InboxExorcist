import type { DiagnosticEvent, SupportSafeLog, UserRecord, SessionRecord, RunRecord } from "./types.ts";

const userRecords = new Map<string, UserRecord>();
const sessionRecords = new Map<string, SessionRecord>();
const runRecords = new Map<string, RunRecord>();

export function upsertUserRecord(record: UserRecord): void {
  userRecords.set(record.userIdHash, record);
}

export function getUserRecord(userIdHash: string): UserRecord | undefined {
  return userRecords.get(userIdHash);
}

export function upsertSessionRecord(record: SessionRecord): void {
  sessionRecords.set(record.sessionId, record);
}

export function getSessionRecord(sessionId: string): SessionRecord | undefined {
  return sessionRecords.get(sessionId);
}

export function upsertRunRecord(record: RunRecord): void {
  runRecords.set(record.runId, record);
}

export function getRunRecord(runId: string): RunRecord | undefined {
  return runRecords.get(runId);
}

export function getSupportSafeLog(userIdHash: string, events: DiagnosticEvent[]): SupportSafeLog {
  return {
    userIdHash,
    events,
    summary: `User ${userIdHash.slice(0, 8)}... diagnostic log (events redacted for support safety)`,
  };
}

export function listUserRecords(): UserRecord[] {
  return [...userRecords.values()];
}

export function listRunRecords(): RunRecord[] {
  return [...runRecords.values()];
}

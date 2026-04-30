import { randomUUID } from "node:crypto";
import type { DiagnosticEvent, DiagnosticEventType } from "./types.ts";

const eventStore: DiagnosticEvent[] = [];

export function emitDiagnosticEvent(
  userIdHash: string,
  type: DiagnosticEventType,
  metadata: Record<string, unknown> = {},
  sessionId?: string,
  runId?: string,
): DiagnosticEvent {
  const event: DiagnosticEvent = {
    id: `diag_${randomUUID()}`,
    userIdHash,
    sessionId,
    runId,
    type,
    timestamp: new Date().toISOString(),
    metadata,
  };
  eventStore.push(event);
  return event;
}

export function getEventsForUser(userIdHash: string): DiagnosticEvent[] {
  return eventStore.filter((e) => e.userIdHash === userIdHash);
}

export function getEventsForRun(runId: string): DiagnosticEvent[] {
  return eventStore.filter((e) => e.runId === runId);
}

export function getRecentEvents(limit = 50): DiagnosticEvent[] {
  return [...eventStore].reverse().slice(0, limit);
}

export function clearEvents(): void {
  eventStore.length = 0;
}

export function getEventCount(): number {
  return eventStore.length;
}

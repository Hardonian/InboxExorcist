import type { RetryCostEntry } from "./types.ts";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export function shouldRetry(attempt: number, maxRetries = MAX_RETRIES): boolean {
  return attempt < maxRetries;
}

export function getRetryDelayMs(attempt: number, baseDelay = BASE_DELAY_MS): number {
  return baseDelay * Math.pow(2, attempt);
}

export function recordRetryCost(
  entries: RetryCostEntry[],
  operation: string,
  attempt: number,
  costMs: number,
  success: boolean,
): void {
  entries.push({ operation, attempt, costMs, success });
}

export function getTotalRetryCostMs(entries: RetryCostEntry[]): number {
  return entries.reduce((sum, entry) => sum + entry.costMs, 0);
}

export function getRetryStats(entries: RetryCostEntry[]): {
  total: number;
  successful: number;
  failed: number;
  totalCostMs: number;
} {
  const successful = entries.filter((e) => e.success).length;
  return {
    total: entries.length,
    successful,
    failed: entries.length - successful,
    totalCostMs: getTotalRetryCostMs(entries),
  };
}

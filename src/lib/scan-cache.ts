import { InMemoryCache } from "@inbox-exorcist/shared-infra/cache";
import { dedupe } from "@inbox-exorcist/shared-infra/dedupe";
import { CircuitBreaker } from "@inbox-exorcist/shared-infra/circuit-breaker";
import { createCostTracker } from "@inbox-exorcist/shared-cost-control/tracker";
import type { ScanRun, SenderCandidate } from "./domain.ts";

export const scanCache = new InMemoryCache<ScanRun>();
export const senderCache = new InMemoryCache<SenderCandidate[]>();

export const scanDedupe = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeoutMs: 30_000,
  halfOpenMaxAttempts: 1,
});

export const costTracker = createCostTracker();

export async function cachedScanRun(
  scanId: string,
  fetchFn: () => Promise<ScanRun>,
): Promise<ScanRun> {
  const cached = await scanCache.get(scanId);
  if (cached) {
    costTracker.recordCacheHit();
    return cached;
  }

  costTracker.recordCacheMiss();
  const result = await fetchFn();
  await scanCache.set(scanId, result, 600_000);
  return result;
}

export async function deduplicatedScan(
  userId: string,
  scanFn: () => Promise<ScanRun>,
): Promise<ScanRun> {
  return dedupe(`scan:${userId}`, scanFn);
}

export function trackGmailApiCall(operation: string) {
  costTracker.recordApiCall(operation);
}

export function trackRetry(operation: string, attempt: number, costMs: number, success: boolean) {
  costTracker.recordRetry(operation, attempt, costMs, success);
}

export function getCostReport() {
  return costTracker.getReport();
}

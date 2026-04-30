import type { CostMetrics, CostReport, GmailApiCallBucket, RetryCostEntry, CacheStats } from "./types.ts";

export function createCostTracker() {
  let apiCalls = 0;
  let retryCount = 0;
  let scanSizeBytes = 0;
  let senderCount = 0;
  let actionCount = 0;
  let partialScanCount = 0;
  let totalScans = 0;
  const gmailBuckets: GmailApiCallBucket[] = [];
  const retries: RetryCostEntry[] = [];
  let cacheHits = 0;
  let cacheMisses = 0;

  return {
    recordApiCall(operation: string, limit?: number) {
      apiCalls += 1;
      const bucket = gmailBuckets.find((b) => b.operation === operation);
      if (bucket) {
        bucket.count += 1;
      } else {
        gmailBuckets.push({ operation, count: 1, limit: limit ?? 0 });
      }
    },

    recordRetry(operation: string, attempt: number, costMs: number, success: boolean) {
      retryCount += 1;
      retries.push({ operation, attempt, costMs, success });
    },

    recordScanSize(bytes: number, senders: number) {
      scanSizeBytes += bytes;
      senderCount += senders;
      totalScans += 1;
    },

    recordAction() {
      actionCount += 1;
    },

    recordPartialScan() {
      partialScanCount += 1;
    },

    recordCacheHit() {
      cacheHits += 1;
    },

    recordCacheMiss() {
      cacheMisses += 1;
    },

    getMetrics(): CostMetrics {
      const totalCache = cacheHits + cacheMisses;
      return {
        apiCalls,
        retryCount,
        scanSizeBytes,
        senderCount,
        actionCount,
        partialScanRate: totalScans > 0 ? partialScanCount / totalScans : 0,
        cacheHitRate: totalCache > 0 ? cacheHits / totalCache : 0,
        cacheMissRate: totalCache > 0 ? cacheMisses / totalCache : 0,
      };
    },

    getCacheStats(): CacheStats {
      const total = cacheHits + cacheMisses;
      return {
        hits: cacheHits,
        misses: cacheMisses,
        hitRate: total > 0 ? cacheHits / total : 0,
      };
    },

    getReport(): CostReport {
      return {
        metrics: this.getMetrics(),
        gmailBuckets: [...gmailBuckets],
        retries: [...retries],
        cacheStats: this.getCacheStats(),
        timestamp: new Date().toISOString(),
      };
    },

    reset() {
      apiCalls = 0;
      retryCount = 0;
      scanSizeBytes = 0;
      senderCount = 0;
      actionCount = 0;
      partialScanCount = 0;
      totalScans = 0;
      gmailBuckets.length = 0;
      retries.length = 0;
      cacheHits = 0;
      cacheMisses = 0;
    },
  };
}

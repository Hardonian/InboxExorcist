export type CostMetrics = {
  apiCalls: number;
  retryCount: number;
  scanSizeBytes: number;
  senderCount: number;
  actionCount: number;
  partialScanRate: number;
  cacheHitRate: number;
  cacheMissRate: number;
};

export type GmailApiCallBucket = {
  operation: string;
  count: number;
  limit: number;
  resetAt?: string;
};

export type RetryCostEntry = {
  operation: string;
  attempt: number;
  costMs: number;
  success: boolean;
};

export type ScanSizeInfo = {
  messageCount: number;
  estimatedBytes: number;
  senderCount: number;
};

export type CacheStats = {
  hits: number;
  misses: number;
  hitRate: number;
};

export type CostReport = {
  metrics: CostMetrics;
  gmailBuckets: GmailApiCallBucket[];
  retries: RetryCostEntry[];
  cacheStats: CacheStats;
  timestamp: string;
};

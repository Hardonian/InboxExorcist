import type { GmailApiCallBucket } from "./types.ts";

export const GMAIL_API_LIMITS: Record<string, number> = {
  messages_list: 250,
  messages_get: 250,
  labels_create: 10,
  filters_create: 20,
  batch_modify: 1000,
  filters_delete: 20,
};

export function createBucket(operation: string): GmailApiCallBucket {
  return {
    operation,
    count: 0,
    limit: GMAIL_API_LIMITS[operation] ?? 0,
  };
}

export function checkBucketLimit(bucket: GmailApiCallBucket): { ok: boolean; remaining: number } {
  const remaining = bucket.limit - bucket.count;
  return { ok: remaining > 0, remaining };
}

export function incrementBucket(bucket: GmailApiCallBucket): void {
  bucket.count += 1;
}

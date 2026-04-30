# Cost Controls

## Gmail API Call Tracking

All Gmail API calls are tracked via `src/lib/scan-cache.ts` using the shared-cost-control tracker.

### Tracked Metrics

| Metric | Description |
|--------|-------------|
| `apiCalls` | Total Gmail API calls per scan |
| `retryCount` | Number of retry attempts |
| `scanSizeBytes` | Estimated scan data size |
| `senderCount` | Number of unique senders found |
| `actionCount` | Number of quiet/undo actions |
| `partialScanRate` | Rate of partial scans |
| `cacheHitRate` | Cache hit rate |
| `cacheMissRate` | Cache miss rate |

### Gmail API Call Buckets

| Operation | Limit |
|-----------|-------|
| `messages_list` | 250 |
| `messages_get` | 250 |
| `labels_create` | 10 |
| `filters_create` | 20 |
| `batch_modify` | 1000 |
| `filters_delete` | 20 |

### Retry Cost Tracking

- Exponential backoff: `base_delay * 2^attempt`
- Maximum retries: 3
- Each retry records operation, attempt number, cost in ms, and success/failure

### Cache Strategy

- Scan results cached for 10 minutes
- Scan deduplication via in-flight promise deduping
- Circuit breaker on scan operations (3 failures = 30s cooldown)
- No message body caching (headers only)

## Accessing Cost Reports

```typescript
import { getCostReport } from "@/lib/scan-cache";
const report = getCostReport();
// Returns CostReport with all metrics
```

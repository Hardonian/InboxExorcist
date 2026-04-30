# Shared Core Integration

## Overview

InboxExorcist now uses five shared packages that provide common backend/intelligence/diagnostic/infrastructure capabilities. These packages are versioned at `0.1.0` and live under `/packages/`.

## Packages

### @inbox-exorcist/shared-core (`packages/shared-core/`)

| Module | Exports |
|--------|---------|
| `types` | `SchemaVersion`, `ConfidenceLevel`, `ConfidenceExplanation`, `Signal`, `Evidence`, `Reason`, `Limitation`, `SharedResultBase`, `ApiErrorEnvelope`, `ApiSuccessEnvelope`, `ApiEnvelope`, `DegradedState` |
| `errors` | `AppError`, `errorEnvelope`, `okEnvelope`, `unknownErrorEnvelope`, `toAppError` |
| `validation` | `validate`, `required`, `isString`, `isNumber`, `isArray`, `minLength`, `maxNumber` |
| `idempotency` | `idempotencyKey`, `checkIdempotency`, `createIdempotencyMiddleware` |
| `hashing` | `hashValue`, `hashEmail`, `hashDomain`, `safeLogIdentifier` |
| `logging` | `safeLog`, `logSafe`, `createLogger` (redacts sensitive keys) |
| `degraded` | `degradedNone`, `degradedPartial`, `degradedFull`, `mergeDegraded`, `isDegraded` |

### @inbox-exorcist/shared-intelligence (`packages/shared-intelligence/`)

| Module | Exports |
|--------|---------|
| `types` | `Signal`, `FailureEntry`, `ConfidenceResult`, `EvidenceItem`, `ScoringInput`, `ScoringResult`, `AdapterInterface`, `AutomationHook`, `RuleUpdate` |
| `signals` | `registerSignal`, `registerSignals`, `getSignal`, `listSignals`, `getSignalsByCategory` |
| `failure-registry` | `registerFailure`, `registerFailures`, `getFailure`, `listFailures`, `isRetryableFailure` |
| `confidence` | `calculateConfidence`, `explainConfidence` |
| `scoring` | `computeScore`, `clampScore` |
| `evidence` | `createEvidence`, `filterEvidence`, `summarizeEvidence` |
| `adapter` | `BaseAdapter`, `createAdapterPipeline` |
| `automation` | `registerHook`, `getHook`, `listHooks`, `executeHook`, `createRuleUpdate` |

### @inbox-exorcist/shared-diagnostics (`packages/shared-diagnostics/`)

| Module | Exports |
|--------|---------|
| `types` | `DiagnosticEventType` (28 event types), `DiagnosticEvent`, `UserRecord`, `SessionRecord`, `RunRecord`, `IssueTimelineEntry`, `SupportSafeLog`, `ProductUsageDiagnostics` |
| `events` | `emitDiagnosticEvent`, `getEventsForUser`, `getEventsForRun`, `getRecentEvents` |
| `timeline` | `createTimeline`, `addTimelineEntry`, `resolveTimelineEntry`, `getUnresolvedEntries`, `summarizeTimeline` |
| `crm` | `upsertUserRecord`, `getUserRecord`, `upsertSessionRecord`, `getSessionRecord`, `upsertRunRecord`, `getRunRecord`, `getSupportSafeLog`, `listUserRecords`, `listRunRecords` |
| `usage` | `createUsageDiagnostics`, `incrementScanCount`, `incrementQuietCount`, `incrementUndoCount`, `updateErrorRate` |

### @inbox-exorcist/shared-cost-control (`packages/shared-cost-control/`)

| Module | Exports |
|--------|---------|
| `types` | `CostMetrics`, `GmailApiCallBucket`, `RetryCostEntry`, `ScanSizeInfo`, `CacheStats`, `CostReport` |
| `tracker` | `createCostTracker` (full cost tracking factory) |
| `gmail-buckets` | `GMAIL_API_LIMITS`, `createBucket`, `checkBucketLimit`, `incrementBucket` |
| `retry-costs` | `shouldRetry`, `getRetryDelayMs`, `recordRetryCost`, `getTotalRetryCostMs`, `getRetryStats` |
| `cache-stats` | `createCacheStats`, `recordHit`, `recordMiss`, `getHitRate` |

### @inbox-exorcist/shared-infra (`packages/shared-infra/`)

| Module | Exports |
|--------|---------|
| `cache` | `CacheInterface<T>`, `InMemoryCache<T>` |
| `dedupe` | `dedupe`, `isInFlight`, `clearInFlight` |
| `circuit-breaker` | `CircuitBreaker`, `CircuitState` |
| `rate-limit` | `RateLimiter`, `createSlidingWindowLimiter` |
| `health` | `registerHealthChecker`, `runHealthChecks`, `getCheckerCount` |

## Migration Notes

- `src/lib/errors.ts` now re-exports from `@inbox-exorcist/shared-core/errors`
- `src/lib/classification/classifier.ts` uses `computeScore`, `clampScore`, `calculateConfidence`, `createEvidence` from shared-intelligence
- `src/lib/services/scan.ts` uses `costTracker`, `trackGmailApiCall`, `trackRetry` from shared-cost-control
- `src/lib/diagnostics.ts` wraps shared-diagnostics events with user hashing
- `src/lib/scan-cache.ts` uses `InMemoryCache`, `dedupe`, `CircuitBreaker` from shared-infra
- `src/lib/api.ts` `buildSharedResponse` produces the shared output contract

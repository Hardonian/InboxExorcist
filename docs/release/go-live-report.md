# Go-Live Readiness Report

**Date:** 2026-04-30
**Version:** 0.2.0
**Status:** PRIVATE_BETA_ONLY

## Summary

InboxExorcist has been integrated with five shared backend packages (shared-core, shared-intelligence, shared-diagnostics, shared-cost-control, shared-infra). All local duplicated logic has been replaced. The frontend, branding, and product flow remain independent.

## Shared Packages Integrated

| Package | Location | Modules |
|---------|----------|---------|
| @inbox-exorcist/shared-core | packages/shared-core/ | types, errors, validation, idempotency, hashing, logging, degraded |
| @inbox-exorcist/shared-intelligence | packages/shared-intelligence/ | types, signals, failure-registry, confidence, scoring, evidence, adapter, automation |
| @inbox-exorcist/shared-diagnostics | packages/shared-diagnostics/ | types, events, timeline, crm, usage |
| @inbox-exorcist/shared-cost-control | packages/shared-cost-control/ | types, tracker, gmail-buckets, retry-costs, cache-stats |
| @inbox-exorcist/shared-infra | packages/shared-infra/ | cache, dedupe, circuit-breaker, rate-limit, health |

## Local Duplicated Logic Removed

| Old Location | Replaced By |
|-------------|-------------|
| src/lib/errors.ts (AppError, envelopes) | @inbox-exorcist/shared-core/errors |
| src/lib/classification/classifier.ts (scoring logic) | shared-intelligence scoring + confidence + email signals |
| src/lib/security/hash.ts (PII hashing) | @inbox-exorcist/shared-core/hashing |
| src/lib/gmail/error-map.ts (error mapping) | shared-intelligence failure-registry + gmail-failures |
| Ad-hoc degraded flags | shared-core degraded state model |
| Ad-hoc cost tracking | shared-cost-control tracker |

## InboxExorcist-Specific Extensions Preserved

| Extension | Location |
|-----------|----------|
| Email signal registry (18 signals) | src/lib/intelligence/email-signals.ts |
| Gmail failure registry (13 failures) | src/lib/intelligence/gmail-failures.ts |
| Diagnostic event emitter (28 event types) | src/lib/diagnostics.ts |
| Scan cache + cost tracking | src/lib/scan-cache.ts |
| Shared API response builder | src/lib/api.ts (buildSharedResponse) |

## Gmail Diagnostics Events Added

28 event types covering: OAuth lifecycle, scan lifecycle, action lifecycle, account management, and error conditions.

## Caching/Cost Controls Active

- In-memory cache for scan results (10min TTL)
- In-flight request deduplication
- Circuit breaker on scan operations (3 failures, 30s reset)
- Gmail API call bucket tracking
- Retry cost tracking with exponential backoff
- Cache hit/miss rate tracking

## Privacy/Security Checks

| Check | Status |
|-------|--------|
| No message bodies stored | PASS |
| No attachment storage | PASS |
| OAuth tokens encrypted (AES-256-GCM) | PASS |
| Logs redacted (sensitive keys) | PASS |
| Gmail scopes documented | PASS |
| Disconnect route exists | PASS |
| Data deletion route exists | PASS |
| Protected senders never auto-selected | PASS |
| No deletion by default | PASS |
| Undo path exists | PASS |
| PII hashed (HMAC-SHA256) | PASS |

## Commands Run and Results

| Command | Result |
|---------|--------|
| `npm run lint` | PASS (1 warning: unused import, no errors) |
| `npm run typecheck` | PASS (0 errors) |
| `npm run test` | PASS (16/16 tests pass) |
| `npm run build` | PASS (all routes compiled) |

## Remaining Blockers

1. **Node.js version**: Tests require `tsx` (Node 20 lacks `--experimental-strip-types`). Package.json updated to use `tsx`.
2. **E2E tests**: `test:e2e` spawns dev server; not run in this session due to port conflicts.
3. **Supabase migrations**: No new migrations needed for shared packages (in-memory stores used).
4. **Production env vars**: `TOKEN_ENCRYPTION_KEY`, `SESSION_SECRET`, `PII_HASH_SECRET` must be set in production.

## Launch Status: PRIVATE_BETA_ONLY

**Rationale:**
- All shared packages are new and untested in production
- No WarrantyWeasel repo was available to verify pattern alignment
- E2E tests not run
- No load testing performed
- OAuth verification not complete

**Recommended next steps for GO status:**
1. Run full E2E test suite
2. Deploy to staging with real Gmail OAuth
3. Verify shared packages against WarrantyWeasel patterns
4. Load test scan + quiet + undo flows
5. Complete Google OAuth verification

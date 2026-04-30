# Degraded States

## Overview

InboxExorcist uses the shared-core degraded state model to track partial failures and communicate them to the user.

## Degraded State Types

| State | When Used |
|-------|-----------|
| `degradedNone()` | Normal operation, no issues |
| `degradedPartial(code, message)` | Scan or action completed with partial results |
| `degradedFull(code, message, retryable?)` | Operation failed completely |

## Gmail Failure Registry

All Gmail-specific failures are registered in `src/lib/intelligence/gmail-failures.ts`:

| Code | User-Safe Message | Retryable |
|------|------------------|-----------|
| `oauth_denied` | Google denied the connection | No |
| `insufficient_scopes` | Gmail did not grant enough access | No |
| `token_expired` | Gmail session expired | Yes |
| `token_refresh_failed` | Gmail could not refresh session | Yes |
| `gmail_quota_limited` | Gmail quota limited | Yes |
| `gmail_rate_limited` | Gmail rate limiting | Yes |
| `partial_scan` | Scan completed with partial results | Yes |
| `label_create_failed` | Could not create quiet label | Yes |
| `filter_create_failed` | Filter creation failed | Yes |
| `unsubscribe_unavailable` | Unsubscribe not available | No |
| `undo_partial_failure` | Some filters could not be removed | Yes |
| `disconnect_failed` | Disconnect had an issue | Yes |
| `data_delete_partial_failure` | Some data could not be deleted | Yes |

## Confidence Impact

Each failure has a confidence impact level:
- `none`: No impact on result confidence
- `reduce`: Confidence reduced, results may be incomplete
- `invalidate`: Results cannot be trusted

## Action Impact

Each failure has an action impact level:
- `none`: No impact on subsequent actions
- `partial`: Some actions may still proceed
- `block`: Actions cannot proceed

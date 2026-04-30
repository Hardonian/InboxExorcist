# Diagnostics

## Event Types

All diagnostic events are emitted through `src/lib/diagnostics.ts`, which wraps the shared-diagnostics event system. Events use hashed user IDs and never contain raw email addresses, message bodies, or OAuth tokens.

### OAuth Events

| Event | When Emitted |
|-------|-------------|
| `oauth_started` | User clicks "Connect Gmail" |
| `oauth_completed` | OAuth callback succeeds |
| `oauth_failed` | OAuth callback fails |

### Scan Events

| Event | When Emitted |
|-------|-------------|
| `scan_started` | Scan begins |
| `scan_completed` | Scan finishes with candidates |
| `partial_scan` | Scan completes with partial results |

### Action Events

| Event | When Emitted |
|-------|-------------|
| `preview_viewed` | User views scan preview |
| `quiet_action_started` | User clicks "Quiet" |
| `quiet_action_completed` | All filters created successfully |
| `quiet_action_partial` | Some filters failed |
| `undo_started` | User clicks "Undo" |
| `undo_completed` | All filters removed |
| `undo_partial` | Some filters could not be removed |

### Account Events

| Event | When Emitted |
|-------|-------------|
| `disconnect_clicked` | User disconnects Gmail |
| `data_delete_requested` | User requests data deletion |

### Error Events

| Event | When Emitted |
|-------|-------------|
| `protected_sender_skipped` | A protected sender is excluded from quiet |
| `gmail_quota_limited` | Gmail API quota exceeded |
| `gmail_rate_limited` | Gmail API rate limit hit |
| `token_expired` | OAuth token expired |
| `token_refresh_failed` | Token refresh failed |
| `label_create_failed` | Gmail label creation failed |
| `filter_create_failed` | Gmail filter creation failed |
| `unsubscribe_unavailable` | Unsubscribe not available for sender |
| `undo_partial_failure` | Some undo operations failed |
| `disconnect_failed` | Disconnect/token revocation failed |
| `data_delete_partial_failure` | Data deletion was incomplete |
| `insufficient_scopes` | OAuth scopes are insufficient |
| `auth_denied` | Google denied OAuth consent |

## Privacy Guarantees

- User IDs are hashed before storage
- Sender addresses are hashed if stored
- No message bodies are ever stored
- No attachments are ever stored
- OAuth tokens are never logged
- All logs are redacted via shared-core safe logging

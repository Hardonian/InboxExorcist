# Security

InboxExorcist is built with a security-first, privacy-by-design architecture. This document describes our security model, data handling practices, and incident response procedures.

## Principles

- **Least-privilege Gmail access** — we request the narrowest OAuth scopes needed and support incremental authorization.
- **No email body, snippet, attachment, or credential logging** — classification uses only Gmail metadata headers.
- **No deleting by default** — quieting applies reversible labels and filters; messages remain accessible.
- **Fail closed for protected sender classes** — financial, security, healthcare, legal, government, and personal senders are never auto-selected.
- **Every action is auditable and reversible** — Gmail filter IDs are stored so undo operations can remove exactly what was created.
- **Tokens encrypted at rest** — AES-256-GCM encryption for all OAuth tokens and sensitive PII.

## OAuth Scopes

| Scope | Type | Purpose |
|-------|------|---------|
| `openid email profile` | Standard | Identify the connected Google account. Email is encrypted before storage. |
| `gmail.metadata` | Sensitive | Read message headers and labels for scanning. Used in incremental first-connect flow. |
| `gmail.modify` | Restricted | Read/search messages, modify labels, archive messages. Required for quieting. |
| `gmail.settings.basic` | Sensitive | Create/manage Gmail filters for future message routing. |
| `gmail.send` (optional) | Restricted | Only when `GMAIL_ENABLE_MAILTO_UNSUBSCRIBE=true` for standards-based mailto unsubscribe. Disabled by default. |

Full scope rationale: [docs/gmail-scope-rationale.md](docs/gmail-scope-rationale.md)

## Incremental Authorization

InboxExorcist supports incremental OAuth:

1. **Initial connect** requests `gmail.metadata` + `openid email profile` — sufficient for scanning only.
2. **Quiet action** triggers an upgrade flow requesting `gmail.modify` + `gmail.settings.basic` — required for label/filter creation.
3. Users can scan and preview results before granting broader access.

To enable incremental auth, direct users to `/api/auth/google/start?incremental=true`. The upgrade endpoint `/api/auth/google/upgrade` revokes the existing token and re-authorizes with full scopes.

## Secrets Management

Production requires these environment variables:

| Variable | Purpose |
|----------|---------|
| `SESSION_SECRET` | HMAC-SHA256 key for signed session cookies |
| `PII_HASH_SECRET` | HMAC-SHA256 key for one-way PII hashing (sender emails) |
| `TOKEN_ENCRYPTION_KEY` | AES-256-GCM key for encrypting OAuth tokens and Gmail account email |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client identifier |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret |

All secrets must be rotated if any suspected exposure occurs.

## Data at Rest

### Encrypted
- OAuth access tokens (AES-256-GCM)
- OAuth refresh tokens (AES-256-GCM)
- Gmail account email address (AES-256-GCM)
- Sender display names (AES-256-GCM)

### Hashed (one-way)
- Sender email addresses (HMAC-SHA256)

### Stored in plaintext (non-sensitive)
- User internal IDs
- Sender domains
- Classification results and scores
- Action audit logs (sender domains, timestamps, filter IDs)
- Aggregate counts

### Never stored
- Full email message bodies
- Email attachments
- Email snippets (beyond header metadata)
- Raw unsubscribe URLs with embedded tokens

## Data in Transit

- All API endpoints require HTTPS in production.
- Session cookies are `Secure`, `HttpOnly`, and `SameSite=Lax`.
- OAuth state cookies include CSRF protection with 10-minute expiry.

## Log Redaction

All application logs must pass through the redaction utility (`src/lib/security/redact.ts`). The following are automatically redacted:

- Access tokens (Google `ya29.*` pattern)
- Refresh tokens (`1//...` pattern)
- Authorization codes (`4/...` pattern)
- Email addresses
- Message IDs (when not needed for audit)
- Email subject lines (when logging headers)
- Message bodies (never logged)
- URLs containing token parameters

## Gmail Safety

### Scanning
InboxExorcist reads only message metadata/headers via `format=metadata` with specific header names. It does not request `format=full`, `format=raw`, or `format=base64`.

### Quieting
Creates a Gmail label (`InboxExorcist/Quieted`) and per-sender filters that:
- Skip the inbox (`removeLabelIds: ["INBOX"]`)
- Apply the quiet label (`addLabelIds: [quietLabelId]`)

No messages are deleted by default.

### Unsubscribing
- HTTPS unsubscribe URLs are validated against SSRF protections (no private IPs, localhost, internal TLDs).
- Redirects are not followed blindly; redirect targets are re-validated.
- No credentials are entered into unsubscribe forms.
- No arbitrary JavaScript is executed.
- Mailto unsubscribe is disabled by default and requires explicit opt-in.

## Ownership Boundaries

All data access routes enforce user ownership:
- `/api/gmail/scan` — requires authenticated session
- `/api/gmail/scan/:id` — requires matching `userId` on scan record
- `/api/gmail/actions/quiet` — requires matching `userId` on scan and candidates
- `/api/gmail/actions/undo` — requires matching `userId` on actions
- `/api/me/delete-data` — requires authenticated session, deletes all user data

## User Data Deletion

Users can delete all their data via:
1. **Settings page** — UI-triggered deletion
2. **Direct API** — `POST /api/me/delete-data`
3. **Disconnect** — `POST /api/gmail/disconnect` revokes the OAuth token and removes the connection

Deletion removes: scan runs, candidates, actions, filters, unsubscribe attempts, audit events, allowlist/blocklist entries, and user records. The Gmail account email hash cannot be reversed.

## Incident Response

See [docs/incident-response.md](docs/incident-response.md) for severity classifications and response procedures.

## Reporting Vulnerabilities

Until a dedicated security mailbox exists, route reports through the repository owner. We commit to acknowledging reports within 48 hours and providing remediation timelines.

## Third-Party Dependencies

| Dependency | Purpose | Security Review |
|------------|---------|-----------------|
| Google Gmail API | Email metadata access | OAuth scopes reviewed and minimized |
| Supabase (optional) | Data persistence | Service role key restricted to project; RLS recommended |
| Next.js | Application framework | Latest stable version; security patches applied |
| Node.js crypto | Encryption/hashing | Built-in; no external crypto libraries |

## Compliance Notes

- Google treats `gmail.modify` as a **restricted scope** requiring OAuth verification and security assessment.
- `gmail.metadata` and `gmail.settings.basic` are **sensitive scopes** requiring verification.
- This application is built to meet Google's verification requirements:
  - Minimal scope usage with documented rationale
  - Incremental authorization support
  - Token encryption at rest
  - Comprehensive privacy policy
  - User data deletion capability
  - OAuth token revocation on disconnect

# Gmail Scope Rationale

InboxExorcist uses the narrowest viable scopes for the promised one-click quieting flow. All scopes are documented here for Google OAuth verification review.

## Incremental Authorization

InboxExorcist supports incremental OAuth to minimize initial scope requests:

1. **Scan-only flow** (`/api/auth/google/start?incremental=true`):
   - Requests `gmail.metadata` + `openid email profile`
   - Sufficient for scanning headers and previewing candidates
   - Cannot create filters, modify labels, or archive messages

2. **Full flow** (default, `/api/auth/google/start`):
   - Requests `gmail.modify` + `gmail.settings.basic` + `openid email profile`
   - Required for the complete quieting flow

3. **Upgrade flow** (`/api/auth/google/upgrade`):
   - Revokes existing scan-only token
   - Re-authorizes with full scopes
   - Triggered when a scan-only user attempts to quiet senders

## Scope Details

### `openid email profile` (Standard)

**Purpose**: Identify the connected Google account and display the connected email.

**Usage**: 
- Retrieved during OAuth callback via `https://openidconnect.googleapis.com/v1/userinfo`
- Email is encrypted with AES-256-GCM before storage
- Email hash (HMAC-SHA256) is used for internal lookups

**Why not skip**: Required to link the OAuth connection to a user session and prevent cross-account confusion.

### `https://www.googleapis.com/auth/gmail.metadata` (Sensitive)

**Purpose**: Read message metadata and headers for scanning.

**Usage**:
- `GET /gmail/v1/users/me/messages` — list message IDs matching search query
- `GET /gmail/v1/users/me/messages/{id}?format=metadata&metadataHeaders=...` — read specific headers only

**Headers requested**: From, Sender, List-Unsubscribe, List-Unsubscribe-Post, List-ID, Precedence, Auto-Submitted, Subject, Reply-To

**Why this scope**: `gmail.metadata` is narrower than `gmail.modify` and sufficient for scanning. It cannot modify labels, create filters, or change messages.

**Google classification**: Sensitive scope — requires OAuth verification.

### `https://www.googleapis.com/auth/gmail.modify` (Restricted)

**Purpose**: Read/search messages, modify labels, and archive existing messages.

**Usage**:
- `GET /gmail/v1/users/me/labels` — list existing labels
- `POST /gmail/v1/users/me/labels` — create `InboxExorcist/Quieted` label
- `POST /gmail/v1/users/me/messages/batchModify` — apply label and remove INBOX from existing messages
- `GET /gmail/v1/users/me/messages/{id}?format=metadata` — read headers (also covered by gmail.metadata)

**Why not gmail.readonly**: `gmail.readonly` cannot modify labels. The quieting flow requires adding labels and removing INBOX.

**Why not gmail.modify for scanning**: We use `gmail.metadata` for the scan-only flow to minimize initial scope requests. `gmail.modify` is only needed when the user confirms quiet actions.

**Google classification**: Restricted scope — requires OAuth verification and security assessment.

### `https://www.googleapis.com/auth/gmail.settings.basic` (Sensitive)

**Purpose**: Create and manage Gmail filters for future message routing.

**Usage**:
- `POST /gmail/v1/users/me/settings/filters` — create filter that skips inbox and applies quiet label
- `DELETE /gmail/v1/users/me/settings/filters/{id}` — delete filter during undo

**Why this scope**: Filter creation is the core mechanism for quieting future messages from identified senders. Without it, only existing messages can be labeled.

**Google classification**: Sensitive scope — requires OAuth verification.

### `https://www.googleapis.com/auth/gmail.send` (Restricted, Optional)

**Purpose**: Send mailto unsubscribe emails (RFC 8058 List-Unsubscribe-Post).

**Usage**:
- `POST /gmail/v1/users/me/messages/send` — send unsubscribe email

**When requested**: Only when `GMAIL_ENABLE_MAILTO_UNSUBSCRIBE=true` environment variable is set. Disabled by default.

**Why optional**: Most unsubscribe flows work via HTTPS links. Mailto unsubscribe is a fallback for senders that only provide email-based unsubscribe.

**Google classification**: Restricted scope — requires OAuth verification and security assessment.

## Scope Minimization Summary

| Flow | Scopes Requested | Restricted? |
|------|-----------------|-------------|
| Scan only (incremental) | `gmail.metadata`, `openid`, `email`, `profile` | No |
| Full quiet | `gmail.modify`, `gmail.settings.basic`, `openid`, `email`, `profile` | Yes (`gmail.modify`) |
| With mailto unsub | Full + `gmail.send` | Yes (`gmail.modify`, `gmail.send`) |

## What We Do NOT Do With These Scopes

- We do not read full email bodies (`format=full`, `format=raw`, `format=base64` are never used)
- We do not delete messages (no `POST /messages/{id}` DELETE)
- We do not modify message content
- We do not access drafts, contacts, or calendar
- We do not send emails on behalf of users (unless mailto unsubscribe is explicitly enabled)
- We do not access or modify Gmail settings beyond filters

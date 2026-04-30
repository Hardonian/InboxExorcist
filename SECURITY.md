# Security

## Principles

- Least-privilege Gmail access.
- No email body, snippet, attachment, or credential logging.
- No deleting by default.
- Fail closed for protected sender classes.
- Every action is auditable and reversible where Gmail exposes reversible ids.

## Secrets

Production requires:

- `SESSION_SECRET`
- `PII_HASH_SECRET`
- `TOKEN_ENCRYPTION_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

OAuth access and refresh tokens are encrypted with AES-256-GCM before storage. Gmail account email is encrypted; sender email is hashed.

## Gmail Safety

InboxExorcist uses metadata/header reads to classify senders. Quieting creates a Gmail label and filter that skips inbox and applies `InboxExorcist/Quieted`. It does not delete messages.

Unsubscribe uses standards-first mechanisms. HTTPS unsubscribe URLs are validated, private/internal targets are blocked, redirects are not followed blindly, no credentials are entered, and no arbitrary JavaScript is executed.

## Incident Contact

Until a public security mailbox exists, route reports through the repository owner. Rotate Google OAuth secrets and `TOKEN_ENCRYPTION_KEY` after any suspected token exposure.

# Incident Response Plan

## Severity Levels

### Severity 1 — Critical

**Examples**: Token exposure, unauthorized Gmail action, deletion behavior, cross-user data access, OAuth credential leak.

**Response Time**: Immediate (within 1 hour).

**Actions**:
1. Disable Google OAuth client in Google Cloud Console if needed.
2. Rotate `GOOGLE_CLIENT_SECRET` and `GOOGLE_CLIENT_ID`.
3. Rotate `TOKEN_ENCRYPTION_KEY` — this invalidates all stored tokens; users must reconnect.
4. Rotate `SESSION_SECRET` — this invalidates all active sessions.
5. Rotate `PII_HASH_SECRET` if sender email hashes may have been exposed.
6. Review audit events (`audit_events` table) for unauthorized actions.
7. Review Gmail filter IDs created during the incident window.
8. Notify affected users with exact scope of impact within 72 hours.
9. Document timeline, root cause, and remediation in incident report.

### Severity 2 — High

**Examples**: Gmail quota exhaustion, filter creation failures, partial undo, Supabase outage, degraded mode activation.

**Response Time**: Within 4 hours.

**Actions**:
1. Keep user-facing routes in degraded mode (graceful errors, not crashes).
2. Preserve audit events for all completed actions.
3. Disable new quiet actions if reversibility cannot be recorded.
4. Publish status update with retry guidance.
5. Monitor for cascading failures (e.g., retry storms).

### Severity 3 — Medium

**Examples**: UI rendering bugs, non-critical API errors, analytics tracking gaps, content errors.

**Response Time**: Within 24 hours.

**Actions**:
1. Triage and assign to appropriate engineer.
2. Deploy fix in next release cycle.
3. Update changelog.

## Log Rules

**Never log**:
- OAuth access tokens (`ya29.*`)
- OAuth refresh tokens (`1//...`)
- Authorization codes (`4/...`)
- Full Gmail account email addresses (use hash)
- Email message bodies
- Email snippets
- Email attachments
- Raw unsubscribe URLs with embedded personal tokens
- Subject lines in production logs

**Always redact** using `src/lib/security/redact.ts` before any logging.

## Token Rotation Procedure

1. Generate new secret: `openssl rand -hex 32`
2. Update environment variable in deployment platform
3. Restart application
4. Verify health endpoint returns healthy
5. Monitor error rates for 15 minutes

## User Notification Template

```
Subject: Important security notice regarding your InboxExorcist account

Dear InboxExorcist user,

We are writing to inform you of a security incident that may have affected your account.

What happened: [brief description]
When: [date/time range]
What data was involved: [specific data types]
What we are doing: [remediation steps]
What you should do: [user actions, if any]

We take your privacy seriously. If you have questions, please contact us at [contact].

— The InboxExorcist Team
```

## Post-Incident Review

Within 5 business days of resolution:
1. Write incident report with timeline
2. Identify root cause and contributing factors
3. Document lessons learned
4. Create action items to prevent recurrence
5. Update this incident response plan if needed

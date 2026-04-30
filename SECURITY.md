# Security Policy

## Reporting a Vulnerability
We take the security of your inbox seriously. If you discover a security vulnerability within InboxExorcist, please send an email to security@inboxexorcist.com.

## Security Invariants
1. **No Persistence of PII**: We do not store raw email addresses. We use salted SHA-256 hashes for sender identification.
2. **Token Encryption**: All Google OAuth tokens (Access/Refresh) are encrypted at rest using AES-256-GCM.
3. **Restricted Scopes**: We only request the minimum required Gmail API scopes. We do not request `https://mail.google.com/` (full access).
4. **No-Delete Policy**: Our code contains no logic to call the Gmail `messages.delete` or `threads.delete` endpoints.

## Data Handling
- **Database**: We use Supabase with Row Level Security (RLS) enabled.
- **Encryption Keys**: Managed via environment variables and never checked into source control.
- **Session Management**: Secure, HTTP-only cookies with CSRF protection.

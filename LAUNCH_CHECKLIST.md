# Launch Checklist

- [ ] Configure Google OAuth consent screen.
- [ ] Complete Google OAuth verification for Gmail restricted scopes.
- [ ] Run Supabase migration.
- [ ] Set `SESSION_SECRET`, `PII_HASH_SECRET`, and `TOKEN_ENCRYPTION_KEY`.
- [ ] Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and redirect URI.
- [ ] Run `npm run verify`.
- [ ] Live-test Gmail scan with a seed account.
- [ ] Live-test quiet action creates `InboxExorcist/Quieted`.
- [ ] Live-test undo removes created filters.
- [ ] Confirm no email bodies, snippets, attachments, or tokens appear in logs.
- [ ] Keep Stripe disabled until Gmail value flow is verified.

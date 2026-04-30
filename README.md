# InboxExorcist

InboxExorcist is a one-function B2C app:

Connect Gmail -> identify junk/promotional senders -> unsubscribe where safe -> create reversible Gmail filters/labels to silence future noise.

It is not a general inbox assistant, budgeting tool, billing-cancellation product, or financial-access app.

## MVP Flow

1. Landing page: "Your inbox has demons. Exorcise them."
2. Google OAuth.
3. Scan recent Gmail headers only.
4. Preview high-confidence noisy senders, review senders, and protected skips.
5. One click quieting with Gmail label/filter creation.
6. Standards-first unsubscribe attempts where safe.
7. Success screen and reversible action log.

## Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run verify
```

`npm run verify` runs lint, typecheck, unit/integration tests, HTTP smoke tests, and build.

## Local Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Google OAuth is required for live Gmail behavior. Without Google credentials, `/api/auth/google/start` redirects to a configured degraded error page and `/api/health` reports degraded.

## Data Posture

InboxExorcist does not store full email bodies, attachments, or message snippets. It stores minimal operational data: user id, encrypted Gmail account email, hashed sender emails, sender domains, classifications, action results, reversible Gmail filter/label ids, aggregate counts, timestamps, and audit events.

Supabase Postgres is supported through the REST store when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set. Without Supabase, the app runs in degraded in-memory mode for local smoke testing only.

## Gmail Scopes

- `openid email profile`: identify the connected Gmail account.
- `gmail.modify`: list/search messages, read metadata headers, apply/remove labels, and archive messages without deleting them.
- `gmail.settings.basic`: create reversible Gmail filters.
- `gmail.send`: optional only when `GMAIL_ENABLE_MAILTO_UNSUBSCRIBE=true`; not requested by default.

See `docs/gmail-scope-rationale.md`.

## Payment Gate

The MVP is free-first. Pricing is documented as:

- Free scan
- $5 one-time clean
- $3/month ongoing protection

Stripe should remain behind `NEXT_PUBLIC_ENABLE_PAYMENTS=true` until the Gmail flow is live-verified.

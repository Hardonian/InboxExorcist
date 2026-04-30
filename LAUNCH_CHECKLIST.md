# Launch Readiness Checklist: InboxExorcist

## Pre-Launch (Alpha/Beta)
- [x] Baseline lint and typecheck passes.
- [x] Intelligence engine unit tests implemented and passing.
- [x] Environment variable schema defined (`.env.example`).
- [x] Privacy/Security pages implemented.
- [x] Trust-first landing page implementation.
- [ ] Google OAuth production credentials configured.
- [ ] Stripe test mode verified (if applicable).

## Technical Verification
- [ ] Run `npm run verify` on production branch.
- [ ] Verify Gmail API scope rationale document.
- [ ] Confirm no message body persistence in database.
- [ ] Verify undo-path functionality (filter deletion).

## Legal & Compliance
- [x] Privacy Policy reviewed for "No-Delete" invariant.
- [ ] Terms of Service finalized.
- [ ] Data Retention policy documented.
- [ ] Incident Response plan documented.

## Deployment
- [ ] Vercel/Production environment variables populated.
- [ ] Supabase production migrations applied.
- [ ] Health check monitor active.

## Post-Launch
- [ ] Verify first 10 user OAuth completions.
- [ ] Monitor analytics for `scan_started` vs `scan_completed`.
- [ ] Audit logs for any classification drift.

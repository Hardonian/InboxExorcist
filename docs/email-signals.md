# Email Signals Reference

## Signal Registry

All signals are defined in `src/lib/intelligence/email-signals.ts` and registered with the shared-intelligence signal registry.

### Positive Signals (indicate promotional/noisy sender)

| Signal ID | Weight | Description |
|-----------|--------|-------------|
| `email:list-unsubscribe` | +25 | List-Unsubscribe header exists |
| `email:high-frequency` | +20 | High send frequency (8+ messages) |
| `email:moderate-frequency` | +10 | Moderate send frequency (4-7 messages) |
| `email:promo-language` | +15 | Promotional language detected in subject/domain |
| `email:gmail-promotions` | +10 | Gmail categorized as CATEGORY_PROMOTIONS |
| `email:no-reply-pattern` | +10 | No-reply or mailer sender pattern |
| `email:bulk-headers` | +10 | Bulk/list headers present (List-ID, Precedence) |
| `email:newsletter-digest` | +5 | Newsletter or digest pattern |
| `email:one-click-unsubscribe` | +5 | List-Unsubscribe-Post: One-Click |
| `email:precedence-bulk` | +5 | Precedence: bulk/list header |
| `email:auto-submitted` | +5 | Auto-Submitted header present |
| `email:x-mailer-bulk` | +5 | X-Mailer indicates bulk service (Mailchimp, SendGrid, SES, Postmark) |

### Negative Signals (indicate protected/safe sender)

| Signal ID | Weight | Description |
|-----------|--------|-------------|
| `email:allowlist` | -50 | User allowlisted domain |
| `email:financial-protected` | -40 | Financial or tax sender |
| `email:security-protected` | -40 | Account security sender |
| `email:transactional-protected` | -30 | Transactional sender (receipts, invoices, shipping) |
| `email:institution-protected` | -30 | Healthcare, legal, school, employer, or government sender |
| `email:personal-reply` | -30 | Recent human reply or engagement signal |

## Classification Thresholds

| Score Range | Classification | Action |
|-------------|---------------|--------|
| 80-100 | PROMOTIONAL_HIGH_CONFIDENCE / NEWSLETTER_HIGH_CONFIDENCE | QUIET_BY_FILTER / UNSUBSCRIBE_THEN_FILTER |
| 50-79 | UNKNOWN_REVIEW | REVIEW |
| 0-49 | UNKNOWN_REVIEW / *_SAFE_SKIP | SKIP |

## Protected Sender Override

Any of these conditions force a SKIP regardless of score:
- Financial/tax keywords or domains (paypal.com, stripe.com, etc.)
- Security keywords or domains (accounts.google.com, etc.)
- Transactional keywords (receipt, invoice, shipping, etc.)
- Institution keywords (health, legal, gov, school, etc.)
- Personal reply detection
- User allowlist match

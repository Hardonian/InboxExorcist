# Model Spec

InboxExorcist MVP uses deterministic classification only. No external AI model is used for inbox content.

## Inputs

- Sender domain
- Sender display name
- Hashed sender email
- Gmail labels/categories
- Frequency count
- List-Unsubscribe presence
- List-ID, Precedence, Auto-Submitted headers
- Limited subject hints during in-memory classification only
- User allowlist/blocklist

## Output Labels

- `PROMOTIONAL_HIGH_CONFIDENCE`
- `NEWSLETTER_HIGH_CONFIDENCE`
- `TRANSACTIONAL_SAFE_SKIP`
- `FINANCIAL_SAFE_SKIP`
- `ACCOUNT_SECURITY_SAFE_SKIP`
- `PERSONAL_SAFE_SKIP`
- `UNKNOWN_REVIEW`

## Thresholds

- 80+ eligible for one-click quiet
- 50-79 review bucket
- Below 50 skip

## Safety Rule

Protected sender rules override growth goals. Financial, government, healthcare, legal, school, employer, password/login/2FA, receipts, invoices, shipping, personal-looking, allowlisted, and recently engaged senders are skipped or reviewed.

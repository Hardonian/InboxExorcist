# Classification Model Specification (v1)

This document specifies the deterministic classification logic used by InboxExorcist to identify and score email senders.

## Architecture

The InboxExorcist Intelligence Engine uses a multi-pass scoring system to categorize senders. It prioritizes safety and user intent, following a "Fail-Keep" principle for critical communications.

### 1. Safety Pass (High Priority)

The engine first evaluates messages against a library of `SafetyRule` objects.

- **FORCE_KEEP**: Sets the score to 100 and immediately flags the sender as `keep`. Used for 2FA, fraud alerts, and government communications.
- **PROTECT**: Adds a +50 score boost. Used for bank statements, medical reminders, and utility bills.

### 2. Pattern Match Pass

Analyzes the sender's domain and name fragments against `SenderPattern` datasets.

- **Domain Match**: High-precision matching for known bulk domains (e.g., `*@marketing.brand.com`).
- **Fragment Match**: Substring matching for sender names (e.g., "Newsletter").
- **Multipliers**: Scores are adjusted based on category-specific multipliers (e.g., `security` = 2.5x, `promotional` = 0.5x).

### 3. Header Heuristics

Analyzes technical headers for non-content signals:

- `List-Unsubscribe`: Presence indicates automated mail (-10 weight).
- `Re:` prefix: Indicates a thread, likely personal (+25 weight).
- `Priority: urgent`: Technical priority flags (+30 weight).

### 4. Edge Case Engine

Heuristic-based detection for specific scenarios that might slip through patterns:

- **OTP Detection**: Looks for 4-8 digit codes in the body combined with "code" or "otp" in the subject.
- **Calendar Invites**: Detects `.ics` attachments and calendar content types.

## Scoring Thresholds

| Threshold        | Score Range | Action                   |
|------------------|-------------|--------------------------|
| Junk             | <= -40      | Recommended for Quieting |
| Review           | -40 to 30   | Flagged for user review  |
| Keep             | >= 30       | Safe to stay in Inbox    |
| Immediate Junk   | <= -80      | Auto-quiet (optional)    |
| Immediate Keep   | >= 90       | Whitelisted              |

## Taxonomy

- `PROMOTIONAL_HIGH_CONFIDENCE`: Marketing mail with clear unsubscribe headers.
- `NEWSLETTER_HIGH_CONFIDENCE`: Periodic publications.
- `TRANSACTIONAL_SAFE_SKIP`: Order confirmations, shipping updates.
- `FINANCIAL_SAFE_SKIP`: Bank statements, invoices.
- `ACCOUNT_SECURITY_SAFE_SKIP`: 2FA, password resets.
- `PERSONAL_SAFE_SKIP`: Direct 1:1 communication.
- `UNKNOWN_REVIEW`: Low-confidence matches requiring human input.

## Data Invariants

1. **Determinism**: The same input (headers + metadata) must produce the same score and category.
2. **No Body Persistence**: Email bodies are processed in-memory for edge-case detection (like OTP) but are NEVER stored in the database.
3. **Anonymity**: Senders are identified via salted SHA-256 hashes in production logs to protect user social graphs.

# Model Specification: InboxExorcist Intelligence Engine

## Overview
The InboxExorcist Intelligence Engine is a deterministic, rule-based classification system designed to identify and categorize high-volume email noise (newsletters, promotions, notifications) with high precision.

## Core Components
1. **Safety Rules (`safety_rules.json`)**: Precedence rules that protect critical emails (financial, legal, security, etc.) from being silenced.
2. **Sender Patterns (`sender_patterns.json`)**: A database of known high-volume senders with associated risk scores and categories.
3. **Edge Case Heuristics (`edge_cases.json`)**: Specialized logic for complex scenarios (OTP codes, calendar invites, password resets).
4. **Scoring Engine (`engine.ts`)**: Combines inputs into a final score (0-100) and maps to a discrete Decision.

## Classification Taxonomy
- `PROMOTIONAL_HIGH_CONFIDENCE`: Marketing mail with clear unsubscribe headers.
- `NEWSLETTER_HIGH_CONFIDENCE`: Periodic publications.
- `TRANSACTIONAL_SAFE_SKIP`: Order confirmations, shipping updates.
- `FINANCIAL_SAFE_SKIP`: Bank statements, invoices.
- `ACCOUNT_SECURITY_SAFE_SKIP`: 2FA, password resets.
- `PERSONAL_SAFE_SKIP`: Direct 1:1 communication.
- `UNKNOWN_REVIEW`: Low-confidence matches requiring human input.

## Decision Logic
- **Junk Threshold (<= 40)**: Eligible for "Quieting".
- **Keep Threshold (>= 80)**: Guaranteed to stay in the primary inbox.
- **Review Range (41-79)**: Flags the sender for user review.

## Determinism Invariants
- No external AI API calls for classification.
- No time-based scoring variance.
- Hash-based sender identification.

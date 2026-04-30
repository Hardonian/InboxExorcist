# Growth Metrics Dashboard

InboxExorcist tracks these core metrics to measure product-market fit, user activation, and retention.

## Activation Metrics

### Activation Rate
**Definition**: Percentage of landing page visitors who complete a successful scan.

**Formula**: `oauth_success / landing_view * 100`

**Target**: > 25%

**Events**: `landing_view`, `oauth_start`, `oauth_success`

**Segmentation**:
- By traffic source (organic, paid, referral, TikTok)
- By UTM campaign
- By device (mobile vs desktop)

### Scan Completion Rate
**Definition**: Percentage of connected users who complete at least one scan.

**Formula**: `scan_completed / oauth_success * 100`

**Target**: > 70%

**Events**: `oauth_success`, `scan_started`, `scan_completed`

**What lowers this**:
- Long scan times
- Confusing preview UI
- Scope upgrade friction (scan_only -> full)

## Engagement Metrics

### Quiet Preview Viewed Rate
**Definition**: Percentage of scan completers who view the preview page.

**Formula**: `quiet_preview_viewed / scan_completed * 100`

**Target**: > 80%

### Quiet Action Rate
**Definition**: Percentage of preview viewers who take quiet action on at least one sender.

**Formula**: `quiet_action_completed / quiet_preview_viewed * 100`

**Target**: > 50%

**Events**: `quiet_preview_viewed`, `quiet_action_started`, `quiet_action_completed`

**What lowers this**:
- Too few candidates found
- Candidates not clearly explained
- Trust concerns about the action

### Undo Rate
**Definition**: Percentage of quiet action completers who undo at least one action.

**Formula**: `undo_clicked / quiet_action_completed * 100`

**Target**: < 15% (low undo rate = high confidence in classification)

**Events**: `quiet_action_completed`, `undo_clicked`

**What raises this**:
- False positives in classification
- Unclear preview explanations
- Users testing reversibility (positive signal)

## Growth Metrics

### Referral / Share Rate
**Definition**: Percentage of quiet action completers who use the share feature.

**Formula**: `share_clicked / quiet_action_completed * 100`

**Target**: > 10%

**Events**: `quiet_action_completed`, share interaction (custom event)

### Viral Coefficient
**Definition**: Average number of new users generated per existing user through sharing.

**Formula**: `new_users_from_shares / total_shares`

**Target**: > 0.1 (each 10 users generates 1 new user)

## Monetization Metrics

### Paid Conversion Rate
**Definition**: Percentage of active users who start a payment flow.

**Formula**: `payment_started / active_users * 100`

**Target**: > 3% (when payments enabled)

**Events**: `payment_started`

**Active Users Definition**: Users who completed a scan in the last 30 days.

## Metric Definitions Table

| Metric | Formula | Target | Primary Events |
|--------|---------|--------|----------------|
| Activation Rate | oauth_success / landing_view | > 25% | landing_view, oauth_success |
| Scan Completion | scan_completed / oauth_success | > 70% | oauth_success, scan_completed |
| Preview Viewed | quiet_preview_viewed / scan_completed | > 80% | scan_completed, quiet_preview_viewed |
| Quiet Action | quiet_action_completed / quiet_preview_viewed | > 50% | quiet_preview_viewed, quiet_action_completed |
| Undo Rate | undo_clicked / quiet_action_completed | < 15% | quiet_action_completed, undo_clicked |
| Share Rate | share_clicked / quiet_action_completed | > 10% | quiet_action_completed, share |
| Paid Conversion | payment_started / active_users | > 3% | payment_started |

## Dashboard Layout

```
┌─────────────────┬─────────────────┬─────────────────┐
│  Activation     │  Engagement     │  Growth         │
│  Rate: 28%      │  Quiet Rate: 55%│  Share Rate: 12%│
│  ▲ 3% vs last   │  ▲ 5% vs last   │  ▲ 2% vs last   │
├─────────────────┼─────────────────┼─────────────────┤
│  Scan Complete  │  Undo Rate      │  Paid Conv      │
│  Rate: 74%      │  Rate: 8%       │  Rate: 3.2%     │
│  ▲ 1% vs last   │  ▼ 2% vs last   │  ▲ 0.5% vs last │
└─────────────────┴─────────────────┴─────────────────┘
```

## Alerts

| Metric | Threshold | Action |
|--------|-----------|--------|
| Activation Rate | < 15% | Review landing page and OAuth flow |
| Scan Completion | < 50% | Investigate scan errors and UX friction |
| Quiet Action Rate | < 30% | Review candidate clarity and trust signals |
| Undo Rate | > 25% | Review classification accuracy |
| Quiet Action Rate | > 90% | Verify not auto-selecting protected senders |

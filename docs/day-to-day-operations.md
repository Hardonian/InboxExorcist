# Day-to-Day Operations Runbook

## Daily Metrics Review (15 minutes)

### Morning Check
1. **Activation rate** — Did it drop below 20%? If yes, check:
   - OAuth error logs
   - Landing page load times
   - Recent deployments

2. **Scan completion rate** — Below 60%? Check:
   - Gmail API quota usage
   - Error rates on `/api/gmail/scan`
   - Connection failure patterns

3. **Quiet action rate** — Below 40%? Check:
   - Preview page load times
   - Candidate count distribution (too few?)
   - Recent classification changes

4. **Undo rate** — Above 20%? Check:
   - Classification accuracy on undone senders
   - Which sender types are being undone
   - Preview explanation clarity

5. **Share rate** — Below 5%? Check:
   - Share screen visibility
   - Copy text quality
   - Social sharing button functionality

### Where to Check
- Analytics dashboard (if configured)
- Server logs (redacted)
- Error tracking service
- Database aggregate queries

## Bug Triage

### Triage Process
1. **Check severity**:
   - P0: Data loss, cross-user access, token exposure → escalate immediately
   - P1: Core flow broken (scan, quiet, undo) → fix within 4 hours
   - P2: UI bug, non-critical API error → fix within 24 hours
   - P3: Cosmetic, analytics gap → next sprint

2. **Reproduce**:
   - Use `/demo` page for UI bugs
   - Use test Gmail account for API bugs
   - Check if bug affects all users or specific segments

3. **Fix**:
   - Write test first
   - Implement fix
   - Run `npm run verify` before deploying

### Common Bugs
| Bug | Likely Cause | Fix |
|-----|-------------|-----|
| Scan fails | Gmail quota exceeded | Wait for quota reset, reduce maxMessages |
| Quiet fails | Filter creation error | Check Gmail filter limit (max 1000) |
| Undo partial | Filter already deleted | Normal; mark as partial undo |
| OAuth loop | Cookie not set | Check SESSION_SECRET, secure flag |
| Preview empty | No promo senders found | Normal for clean inboxes |

## Gmail Quota Checks

### Daily Quota Monitoring
Gmail API has per-user and per-project quotas:

| Quota | Limit | Monitoring |
|-------|-------|------------|
| Requests per user per second | 250 | Track via Google Cloud Console |
| Requests per project per second | 1,000,000,000 | Track via Google Cloud Console |
| Messages.list | Rate-limited | Monitor scan error rates |
| Messages.get (metadata) | Rate-limited | Monitor scan error rates |

### What to Do When Quota Is Hit
1. **Immediate**: Return degraded response with retry-after guidance
2. **Short-term**: Reduce `maxMessages` default from 250 to 100
3. **Long-term**: Request quota increase via Google Cloud Console

### Quota-Friendly Optimizations
- Batch message header requests where possible
- Cache label lookups (labels rarely change)
- Use `messages.list` with `fields=messages(id)` to minimize response size
- Paginate scans instead of loading all at once

## Failed Action Review

### Daily Review
1. Query `sender_actions` table for `result = 'FILTER_CREATION_FAILED'`
2. Check `warnings` in quiet action responses
3. Review `unsubscribe_attempts` for `result = 'blocked'` or `result = 'failed'`

### Common Failure Patterns
| Failure | Cause | Resolution |
|---------|-------|------------|
| Filter creation fails | Gmail filter limit reached | User needs to delete old filters |
| Unsubscribe blocked | SSRF validation | Working as designed; inform user |
| Undo partial | Filter already manually deleted | Normal; no action needed |
| Scan degraded | Gmail API timeout | Retry with smaller maxMessages |

## Creator Posting Cadence

### TikTok
- **Frequency**: 1-2 posts per day
- **Best times**: 12-3 PM, 7-10 PM (user's timezone)
- **Content mix**:
  - 40% demo/educational (show the tool working)
  - 30% relatable/humor (inbox anxiety memes)
  - 20% before/after transformations
  - 10% privacy/trust building

### Weekly Content Calendar
| Day | Content Type | Example |
|-----|-------------|---------|
| Monday | Demo | "Watch me exorcise 143 junk senders in 60 seconds" |
| Tuesday | Relatable | "POV: Your inbox has 2,000 unread emails" |
| Wednesday | Before/After | Split screen: chaotic inbox vs clean inbox |
| Thursday | Privacy | "Here's exactly what data we access (spoiler: minimal)" |
| Friday | UGC/Reply | Reply to a comment with a video demo |
| Weekend | Trending | Adapt trending audio to inbox theme |

## Content Testing Loop

### A/B Testing Framework
1. **Test one variable per video**:
   - Hook (first 3 seconds)
   - CTA placement
   - Visual style (screen recording vs talking head)
   - Length (15s vs 30s vs 60s)

2. **Measure**:
   - View-through rate at 3 seconds
   - Completion rate
   - Click-through rate to landing page
   - Activation rate from that video's traffic

3. **Iterate**:
   - Keep winning hooks, test new bodies
   - Keep winning bodies, test new hooks
   - Double down on content types with > 25% activation

### Hook Testing Matrix
Test these hook categories weekly:
- Pain point: "Your inbox is drowning in junk"
- Curiosity: "I found something hiding in your Gmail"
- Result: "I quieted 143 senders in 60 seconds"
- Privacy: "This app reads your inbox without reading your emails"
- Social proof: "X people exorcised their inbox this week"

## Privacy/Support Review

### Weekly Privacy Check
1. **Log audit**: Search logs for any unredacted tokens, emails, or message IDs
2. **Scope review**: Verify no new endpoints request broader Gmail scopes
3. **Data retention**: Confirm deletion requests are processed within 24 hours
4. **Token rotation**: Verify TOKEN_ENCRYPTION_KEY hasn't been exposed in logs

### Support Review
1. **Common questions**: What are users asking most?
2. **Friction points**: Where do users get stuck?
3. **Trust signals**: Are privacy concerns being addressed?
4. **Feature requests**: What do users want that aligns with our scope?

### Monthly Security Review
1. Review all OAuth scope usage
2. Verify encryption keys are not in logs
3. Test disconnect flow (token revocation)
4. Test data deletion flow
5. Review ownership boundary tests pass
6. Check for new Gmail API deprecation notices

### Incident Response Readiness
- Keep [docs/incident-response.md](incident-response.md) bookmarked
- Test severity classification quarterly
- Maintain updated contact list for escalation
- Practice token rotation procedure

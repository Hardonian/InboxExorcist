# Privacy Policy

**Last updated:** April 30, 2026

## What InboxExorcist Does

InboxExorcist connects to your Gmail account, scans email headers to identify promotional and bulk senders, and creates reversible labels and filters to quiet future noise. It does not delete your emails by default.

## What Data We Access

### During Scanning
We read only Gmail message **metadata and headers**:
- From/Sender addresses
- List-Unsubscribe headers
- List-ID headers
- Subject lines (for classification hints only)
- Label assignments (e.g., Promotions category)

We do **not** read:
- Full email message bodies
- Email attachments
- Email content beyond header metadata
- Contact lists
- Calendar data
- Drive files

### What We Store
| Data | How Stored | Purpose |
|------|-----------|---------|
| User ID | Internal UUID | Session management |
| Gmail email | Encrypted (AES-256-GCM) | Account identification |
| Sender emails | Hashed (HMAC-SHA256) | Classification, not reversible |
| Sender domains | Plaintext | Display in preview |
| Sender display names | Encrypted (AES-256-GCM) | Display in preview |
| OAuth tokens | Encrypted (AES-256-GCM) | Maintain Gmail connection |
| Scan results | Plaintext (domains, counts) | Preview candidates |
| Action logs | Plaintext (domains, timestamps) | Audit trail, undo |
| Gmail filter IDs | Plaintext | Reversible undo |

### What We Never Store
- Full email message bodies
- Email attachments
- Email snippets (beyond classification-relevant headers)
- Raw unsubscribe URLs with embedded tokens
- Your Gmail password
- Any data from non-Google services

## What We Do With Your Data

### We Do
- Use sender metadata to classify promotional vs. important senders
- Store encrypted tokens to maintain your Gmail connection
- Create Gmail filters and labels (only after your explicit confirmation)
- Maintain an audit log of every action for transparency and undo

### We Do Not
- Sell, rent, or share your inbox data with any third party
- Train AI models on your email content
- Send marketing emails on your behalf without consent
- Access your emails after you disconnect
- Retain data after you request deletion

## How We Protect Your Data

- **Encryption at rest**: OAuth tokens and Gmail account email are encrypted with AES-256-GCM
- **Hashing**: Sender email addresses are hashed with HMAC-SHA256 (one-way, not reversible)
- **Secure sessions**: Signed cookies with HttpOnly, Secure, and SameSite=Lax flags
- **SSRF protection**: Unsubscribe URLs are validated against private/internal targets
- **Least-privilege access**: We request the minimum Gmail scopes needed and support incremental authorization

## Your Rights

### Disconnect Anytime
You can disconnect your Gmail account at any time from Settings. This revokes our OAuth token and removes our access to your Gmail account.

### Delete Your Data
You can request complete deletion of all your data from Settings or by calling `POST /api/me/delete-data`. This removes:
- All scan records
- All sender candidates
- All action logs
- All filter records
- All unsubscribe attempt records
- All audit events
- Your user record

Gmail filters and labels created by InboxExorcist remain in your Gmail account until you undo them or remove them manually.

### Undo Actions
Every quiet action is reversible. You can undo individual actions or all actions from the Action History page.

## Data Retention

Your data is retained until you:
1. Delete your data via Settings
2. Disconnect your Gmail account (removes connection data)
3. Request deletion via support

We do not impose automatic deletion timelines. You control your data lifecycle.

## Children's Privacy

InboxExorcist is not intended for users under 13. We do not knowingly collect data from children.

## Changes to This Policy

We will notify users of material changes to this privacy policy. Continued use after changes constitutes acceptance.

## Contact

For privacy questions or data requests, contact the repository owner through the project repository.

## Google API Services Disclosure

InboxExorcist uses Google API services to access Gmail data. Our use of data obtained from Google APIs is limited to:
- Identifying promotional senders in your Gmail account
- Creating reversible filters and labels to quiet future messages

We comply with the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including:
- Limited use requirements
- Transparency obligations
- User consent and control
- Security safeguards

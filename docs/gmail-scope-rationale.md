# Gmail Scope Rationale

InboxExorcist uses the narrowest viable scopes for the promised one-click quieting flow.

## `openid email profile`

Used to identify the connected Google account and display/account-link the Gmail connection. The email value is encrypted before storage.

## `https://www.googleapis.com/auth/gmail.modify`

Needed because the product must search recent Gmail messages, fetch metadata headers, create/apply labels, and archive existing messages after confirmation. `gmail.metadata` is not enough for the full flow because the app needs search behavior and message label modification.

InboxExorcist does not delete messages by default.

## `https://www.googleapis.com/auth/gmail.settings.basic`

Needed to create Gmail filters that skip the inbox and apply the `InboxExorcist/Quieted` label for future messages.

## Optional `https://www.googleapis.com/auth/gmail.send`

Only requested when `GMAIL_ENABLE_MAILTO_UNSUBSCRIBE=true`. It is for standards-based mailto unsubscribe only after explicit product consent. It is disabled by default in the MVP UI.

import { registerSignals } from "@inbox-exorcist/shared-intelligence/signals";
import type { Signal } from "@inbox-exorcist/shared-intelligence/types";

export const emailSignals: Signal[] = [
  { id: "email:list-unsubscribe", type: "positive", weight: 25, description: "List-Unsubscribe header exists", category: "email" },
  { id: "email:high-frequency", type: "positive", weight: 20, description: "High send frequency (8+)", category: "email" },
  { id: "email:moderate-frequency", type: "positive", weight: 10, description: "Moderate send frequency (4-7)", category: "email" },
  { id: "email:promo-language", type: "positive", weight: 15, description: "Promotional language detected", category: "email" },
  { id: "email:gmail-promotions", type: "positive", weight: 10, description: "Gmail promotional category", category: "email" },
  { id: "email:no-reply-pattern", type: "positive", weight: 10, description: "No-reply or mailer sender pattern", category: "email" },
  { id: "email:bulk-headers", type: "positive", weight: 10, description: "Bulk/list headers present", category: "email" },
  { id: "email:financial-protected", type: "negative", weight: -40, description: "Financial or tax sender", category: "email" },
  { id: "email:security-protected", type: "negative", weight: -40, description: "Account security sender", category: "email" },
  { id: "email:transactional-protected", type: "negative", weight: -30, description: "Transactional sender", category: "email" },
  { id: "email:institution-protected", type: "negative", weight: -30, description: "Healthcare, legal, school, employer, or government sender", category: "email" },
  { id: "email:personal-reply", type: "negative", weight: -30, description: "Recent human reply or engagement signal", category: "email" },
  { id: "email:allowlist", type: "negative", weight: -50, description: "User allowlisted domain", category: "email" },
  { id: "email:newsletter-digest", type: "positive", weight: 5, description: "Newsletter or digest pattern", category: "email" },
  { id: "email:one-click-unsubscribe", type: "positive", weight: 5, description: "List-Unsubscribe-Post: One-Click", category: "email" },
  { id: "email:precedence-bulk", type: "positive", weight: 5, description: "Precedence: bulk/list header", category: "email" },
  { id: "email:auto-submitted", type: "positive", weight: 5, description: "Auto-Submitted header present", category: "email" },
  { id: "email:x-mailer-bulk", type: "positive", weight: 5, description: "X-Mailer indicates bulk service", category: "email" },
];

export function registerEmailSignals(): void {
  registerSignals(emailSignals);
}

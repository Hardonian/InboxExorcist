import { computeScore, clampScore } from "@inbox-exorcist/shared-intelligence/scoring";
import { calculateConfidence } from "@inbox-exorcist/shared-intelligence/confidence";
import { createEvidence } from "@inbox-exorcist/shared-intelligence/evidence";
import type { Signal, EvidenceItem, ConfidenceResult, ScoringResult } from "@inbox-exorcist/shared-intelligence/types";
import type { Classification, ProposedAction } from "../domain.ts";
import { emailSignals } from "../intelligence/email-signals.ts";

export type SenderEvidence = {
  senderDomain: string;
  senderEmail?: string;
  senderDisplayName?: string;
  messageCount: number;
  hasListUnsubscribe: boolean;
  hasOneClickUnsubscribe: boolean;
  unsubscribeMethods: Array<"https" | "mailto">;
  bulkHeaders: boolean;
  precedenceHeader?: string;
  autoSubmittedHeader?: string;
  xMailer?: string;
  labelIds: string[];
  subjectHints?: string[];
  allowlistedDomains?: string[];
  userEngaged?: boolean;
  recentHumanReply?: boolean;
};

export type ClassificationResult = {
  classification: Classification;
  score: number;
  reasons: string[];
  proposedAction: ProposedAction;
  selectedByDefault: boolean;
  protectedReason?: string;
  signals: Signal[];
  evidence: EvidenceItem[];
  confidence: ConfidenceResult;
};

const financialTerms = [
  "bank", "credit", "card", "paypal", "stripe", "square", "venmo",
  "amex", "visa", "mastercard", "discover", "capitalone", "chase",
  "citi", "wellsfargo", "intuit", "quickbooks", "tax", "irs",
];

const healthcareLegalGovTerms = [
  "health", "clinic", "hospital", "mychart", "pharmacy",
  "legal", "law", "court", "gov", "government", "school",
  "university", "college", "employer", "workday",
];

const securityTerms = [
  "password", "reset", "login", "2fa", "mfa", "verification",
  "verify", "security", "alert", "suspicious",
];

const transactionalTerms = [
  "receipt", "invoice", "order", "shipping", "delivered", "tracking",
  "statement", "payment", "refund", "appointment", "reservation", "ticket",
];

const promoTerms = [
  "sale", "discount", "deal", "coupon", "newsletter", "offer", "promo",
  "promotion", "digest", "weekly", "product update", "launch", "clearance", "limited time",
];

const financialSenderDomains = new Set([
  "paypal.com", "stripe.com", "square.com", "venmo.com",
]);

const securitySenderDomains = new Set([
  "accounts.google.com", "login.microsoftonline.com", "amazonaws.com",
]);

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function normalizeEvidenceText(evidence: SenderEvidence) {
  return [
    evidence.senderDomain,
    evidence.senderEmail,
    evidence.senderDisplayName,
    ...(evidence.subjectHints || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function findSignal(id: string): Signal {
  const s = emailSignals.find((sig: Signal) => sig.id === id);
  if (!s) throw new Error(`Signal not found: ${id}`);
  return s;
}

function buildSignals(evidence: SenderEvidence, text: string): Signal[] {
  const signals: Signal[] = [];
  const isAllowlisted = evidence.allowlistedDomains?.some(
    (domain) =>
      evidence.senderDomain === domain ||
      evidence.senderDomain.endsWith(`.${domain}`),
  );

  if (evidence.hasListUnsubscribe) {
    signals.push(findSignal("email:list-unsubscribe"));
  }

  if (evidence.hasOneClickUnsubscribe) {
    signals.push(findSignal("email:one-click-unsubscribe"));
  }

  if (evidence.messageCount >= 8) {
    signals.push(findSignal("email:high-frequency"));
  } else if (evidence.messageCount >= 4) {
    signals.push(findSignal("email:moderate-frequency"));
  }

  if (includesAny(text, promoTerms)) {
    signals.push(findSignal("email:promo-language"));
  }

  if (evidence.labelIds.includes("CATEGORY_PROMOTIONS")) {
    signals.push(findSignal("email:gmail-promotions"));
  }

  if (/no-?reply|donotreply|do-not-reply|mailer/.test(text)) {
    signals.push(findSignal("email:no-reply-pattern"));
  }

  if (evidence.bulkHeaders) {
    signals.push(findSignal("email:bulk-headers"));
  }

  if (evidence.precedenceHeader && /bulk|list/i.test(evidence.precedenceHeader)) {
    signals.push(findSignal("email:precedence-bulk"));
  }

  if (evidence.autoSubmittedHeader && /auto/i.test(evidence.autoSubmittedHeader)) {
    signals.push(findSignal("email:auto-submitted"));
  }

  if (evidence.xMailer && /mailchimp|sendgrid|ses|postmark/i.test(evidence.xMailer.toLowerCase())) {
    signals.push(findSignal("email:x-mailer-bulk"));
  }

  const textWithDomain = `${text} ${evidence.senderDomain}`.toLowerCase();

  if (includesAny(textWithDomain, financialTerms) || financialSenderDomains.has(evidence.senderDomain)) {
    signals.push(findSignal("email:financial-protected"));
  }

  if (includesAny(textWithDomain, securityTerms) || securitySenderDomains.has(evidence.senderDomain)) {
    signals.push(findSignal("email:security-protected"));
  }

  if (includesAny(textWithDomain, transactionalTerms)) {
    signals.push(findSignal("email:transactional-protected"));
  }

  if (includesAny(textWithDomain, healthcareLegalGovTerms)) {
    signals.push(findSignal("email:institution-protected"));
  }

  if (evidence.recentHumanReply || evidence.userEngaged) {
    signals.push(findSignal("email:personal-reply"));
  }

  if (isAllowlisted) {
    signals.push(findSignal("email:allowlist"));
  }

  if (text.includes("newsletter") || text.includes("digest")) {
    signals.push(findSignal("email:newsletter-digest"));
  }

  return signals;
}

function buildEvidence(evidence: SenderEvidence): EvidenceItem[] {
  const items: EvidenceItem[] = [];

  if (evidence.hasListUnsubscribe) {
    items.push(createEvidence("header", "List-Unsubscribe", "email-header", "high"));
  }
  if (evidence.bulkHeaders) {
    items.push(createEvidence("header", "Bulk headers", "email-header", "medium"));
  }
  if (evidence.labelIds.includes("CATEGORY_PROMOTIONS")) {
    items.push(createEvidence("category", "Gmail Promotions", "gmail-label", "high"));
  }
  if (evidence.messageCount >= 8) {
    items.push(createEvidence("frequency", `High: ${evidence.messageCount} messages`, "scan", "medium"));
  }

  return items;
}

export function classifySender(evidence: SenderEvidence): ClassificationResult {
  const text = normalizeEvidenceText(evidence);
  const signals = buildSignals(evidence, text);
  const evidenceItems = buildEvidence(evidence);

  const scoringResult: ScoringResult = computeScore({
    signals,
    baseScore: 0,
    minScore: 0,
    maxScore: 100,
  });

  const clampedScore = clampScore(scoringResult.score);
  const confidence = calculateConfidence(clampedScore, scoringResult.breakdown);

  const reasons = scoringResult.breakdown;

  const isAllowlisted = evidence.allowlistedDomains?.some(
    (domain) =>
      evidence.senderDomain === domain ||
      evidence.senderDomain.endsWith(`.${domain}`),
  );

  const textWithDomain = `${text} ${evidence.senderDomain}`.toLowerCase();

  const isFinancial = includesAny(textWithDomain, financialTerms) || financialSenderDomains.has(evidence.senderDomain);
  const isSecurity = includesAny(textWithDomain, securityTerms) || securitySenderDomains.has(evidence.senderDomain);
  const isTransactional = includesAny(textWithDomain, transactionalTerms);
  const isInstitution = includesAny(textWithDomain, healthcareLegalGovTerms);
  const isPersonal = evidence.recentHumanReply || evidence.userEngaged;

  let protectedReason: string | undefined;
  let classification: Classification | undefined;

  if (isFinancial) {
    protectedReason = "Financial or tax sender";
    classification = "FINANCIAL_SAFE_SKIP";
  }

  if (isSecurity) {
    protectedReason = protectedReason || "Account security sender";
    classification = "ACCOUNT_SECURITY_SAFE_SKIP";
  }

  if (isTransactional) {
    protectedReason = protectedReason || "Transactional sender";
    classification = classification || "TRANSACTIONAL_SAFE_SKIP";
  }

  if (isInstitution) {
    protectedReason = protectedReason || "Healthcare, legal, school, employer, or government sender";
    classification = classification || "UNKNOWN_REVIEW";
  }

  if (isPersonal) {
    protectedReason = protectedReason || "Recent human engagement";
    classification = "PERSONAL_SAFE_SKIP";
  }

  if (isAllowlisted) {
    protectedReason = protectedReason || "User allowlist";
    classification = "PERSONAL_SAFE_SKIP";
  }

  let proposedAction: ProposedAction;
  let selectedByDefault = false;

  if (protectedReason) {
    proposedAction = clampedScore >= 50 ? "REVIEW" : "SKIP";
    selectedByDefault = false;
  } else if (clampedScore >= 80) {
    const isNewsletter = text.includes("newsletter") || text.includes("digest");
    classification = isNewsletter
      ? "NEWSLETTER_HIGH_CONFIDENCE"
      : "PROMOTIONAL_HIGH_CONFIDENCE";
    proposedAction = evidence.hasListUnsubscribe
      ? "UNSUBSCRIBE_THEN_FILTER"
      : "QUIET_BY_FILTER";
    selectedByDefault = true;
  } else if (clampedScore >= 50) {
    classification = "UNKNOWN_REVIEW";
    proposedAction = "REVIEW";
    selectedByDefault = false;
  } else {
    classification = "UNKNOWN_REVIEW";
    proposedAction = "SKIP";
    selectedByDefault = false;
  }

  return {
    classification: classification || "UNKNOWN_REVIEW",
    score: clampedScore,
    reasons,
    proposedAction,
    selectedByDefault,
    protectedReason,
    signals,
    evidence: evidenceItems,
    confidence,
  };
}

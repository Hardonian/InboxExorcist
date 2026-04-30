import test from "node:test";
import assert from "node:assert/strict";

import type { Classification, ProposedAction, SenderCandidate } from "../../src/lib/domain.ts";
import { classifySender } from "../../src/lib/classification/classifier.ts";
import { selectedQuietCandidates } from "../../src/lib/services/action-planner.ts";

test("financial senders are never auto-selected", () => {
  const bank = classifySender({
    senderDomain: "chase.com",
    senderEmail: "alerts@chase.com",
    messageCount: 15,
    hasListUnsubscribe: true,
    unsubscribeMethods: ["https"],
    bulkHeaders: true,
    labelIds: ["CATEGORY_PROMOTIONS"],
    subjectHints: ["Your credit card statement is ready sale discount"],
  });

  assert.ok(bank.protectedReason, "Bank sender should be protected");
  assert.equal(bank.selectedByDefault, false);
  assert.ok(
    bank.classification.includes("SAFE") || bank.classification === "UNKNOWN_REVIEW",
    "Classification should be safe or review",
  );
});

test("security password reset senders are never auto-selected", () => {
  const security = classifySender({
    senderDomain: "auth.example.com",
    senderEmail: "security@auth.example.com",
    messageCount: 20,
    hasListUnsubscribe: true,
    unsubscribeMethods: ["https"],
    bulkHeaders: true,
    labelIds: ["CATEGORY_PROMOTIONS"],
    subjectHints: ["Password reset verification code"],
  });

  assert.ok(security.protectedReason, "Security sender should be protected");
  assert.equal(security.selectedByDefault, false);
  assert.equal(security.classification, "ACCOUNT_SECURITY_SAFE_SKIP");
});

test("healthcare senders are never auto-selected", () => {
  const health = classifySender({
    senderDomain: "mychart.hospital.org",
    senderEmail: "noreply@mychart.hospital.org",
    messageCount: 10,
    hasListUnsubscribe: true,
    unsubscribeMethods: ["https"],
    bulkHeaders: true,
    labelIds: ["CATEGORY_PROMOTIONS"],
    subjectHints: ["Your appointment reminder newsletter"],
  });

  assert.ok(health.protectedReason, "Healthcare sender should be protected");
  assert.equal(health.selectedByDefault, false);
});

test("legal and government senders are never auto-selected", () => {
  const legal = classifySender({
    senderDomain: "court.gov",
    senderEmail: "notices@court.gov",
    messageCount: 5,
    hasListUnsubscribe: true,
    unsubscribeMethods: ["https"],
    bulkHeaders: true,
    labelIds: ["CATEGORY_PROMOTIONS"],
    subjectHints: ["Court date reminder"],
  });

  assert.ok(legal.protectedReason, "Government sender should be protected");
  assert.equal(legal.selectedByDefault, false);
});

test("school and employer senders are never auto-selected", () => {
  const school = classifySender({
    senderDomain: "university.edu",
    senderEmail: "registrar@university.edu",
    messageCount: 8,
    hasListUnsubscribe: true,
    unsubscribeMethods: ["https"],
    bulkHeaders: true,
    labelIds: ["CATEGORY_PROMOTIONS"],
    subjectHints: ["Class schedule update"],
  });

  assert.ok(school.protectedReason, "School sender should be protected");
  assert.equal(school.selectedByDefault, false);
});

test("transactional invoice receipt senders are never auto-selected", () => {
  const transactional = classifySender({
    senderDomain: "shop.example.com",
    senderEmail: "receipts@shop.example.com",
    messageCount: 12,
    hasListUnsubscribe: true,
    unsubscribeMethods: ["https"],
    bulkHeaders: true,
    labelIds: ["CATEGORY_PROMOTIONS"],
    subjectHints: ["Your order receipt shipping tracking"],
  });

  assert.ok(transactional.protectedReason, "Transactional sender should be protected");
  assert.equal(transactional.selectedByDefault, false);
});

test("user allowlisted domains are never auto-selected", () => {
  const allowlisted = classifySender({
    senderDomain: "friend.com",
    senderEmail: "hello@friend.com",
    messageCount: 25,
    hasListUnsubscribe: true,
    unsubscribeMethods: ["https"],
    bulkHeaders: true,
    labelIds: ["CATEGORY_PROMOTIONS"],
    subjectHints: ["Weekly newsletter digest sale"],
    allowlistedDomains: ["friend.com"],
  });

  assert.ok(allowlisted.protectedReason, "Allowlisted sender should be protected");
  assert.equal(allowlisted.selectedByDefault, false);
  assert.equal(allowlisted.classification, "PERSONAL_SAFE_SKIP");
});

test("protected senders are excluded from quiet candidate selection", () => {
  const candidates: SenderCandidate[] = [
    {
      id: "c1",
      scanRunId: "s1",
      userId: "u1",
      senderDomain: "deals.example",
      senderEmailHash: "hash1",
      classification: "PROMOTIONAL_HIGH_CONFIDENCE" as Classification,
      score: 90,
      reasons: ["promo"],
      messageCount: 15,
      proposedAction: "UNSUBSCRIBE_THEN_FILTER" as ProposedAction,
      selectedByDefault: true,
      unsubscribeMethods: ["https"],
      protectedReason: undefined,
      createdAt: new Date().toISOString(),
    },
    {
      id: "c2",
      scanRunId: "s1",
      userId: "u1",
      senderDomain: "bank.example",
      senderEmailHash: "hash2",
      classification: "FINANCIAL_SAFE_SKIP" as Classification,
      score: 85,
      reasons: ["financial"],
      messageCount: 10,
      proposedAction: "SKIP" as ProposedAction,
      selectedByDefault: false,
      unsubscribeMethods: [],
      protectedReason: "Financial or tax sender",
      createdAt: new Date().toISOString(),
    },
  ];

  const selected = selectedQuietCandidates(candidates);

  assert.equal(selected.length, 1);
  assert.equal(selected[0].senderDomain, "deals.example");
  assert.ok(!selected.some((c) => c.protectedReason));
});

test("engagement-protected senders are never auto-selected", () => {
  const engaged = classifySender({
    senderDomain: "newsletter.example",
    senderEmail: "hello@newsletter.example",
    messageCount: 30,
    hasListUnsubscribe: true,
    unsubscribeMethods: ["https"],
    bulkHeaders: true,
    labelIds: ["CATEGORY_PROMOTIONS"],
    subjectHints: ["Weekly digest sale offer"],
    userEngaged: true,
  });

  assert.ok(engaged.protectedReason, "Engaged sender should be protected");
  assert.equal(engaged.selectedByDefault, false);
  assert.equal(engaged.classification, "PERSONAL_SAFE_SKIP");
});

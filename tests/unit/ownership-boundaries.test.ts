import test from "node:test";
import assert from "node:assert/strict";

import { MemoryStore, resetMemoryStoreForTests } from "../../src/lib/storage/memory-store.ts";

test("scan lookup enforces user ownership — user A cannot see user B scan", async () => {
  resetMemoryStoreForTests();
  const store = new MemoryStore();
  await store.createScanRun({
    id: "scan-1",
    userId: "user-a",
    status: "completed",
    query: "q",
    messageCount: 0,
    candidateCount: 0,
    selectedCount: 0,
    skippedCount: 0,
    degraded: false,
    startedAt: new Date().toISOString(),
  });

  assert.ok(await store.getScanRun("scan-1", "user-a"));
  assert.equal(await store.getScanRun("scan-1", "user-b"), null);
});

test("candidate listing enforces user ownership", async () => {
  resetMemoryStoreForTests();
  const store = new MemoryStore();
  await store.saveCandidates([
    {
      id: "c1",
      scanRunId: "scan-1",
      userId: "user-a",
      senderDomain: "deals.example",
      classification: "PROMOTIONAL_HIGH_CONFIDENCE",
      score: 90,
      reasons: [],
      messageCount: 10,
      proposedAction: "UNSUBSCRIBE_THEN_FILTER",
      selectedByDefault: true,
      unsubscribeMethods: ["https"],
      createdAt: new Date().toISOString(),
    },
  ]);

  const userACandidates = await store.listCandidates("scan-1", "user-a");
  const userBCandidates = await store.listCandidates("scan-1", "user-b");

  assert.equal(userACandidates.length, 1);
  assert.equal(userBCandidates.length, 0);
});

test("action listing enforces user ownership", async () => {
  resetMemoryStoreForTests();
  const store = new MemoryStore();
  await store.recordActions({
    actions: [
      {
        id: "action-1",
        userId: "user-a",
        scanRunId: "scan-1",
        senderDomain: "deals.example",
        actionType: "quiet",
        result: "QUIETED_BY_FILTER",
        reversible: true,
        createdAt: new Date().toISOString(),
      },
    ],
  });

  const userAActions = await store.listActions("user-a");
  const userBActions = await store.listActions("user-b");

  assert.equal(userAActions.length, 1);
  assert.equal(userBActions.length, 0);
});

test("filter listing enforces user ownership", async () => {
  resetMemoryStoreForTests();
  const store = new MemoryStore();
  await store.recordActions({
    filters: [
      {
        id: "filter-1",
        userId: "user-a",
        actionId: "action-1",
        senderDomain: "deals.example",
        gmailFilterId: "gf-1",
        gmailLabelId: "label-1",
        labelName: "InboxExorcist/Quieted",
        createdAt: new Date().toISOString(),
      },
    ],
  });

  const userAFilters = await store.listActiveFilters("user-a");
  const userBFilters = await store.listActiveFilters("user-b");

  assert.equal(userAFilters.length, 1);
  assert.equal(userBFilters.length, 0);
});

test("deleteUserData only deletes the requesting user data", async () => {
  resetMemoryStoreForTests();
  const store = new MemoryStore();

  await store.createScanRun({
    id: "scan-a",
    userId: "user-a",
    status: "completed",
    query: "q",
    messageCount: 5,
    candidateCount: 2,
    selectedCount: 1,
    skippedCount: 1,
    degraded: false,
    startedAt: new Date().toISOString(),
  });

  await store.createScanRun({
    id: "scan-b",
    userId: "user-b",
    status: "completed",
    query: "q",
    messageCount: 3,
    candidateCount: 1,
    selectedCount: 0,
    skippedCount: 1,
    degraded: false,
    startedAt: new Date().toISOString(),
  });

  await store.deleteUserData("user-a");

  assert.equal(await store.getScanRun("scan-a", "user-a"), null);
  assert.ok(await store.getScanRun("scan-b", "user-b"));
});

test("connection lookup is scoped to user", async () => {
  resetMemoryStoreForTests();
  const store = new MemoryStore();
  await store.saveConnection({
    id: "conn-a",
    userId: "user-a",
    gmailEmailHash: "hash-a",
    gmailEmailEncrypted: "enc-a",
    encryptedAccessToken: "token-a",
    encryptedRefreshToken: "refresh-a",
    tokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
    scopes: ["gmail.modify"],
    status: "connected",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  assert.ok(await store.getConnection("user-a"));
  assert.equal(await store.getConnection("user-b"), null);
});

test("candidate lookup enforces user ownership", async () => {
  resetMemoryStoreForTests();
  const store = new MemoryStore();
  await store.saveCandidates([
    {
      id: "c1",
      scanRunId: "scan-1",
      userId: "user-a",
      senderDomain: "deals.example",
      classification: "PROMOTIONAL_HIGH_CONFIDENCE",
      score: 90,
      reasons: [],
      messageCount: 10,
      proposedAction: "UNSUBSCRIBE_THEN_FILTER",
      selectedByDefault: true,
      unsubscribeMethods: ["https"],
      createdAt: new Date().toISOString(),
    },
  ]);

  assert.ok(await store.getCandidate("c1", "user-a"));
  assert.equal(await store.getCandidate("c1", "user-b"), null);
});

test("filter deletion enforces user ownership", async () => {
  resetMemoryStoreForTests();
  const store = new MemoryStore();
  await store.recordActions({
    filters: [
      {
        id: "filter-1",
        userId: "user-a",
        actionId: "action-1",
        senderDomain: "deals.example",
        gmailFilterId: "gf-1",
        gmailLabelId: "label-1",
        labelName: "InboxExorcist/Quieted",
        createdAt: new Date().toISOString(),
      },
    ],
  });

  await store.markFilterDeleted("filter-1", "user-a");
  const userAFilters = await store.listActiveFilters("user-a");
  assert.equal(userAFilters.length, 0);
});

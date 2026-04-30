import test from "node:test";
import assert from "node:assert/strict";

import { validateUnsubscribeUrl } from "../../src/lib/unsubscribe/url.ts";

test("blocks http unsubscribe URLs", async () => {
  const result = await validateUnsubscribeUrl("http://example.com/unsubscribe", {
    resolveDns: false,
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "UNSUBSCRIBE_URL_NOT_HTTPS");
});

test("blocks localhost unsubscribe URLs", async () => {
  const result = await validateUnsubscribeUrl("https://localhost/unsub", {
    resolveDns: false,
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "UNSUBSCRIBE_URL_INTERNAL_HOST");
});

test("blocks localhost subdomain unsubscribe URLs", async () => {
  const result = await validateUnsubscribeUrl("https://api.local/unsub", {
    resolveDns: false,
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "UNSUBSCRIBE_URL_INTERNAL_HOST");
});

test("blocks .local TLD unsubscribe URLs", async () => {
  const result = await validateUnsubscribeUrl("https://myapp.local/unsub", {
    resolveDns: false,
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "UNSUBSCRIBE_URL_INTERNAL_HOST");
});

test("blocks .internal TLD unsubscribe URLs", async () => {
  const result = await validateUnsubscribeUrl("https://service.internal/unsub", {
    resolveDns: false,
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "UNSUBSCRIBE_URL_INTERNAL_HOST");
});

test("blocks .test TLD unsubscribe URLs", async () => {
  const result = await validateUnsubscribeUrl("https://example.test/unsub", {
    resolveDns: false,
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "UNSUBSCRIBE_URL_INTERNAL_HOST");
});

test("blocks private IPv4 unsubscribe URLs", async () => {
  const results = await Promise.all([
    validateUnsubscribeUrl("https://10.0.0.1/unsub", { resolveDns: false }),
    validateUnsubscribeUrl("https://192.168.1.1/unsub", { resolveDns: false }),
    validateUnsubscribeUrl("https://172.16.0.1/unsub", { resolveDns: false }),
    validateUnsubscribeUrl("https://169.254.0.1/unsub", { resolveDns: false }),
    validateUnsubscribeUrl("https://127.0.0.1/unsub", { resolveDns: false }),
  ]);

  for (const result of results) {
    assert.equal(result.ok, false, `Should block ${result}`);
    assert.equal(result.code, "UNSUBSCRIBE_URL_PRIVATE_IP");
  }
});

test("blocks private IPv6 unsubscribe URLs", async () => {
  const results = await Promise.all([
    validateUnsubscribeUrl("https://[::1]/unsub", { resolveDns: false }),
    validateUnsubscribeUrl("https://[fe80::1]/unsub", { resolveDns: false }),
    validateUnsubscribeUrl("https://[fc00::1]/unsub", { resolveDns: false }),
    validateUnsubscribeUrl("https://[fd00::1]/unsub", { resolveDns: false }),
  ]);

  for (const result of results) {
    assert.equal(result.ok, false, `Should block ${result}`);
    assert.equal(result.code, "UNSUBSCRIBE_URL_PRIVATE_IP");
  }
});

test("blocks URLs with credentials", async () => {
  const result = await validateUnsubscribeUrl("https://user:pass@example.com/unsub", {
    resolveDns: false,
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "UNSUBSCRIBE_URL_CREDENTIALS");
});

test("blocks invalid URLs", async () => {
  const result = await validateUnsubscribeUrl("not-a-url", {
    resolveDns: false,
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "UNSUBSCRIBE_URL_INVALID");
});

test("allows ordinary HTTPS unsubscribe URLs", async () => {
  const result = await validateUnsubscribeUrl("https://example.com/unsubscribe?token=abc", {
    resolveDns: false,
  });
  assert.equal(result.ok, true);
});

test("allows HTTPS unsubscribe URLs with subdomains", async () => {
  const result = await validateUnsubscribeUrl("https://unsubscribe.marketing.example.com/opt-out", {
    resolveDns: false,
  });
  assert.equal(result.ok, true);
});

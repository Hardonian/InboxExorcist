import test from "node:test";
import assert from "node:assert/strict";

import { redactSensitive, redactEmail, redactUrl, redactLog } from "../../src/lib/security/redact.ts";

test("redactSensitive redacts Google access tokens", () => {
  const input = "Token: ya29.a0AfH6SMBx1234567890abcdef";
  const result = redactSensitive(input);
  assert.ok(!result.includes("ya29."));
  assert.ok(result.includes("[REDACTED_TOKEN]"));
});

test("redactSensitive redacts refresh tokens", () => {
  const input = "Refresh: 1//0abcdef1234567890abcdef";
  const result = redactSensitive(input);
  assert.ok(!result.includes("1//"));
  assert.ok(result.includes("[REDACTED_TOKEN]"));
});

test("redactSensitive redacts email addresses", () => {
  const input = "User: user@example.com connected";
  const result = redactSensitive(input);
  assert.ok(!result.includes("user@example.com"));
  assert.ok(result.includes("[REDACTED_EMAIL]"));
});

test("redactSensitive redacts message IDs", () => {
  const input = "Message: 18a3b4c5d6e7f890 processed";
  const result = redactSensitive(input);
  assert.ok(!result.includes("18a3b4c5d6e7f890"));
  assert.ok(result.includes("[REDACTED_MESSAGE_ID]"));
});

test("redactEmail redacts various email formats", () => {
  const emails = [
    "user@example.com",
    "first.last@domain.org",
    "user+tag@sub.domain.co.uk",
  ];

  for (const email of emails) {
    const result = redactEmail(`Contact: ${email}`);
    assert.ok(!result.includes(email), `Should redact ${email}`);
  }
});

test("redactUrl redacts auth codes from query params", () => {
  const url = "https://example.com/callback?code=4/0AX4XfWh123&state=abc";
  const result = redactUrl(url);
  assert.ok(!result.includes("4/0AX4XfWh123"));
  assert.ok(result.includes("REDACTED_AUTH_CODE"));
});

test("redactUrl redacts token params from query params", () => {
  const url = "https://example.com/api?token=ya29.abcdef123";
  const result = redactUrl(url);
  assert.ok(!result.includes("ya29.abcdef123"));
});

test("redactLog handles multiple sensitive patterns", () => {
  const input = "Processing ya29.a0AfH6SMBx1234567890abcdef for user@test.com message 18a3b4c5d6e7f890";
  const result = redactLog(input);
  assert.ok(!result.includes("ya29."));
  assert.ok(!result.includes("user@test.com"));
  assert.ok(result.includes("[REDACTED_TOKEN]"));
  assert.ok(result.includes("[REDACTED_EMAIL]"));
});

test("redactLog preserves non-sensitive data", () => {
  const input = "Scan completed: 150 messages, 12 candidates";
  const result = redactLog(input);
  assert.equal(result, input);
});

const tokenPatterns = [
  /ya29\.[A-Za-z0-9\-_]{20,}/g,
  /1\/\/[A-Za-z0-9\-_]{20,}/g,
  /4\/[A-Za-z0-9\-_]{20,}/g,
];

const emailPattern = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const messageIdPattern = /\b[0-9a-f]{16,}\b/g;

export function redactAccessToken(value: string): string {
  let result = value;
  for (const pattern of tokenPatterns) {
    result = result.replace(pattern, "[REDACTED_ACCESS_TOKEN]");
  }
  return result;
}

export function redactRefreshToken(value: string): string {
  return value.replace(/1\/\/[A-Za-z0-9\-_]{20,}/g, "[REDACTED_REFRESH_TOKEN]");
}

export function redactAuthCode(value: string): string {
  return value.replace(/4\/[A-Za-z0-9\-_]{20,}/g, "[REDACTED_AUTH_CODE]");
}

export function redactEmail(value: string): string {
  return value.replace(emailPattern, "[REDACTED_EMAIL]");
}

export function redactSubject(value: string): string {
  return value.replace(/(subject|re|fw|fwd)[:\s]+[^\n]{3,}/gi, "[REDACTED_SUBJECT]");
}

export function redactMessageId(value: string): string {
  return value.replace(messageIdPattern, "[REDACTED_MESSAGE_ID]");
}

export function redactBody(value: string): string {
  return value.replace(/(body|content|html|text)[:\s]+[^\n]{10,}/gi, "[REDACTED_BODY]");
}

export function redactSensitive(value: string): string {
  let result = value;
  for (const pattern of tokenPatterns) {
    result = result.replace(pattern, "[REDACTED_TOKEN]");
  }
  result = result.replace(emailPattern, "[REDACTED_EMAIL]");
  result = result.replace(messageIdPattern, "[REDACTED_MESSAGE_ID]");
  return result;
}

export function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const code = parsed.searchParams.get("code");
    if (code) {
      parsed.searchParams.set("code", "[REDACTED_AUTH_CODE]");
    }
    const token = parsed.searchParams.get("token");
    if (token) {
      parsed.searchParams.set("token", "[REDACTED_TOKEN]");
    }
    return parsed.toString();
  } catch {
    return redactSensitive(url);
  }
}

export type RedactOptions = {
  tokens?: boolean;
  emails?: boolean;
  subjects?: boolean;
  messageIds?: boolean;
  bodies?: boolean;
};

export function redactLog(
  value: string,
  options: RedactOptions = {},
): string {
  let result = value;
  if (options.tokens !== false) {
    for (const pattern of tokenPatterns) {
      result = result.replace(pattern, "[REDACTED_TOKEN]");
    }
  }
  if (options.emails !== false) {
    result = result.replace(emailPattern, "[REDACTED_EMAIL]");
  }
  if (options.subjects) {
    result = result.replace(/(subject|re|fw|fwd)[:\s]+[^\n]{3,}/gi, "[REDACTED_SUBJECT]");
  }
  if (options.messageIds) {
    result = result.replace(messageIdPattern, "[REDACTED_MESSAGE_ID]");
  }
  if (options.bodies) {
    result = result.replace(/(body|content|html|text)[:\s]+[^\n]{10,}/gi, "[REDACTED_BODY]");
  }
  return result;
}

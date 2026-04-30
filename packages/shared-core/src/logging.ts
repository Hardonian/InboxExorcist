export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
};

const REDACTED = "[REDACTED]";
const SENSITIVE_KEYS = new Set([
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "secret",
  "password",
  "api_key",
  "client_secret",
]);

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return [...SENSITIVE_KEYS].some((sk) => lower.includes(sk));
}

function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key)) {
      result[key] = REDACTED;
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key] = redactObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function safeLog(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  if (context) {
    entry.context = redactObject(context);
  }
  return entry;
}

export function logSafe(entry: LogEntry): void {
  const output = JSON.stringify(entry);
  switch (entry.level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export function createLogger(prefix: string) {
  return {
    debug(message: string, context?: Record<string, unknown>) {
      logSafe(safeLog("debug", `${prefix}: ${message}`, context));
    },
    info(message: string, context?: Record<string, unknown>) {
      logSafe(safeLog("info", `${prefix}: ${message}`, context));
    },
    warn(message: string, context?: Record<string, unknown>) {
      logSafe(safeLog("warn", `${prefix}: ${message}`, context));
    },
    error(message: string, context?: Record<string, unknown>) {
      logSafe(safeLog("error", `${prefix}: ${message}`, context));
    },
  };
}

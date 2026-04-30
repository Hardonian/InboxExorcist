import { createHmac } from "node:crypto";

export type HashConfig = {
  secret: string;
  algorithm?: "sha256" | "sha512";
};

function getSecret(config?: HashConfig): string {
  if (config?.secret) return config.secret;
  const env = process.env.PII_HASH_SECRET || process.env.SESSION_SECRET;
  if (env) return env;
  if (process.env.NODE_ENV !== "production") {
    return "shared-core-local-hash-secret";
  }
  throw new Error("PII_HASH_SECRET or SESSION_SECRET is required");
}

export function hashValue(value: string, config?: HashConfig): string {
  const secret = getSecret(config);
  const algo = config?.algorithm || "sha256";
  return createHmac(algo, secret)
    .update(value.trim().toLowerCase())
    .digest("hex");
}

export function hashEmail(email: string, config?: HashConfig): string {
  return hashValue(email, config);
}

export function hashDomain(domain: string, config?: HashConfig): string {
  return hashValue(domain, config);
}

export function safeLogIdentifier(value: string, config?: HashConfig): string {
  const hashed = hashValue(value, config);
  return `${value.charAt(0)}***${hashed.slice(-6)}`;
}

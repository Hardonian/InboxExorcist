import type { FailureEntry } from "./types.ts";

const failureRegistry = new Map<string, FailureEntry>();

export function registerFailure(failure: FailureEntry): void {
  failureRegistry.set(failure.code, failure);
}

export function registerFailures(failures: FailureEntry[]): void {
  for (const f of failures) {
    registerFailure(f);
  }
}

export function getFailure(code: string): FailureEntry | undefined {
  return failureRegistry.get(code);
}

export function listFailures(): FailureEntry[] {
  return [...failureRegistry.values()];
}

export function isRetryableFailure(code: string): boolean {
  const entry = failureRegistry.get(code);
  return entry?.retryable ?? false;
}

import type { DegradedState } from "./types.ts";

export function degradedNone(): DegradedState {
  return {
    degraded: false,
    partialResults: false,
    retryable: false,
  };
}

export function degradedPartial(code: string, message: string): DegradedState {
  return {
    degraded: true,
    code,
    message,
    partialResults: true,
    retryable: true,
  };
}

export function degradedFull(code: string, message: string, retryable = true): DegradedState {
  return {
    degraded: true,
    code,
    message,
    partialResults: false,
    retryable,
  };
}

export function mergeDegraded(...states: DegradedState[]): DegradedState {
  const anyDegraded = states.some((s) => s.degraded);
  const anyPartial = states.some((s) => s.partialResults);
  const anyRetryable = states.some((s) => s.retryable);
  const firstFailure = states.find((s) => s.degraded && s.code);

  return {
    degraded: anyDegraded,
    code: firstFailure?.code,
    message: firstFailure?.message,
    partialResults: anyPartial,
    retryable: anyRetryable,
  };
}

export function isDegraded(state: DegradedState): boolean {
  return state.degraded;
}

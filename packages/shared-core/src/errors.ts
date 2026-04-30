import type { ApiErrorEnvelope, ApiSuccessEnvelope } from "./types.ts";

export class AppError extends Error {
  code: string;
  retryable: boolean;
  status: number;
  degraded: boolean;
  resultId?: string;

  constructor({
    code,
    message,
    retryable = false,
    status = 400,
    degraded = false,
    resultId,
  }: {
    code: string;
    message: string;
    retryable?: boolean;
    status?: number;
    degraded?: boolean;
    resultId?: string;
  }) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.retryable = retryable;
    this.status = status;
    this.degraded = degraded;
    this.resultId = resultId;
  }
}

export function errorEnvelope(error: AppError): ApiErrorEnvelope {
  return {
    ok: false,
    code: error.code,
    message: error.message,
    retryable: error.retryable,
    degraded: error.degraded || undefined,
    resultId: error.resultId,
  };
}

export function okEnvelope<T>(
  data: T,
  options: Omit<ApiSuccessEnvelope<T>, "ok" | "data"> = {},
): ApiSuccessEnvelope<T> {
  return { ok: true, data, ...options };
}

export function unknownErrorEnvelope(resultId?: string): ApiErrorEnvelope {
  return {
    ok: false,
    code: "INTERNAL_ERROR",
    message: "Something went wrong. No inbox data was stored from this failure.",
    retryable: true,
    degraded: true,
    resultId,
  };
}

export function toAppError(error: unknown, resultId?: string): AppError {
  if (error instanceof AppError) {
    return error;
  }
  return new AppError({
    code: "INTERNAL_ERROR",
    message: "Something went wrong. No inbox data was stored from this failure.",
    retryable: true,
    status: 500,
    degraded: true,
    resultId,
  });
}

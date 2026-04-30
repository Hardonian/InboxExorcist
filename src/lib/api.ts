import { NextResponse } from "next/server";
import { AppError, errorEnvelope, okEnvelope, toAppError } from "@/lib/errors.ts";
import type { ConfidenceLevel, Signal, Reason, Evidence, Limitation } from "@inbox-exorcist/shared-core/types";
import { calculateConfidence } from "@inbox-exorcist/shared-intelligence/confidence";
import { randomUUID } from "node:crypto";

export function jsonOk<T>(
  data: T,
  init: { status?: number; degraded?: boolean } = {},
) {
  return NextResponse.json(okEnvelope(data, { degraded: init.degraded }), {
    status: init.status || 200,
  });
}

export function jsonError(error: AppError) {
  return NextResponse.json(errorEnvelope(error), { status: error.status });
}

export function handleApiError(error: unknown) {
  return jsonError(toAppError(error));
}

export async function readJsonBody<T = unknown>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new AppError({
      code: "INVALID_JSON",
      message: "Request body must be valid JSON.",
      status: 400,
    });
  }
}

export function buildSharedResponse<T extends Record<string, unknown>>(
  data: T,
  options: {
    degraded?: boolean;
    score?: number;
    reasons?: string[];
    signals?: Signal[];
    evidence?: Evidence[];
    limitations?: Limitation[];
    resultId?: string;
    diagnosticsId?: string;
  } = {},
) {
  const resultId = options.resultId || `res_${randomUUID()}`;
  const diagnosticsId = options.diagnosticsId;
  const score = options.score ?? 0;
  const confidence = calculateConfidence(score, options.reasons ?? []);

  const sharedFields = {
    schemaVersion: "v1" as const,
    ok: true,
    resultId,
    confidence: confidence.level as ConfidenceLevel,
    confidenceExplanation: {
      level: confidence.level,
      score: confidence.score,
      factors: confidence.factors,
    },
    reasons: (options.reasons ?? []).map((r): Reason => ({ code: r, message: r, severity: "info" as const })),
    signals: options.signals ?? [],
    evidence: options.evidence ?? [],
    limitations: options.limitations ?? [],
    degraded: options.degraded ?? false,
    diagnosticsId,
  };

  return NextResponse.json({ ...sharedFields, ...data }, { status: 200 });
}

export type SchemaVersion = "v1";

export type ConfidenceLevel = "high" | "medium" | "low" | "none";

export type ConfidenceExplanation = {
  level: ConfidenceLevel;
  score: number;
  factors: string[];
};

export type Signal = {
  id: string;
  type: "positive" | "negative" | "neutral";
  weight: number;
  description: string;
};

export type Evidence = {
  type: string;
  value: string;
  source: string;
};

export type Reason = {
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
};

export type Limitation = {
  code: string;
  message: string;
  impact: "low" | "medium" | "high";
};

export type SharedResultBase = {
  schemaVersion: SchemaVersion;
  ok: boolean;
  resultId: string;
  confidence: ConfidenceLevel;
  confidenceExplanation: ConfidenceExplanation;
  reasons: Reason[];
  signals: Signal[];
  evidence: Evidence[];
  limitations: Limitation[];
  degraded: boolean;
  diagnosticsId?: string;
};

export type ApiErrorEnvelope = {
  ok: false;
  code: string;
  message: string;
  retryable: boolean;
  degraded?: boolean;
  resultId?: string;
  diagnosticsId?: string;
};

export type ApiSuccessEnvelope<T> = {
  ok: true;
  data: T;
  degraded?: boolean;
  warnings?: ApiErrorEnvelope[];
  resultId?: string;
  diagnosticsId?: string;
};

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export type DegradedState = {
  degraded: boolean;
  code?: string;
  message?: string;
  partialResults: boolean;
  retryable: boolean;
};

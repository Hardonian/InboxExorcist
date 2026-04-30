export type SignalType = "positive" | "negative" | "neutral";

export type Signal = {
  id: string;
  type: SignalType;
  weight: number;
  description: string;
  category?: string;
};

export type FailureCode = string;

export type FailureEntry = {
  code: FailureCode;
  userSafeMessage: string;
  retryable: boolean;
  confidenceImpact: "none" | "reduce" | "invalidate";
  actionImpact: "none" | "block" | "partial";
};

export type ConfidenceLevel = "high" | "medium" | "low" | "none";

export type ConfidenceResult = {
  level: ConfidenceLevel;
  score: number;
  explanation: string;
  factors: string[];
};

export type EvidenceItem = {
  type: string;
  value: string;
  source: string;
  confidence: ConfidenceLevel;
};

export type ScoringInput = {
  signals: Signal[];
  baseScore?: number;
  minScore?: number;
  maxScore?: number;
};

export type ScoringResult = {
  score: number;
  appliedSignals: Signal[];
  breakdown: string[];
};

export type AdapterInput = Record<string, unknown>;

export type AdapterOutput = {
  signals: Signal[];
  evidence: EvidenceItem[];
  score: number;
  confidence: ConfidenceResult;
  degraded: boolean;
};

export type AdapterInterface = {
  name: string;
  process(input: AdapterInput): Promise<AdapterOutput>;
};

export type AutomationHook = {
  name: string;
  trigger: string;
  execute(context: Record<string, unknown>): Promise<void>;
};

export type RuleUpdate = {
  ruleId: string;
  action: "create" | "update" | "delete";
  payload: Record<string, unknown>;
};

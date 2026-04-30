import type { ScoringInput, ScoringResult } from "./types.ts";

export function computeScore(input: ScoringInput): ScoringResult {
  const base = input.baseScore ?? 0;
  const min = input.minScore ?? 0;
  const max = input.maxScore ?? 100;

  let score = base;
  const applied: typeof input.signals = [];
  const breakdown: string[] = [];

  for (const signal of input.signals) {
    score += signal.weight;
    applied.push(signal);
    breakdown.push(`${signal.description} (${signal.type}: ${signal.weight > 0 ? "+" : ""}${signal.weight})`);
  }

  score = Math.max(min, Math.min(max, score));

  return { score, appliedSignals: applied, breakdown };
}

export function clampScore(score: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, score));
}

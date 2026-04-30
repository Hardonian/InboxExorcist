import type { ConfidenceLevel, ConfidenceResult } from "./types.ts";

export function calculateConfidence(
  score: number,
  factors: string[],
  highThreshold = 80,
  mediumThreshold = 50,
): ConfidenceResult {
  let level: ConfidenceLevel;
  let explanation: string;

  if (score >= highThreshold) {
    level = "high";
    explanation = `Score ${score} exceeds high-confidence threshold (${highThreshold}).`;
  } else if (score >= mediumThreshold) {
    level = "medium";
    explanation = `Score ${score} is between medium (${mediumThreshold}) and high (${highThreshold}) thresholds.`;
  } else if (score > 0) {
    level = "low";
    explanation = `Score ${score} is below medium threshold (${mediumThreshold}). Limited evidence.`;
  } else {
    level = "none";
    explanation = "No positive signals detected.";
  }

  return { level, score, explanation, factors };
}

export function explainConfidence(result: ConfidenceResult): string {
  const parts = [`Confidence: ${result.level}`, `Score: ${result.score}`];
  if (result.factors.length > 0) {
    parts.push(`Factors: ${result.factors.join(", ")}`);
  }
  return parts.join(". ");
}

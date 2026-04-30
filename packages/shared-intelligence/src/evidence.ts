import type { ConfidenceLevel, EvidenceItem } from "./types.ts";

export function createEvidence(
  type: string,
  value: string,
  source: string,
  confidence: ConfidenceLevel = "medium",
): EvidenceItem {
  return { type, value, source, confidence };
}

export function filterEvidence(
  items: EvidenceItem[],
  minConfidence: ConfidenceLevel,
): EvidenceItem[] {
  const order: Record<ConfidenceLevel, number> = { high: 3, medium: 2, low: 1, none: 0 };
  const threshold = order[minConfidence] ?? 0;
  return items.filter((item) => (order[item.confidence] ?? 0) >= threshold);
}

export function summarizeEvidence(items: EvidenceItem[]): string[] {
  const byType = new Map<string, number>();
  for (const item of items) {
    byType.set(item.type, (byType.get(item.type) || 0) + 1);
  }
  return [...byType.entries()].map(([type, count]) => `${count}x ${type}`);
}

import type { ProductUsageDiagnostics } from "./types.ts";

export function createUsageDiagnostics(
  userIdHash: string,
  overrides: Partial<ProductUsageDiagnostics> = {},
): ProductUsageDiagnostics {
  return {
    userIdHash,
    totalScans: 0,
    totalQuietActions: 0,
    totalUndoActions: 0,
    lastActiveAt: new Date().toISOString(),
    connectedSince: new Date().toISOString(),
    errorRate: 0,
    ...overrides,
  };
}

export function incrementScanCount(usage: ProductUsageDiagnostics): ProductUsageDiagnostics {
  return { ...usage, totalScans: usage.totalScans + 1 };
}

export function incrementQuietCount(usage: ProductUsageDiagnostics): ProductUsageDiagnostics {
  return { ...usage, totalQuietActions: usage.totalQuietActions + 1 };
}

export function incrementUndoCount(usage: ProductUsageDiagnostics): ProductUsageDiagnostics {
  return { ...usage, totalUndoActions: usage.totalUndoActions + 1 };
}

export function updateErrorRate(
  usage: ProductUsageDiagnostics,
  totalOps: number,
  errorOps: number,
): ProductUsageDiagnostics {
  return {
    ...usage,
    errorRate: totalOps > 0 ? errorOps / totalOps : 0,
    lastActiveAt: new Date().toISOString(),
  };
}

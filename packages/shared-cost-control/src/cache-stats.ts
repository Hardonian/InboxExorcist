import type { CacheStats } from "./types.ts";

export function createCacheStats(): CacheStats {
  return { hits: 0, misses: 0, hitRate: 0 };
}

export function recordHit(stats: CacheStats): CacheStats {
  const total = stats.hits + stats.misses + 1;
  return {
    ...stats,
    hits: stats.hits + 1,
    hitRate: (stats.hits + 1) / total,
  };
}

export function recordMiss(stats: CacheStats): CacheStats {
  const total = stats.hits + stats.misses + 1;
  return {
    ...stats,
    misses: stats.misses + 1,
    hitRate: stats.hits / total,
  };
}

export function getHitRate(stats: CacheStats): number {
  const total = stats.hits + stats.misses;
  return total > 0 ? stats.hits / total : 0;
}

type IdempotencyStore = {
  has(key: string): boolean;
  set(key: string, ttlMs?: number): void;
};

const storeMap = new Map<string, number>();

const inMemoryStore: IdempotencyStore = {
  has(key: string) {
    const expiry = storeMap.get(key);
    if (!expiry) return false;
    if (Date.now() > expiry) {
      storeMap.delete(key);
      return false;
    }
    return true;
  },
  set(key: string, ttlMs = 300_000) {
    storeMap.set(key, Date.now() + ttlMs);
  },
};

export function idempotencyKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:${parts.join(":")}`;
}

export function checkIdempotency(
  key: string,
  store: IdempotencyStore = inMemoryStore,
): boolean {
  if (store.has(key)) {
    return true;
  }
  store.set(key);
  return false;
}

export function createIdempotencyMiddleware(
  prefix: string,
  store: IdempotencyStore = inMemoryStore,
) {
  return function (keyParts: string[]): { duplicate: boolean; key: string } {
    const key = idempotencyKey(prefix, ...keyParts);
    const duplicate = store.has(key);
    if (!duplicate) {
      store.set(key);
    }
    return { duplicate, key };
  };
}

export type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
};

export class RateLimiter {
  private options: RateLimitOptions;
  private requests: number[] = [];

  constructor(options: RateLimitOptions) {
    this.options = options;
  }

  canProceed(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter((ts) => now - ts < this.options.windowMs);
    return this.requests.length < this.options.maxRequests;
  }

  consume(): { ok: boolean; retryAfterMs?: number } {
    const now = Date.now();
    this.requests = this.requests.filter((ts) => now - ts < this.options.windowMs);

    if (this.requests.length < this.options.maxRequests) {
      this.requests.push(now);
      return { ok: true };
    }

    const oldestInWindow = this.requests[0];
    const retryAfterMs = this.options.windowMs - (now - oldestInWindow);
    return { ok: false, retryAfterMs: Math.max(0, retryAfterMs) };
  }

  reset(): void {
    this.requests = [];
  }
}

export function createSlidingWindowLimiter(maxRequests: number, windowMs: number): RateLimiter {
  return new RateLimiter({ maxRequests, windowMs });
}

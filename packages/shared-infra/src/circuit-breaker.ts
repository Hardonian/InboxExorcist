export type CircuitState = "closed" | "open" | "half-open";

export type CircuitBreakerOptions = {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxAttempts: number;
};

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeoutMs: 60_000,
  halfOpenMaxAttempts: 3,
};

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureAt = 0;
  private options: CircuitBreakerOptions;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  getState(): CircuitState {
    if (
      this.state === "open" &&
      Date.now() - this.lastFailureAt > this.options.resetTimeoutMs
    ) {
      this.state = "half-open";
      this.successCount = 0;
    }
    return this.state;
  }

  canExecute(): boolean {
    const state = this.getState();
    return state === "closed" || state === "half-open";
  }

  recordSuccess(): void {
    if (this.state === "half-open") {
      this.successCount += 1;
      if (this.successCount >= this.options.halfOpenMaxAttempts) {
        this.state = "closed";
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else {
      this.failureCount = 0;
    }
  }

  recordFailure(): void {
    this.failureCount += 1;
    this.lastFailureAt = Date.now();

    if (this.state === "half-open") {
      this.state = "open";
      this.successCount = 0;
    } else if (this.failureCount >= this.options.failureThreshold) {
      this.state = "open";
    }
  }

  reset(): void {
    this.state = "closed";
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureAt = 0;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new Error("Circuit breaker is open");
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
}

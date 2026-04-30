export type HealthCheckResult = {
  service: string;
  status: "healthy" | "degraded" | "unhealthy";
  details?: Record<string, unknown>;
  checkedAt: string;
};

export type HealthReport = {
  overall: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheckResult[];
  timestamp: string;
};

export type HealthChecker = () => Promise<HealthCheckResult>;

const checkers = new Map<string, HealthChecker>();

export function registerHealthChecker(name: string, checker: HealthChecker): void {
  checkers.set(name, checker);
}

export async function runHealthChecks(): Promise<HealthReport> {
  const checks: HealthCheckResult[] = [];

  for (const [name, checker] of checkers) {
    try {
      const result = await checker();
      checks.push(result);
    } catch (error) {
      checks.push({
        service: name,
        status: "unhealthy",
        details: { error: error instanceof Error ? error.message : String(error) },
        checkedAt: new Date().toISOString(),
      });
    }
  }

  const statuses = checks.map((c) => c.status);
  const overall = statuses.some((s) => s === "unhealthy")
    ? "unhealthy"
    : statuses.some((s) => s === "degraded")
      ? "degraded"
      : "healthy";

  return { overall, checks, timestamp: new Date().toISOString() };
}

export function getCheckerCount(): number {
  return checkers.size;
}

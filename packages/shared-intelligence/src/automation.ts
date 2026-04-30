import type { AutomationHook, RuleUpdate } from "./types.ts";

const hookRegistry = new Map<string, AutomationHook>();

export function registerHook(hook: AutomationHook): void {
  hookRegistry.set(hook.name, hook);
}

export function getHook(name: string): AutomationHook | undefined {
  return hookRegistry.get(name);
}

export function listHooks(): AutomationHook[] {
  return [...hookRegistry.values()];
}

export function executeHook(name: string, context: Record<string, unknown>): Promise<void> {
  const hook = hookRegistry.get(name);
  if (!hook) {
    throw new Error(`Automation hook "${name}" not found`);
  }
  return hook.execute(context);
}

export type RuleUpdateQueue = RuleUpdate[];

export function createRuleUpdate(
  ruleId: string,
  action: RuleUpdate["action"],
  payload: Record<string, unknown>,
): RuleUpdate {
  return { ruleId, action, payload };
}

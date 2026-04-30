import type { Signal } from "./types.ts";

const signalRegistry = new Map<string, Signal>();

export function registerSignal(signal: Signal): void {
  signalRegistry.set(signal.id, signal);
}

export function registerSignals(signals: Signal[]): void {
  for (const s of signals) {
    registerSignal(s);
  }
}

export function getSignal(id: string): Signal | undefined {
  return signalRegistry.get(id);
}

export function listSignals(): Signal[] {
  return [...signalRegistry.values()];
}

export function getSignalsByCategory(category: string): Signal[] {
  return [...signalRegistry.values()].filter((s) => s.category === category);
}

export function clearSignals(): void {
  signalRegistry.clear();
}

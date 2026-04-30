import type { AdapterInput, AdapterOutput, AdapterInterface } from "./types.ts";

export abstract class BaseAdapter implements AdapterInterface {
  abstract name: string;
  abstract process(input: AdapterInput): Promise<AdapterOutput>;

  protected validateInput(input: AdapterInput, requiredKeys: string[]): void {
    const missing = requiredKeys.filter((key) => !(key in input));
    if (missing.length > 0) {
      throw new Error(`Adapter ${this.name} missing required keys: ${missing.join(", ")}`);
    }
  }
}

export function createAdapterPipeline(adapters: AdapterInterface[]) {
  return {
    async execute(input: AdapterInput): Promise<AdapterOutput[]> {
      const results: AdapterOutput[] = [];
      for (const adapter of adapters) {
        const result = await adapter.process(input);
        results.push(result);
      }
      return results;
    },
  };
}

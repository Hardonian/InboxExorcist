import { getRuntimeConfig } from "../config";
import { MemoryStore } from "./memory-store";
import type { AppStore } from "./store";
import { SupabaseRestStore } from "./supabase-rest-store";

let store: AppStore | null = null;

export function getStore() {
  if (!store) {
    store = getRuntimeConfig().supabaseConfigured
      ? new SupabaseRestStore()
      : new MemoryStore();
  }
  return store;
}

export function setStoreForTests(nextStore: AppStore | null) {
  store = nextStore;
}

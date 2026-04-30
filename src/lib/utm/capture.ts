export type UTMParams = {
  source?: string;
  campaign?: string;
  creative?: string;
  hook?: string;
  medium?: string;
  term?: string;
};

export const utmKeys = ["source", "campaign", "creative", "hook", "medium", "term"] as const;

export function captureUTMParams(url?: string): UTMParams {
  const search = url || (typeof window !== "undefined" ? window.location.search : "");
  const params = new URLSearchParams(search);
  const result: UTMParams = {};

  for (const key of utmKeys) {
    const value = params.get(`utm_${key}`);
    if (value) {
      result[key] = value;
    }
  }

  return result;
}

export function storeUTMParams(params: UTMParams) {
  if (typeof window === "undefined") return;
  try {
    const existing = sessionStorage.getItem("ie_utm") || "{}";
    const merged = { ...JSON.parse(existing), ...params };
    sessionStorage.setItem("ie_utm", JSON.stringify(merged));
  } catch {
    // Storage unavailable
  }
}

export function getStoredUTMParams(): UTMParams {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem("ie_utm");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function useUTM() {
  if (typeof window === "undefined") return {};
  const captured = captureUTMParams();
  const stored = getStoredUTMParams();
  return { ...stored, ...captured };
}

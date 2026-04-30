export type AnalyticsEvent =
  | "landing_view"
  | "oauth_start"
  | "oauth_success"
  | "scan_started"
  | "scan_completed"
  | "quiet_preview_viewed"
  | "quiet_action_started"
  | "quiet_action_completed"
  | "undo_clicked"
  | "payment_started";

export type AnalyticsProperties = Record<string, string | number | boolean | null>;

export function trackEvent(
  event: AnalyticsEvent,
  properties: AnalyticsProperties = {},
) {
  if (typeof window === "undefined") return;

  try {
    window.dispatchEvent(
      new CustomEvent("inboxexorcist:analytics", {
        detail: { event, properties, timestamp: Date.now() },
      }),
    );

    const gtagFn = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtagFn === "function") {
      gtagFn("event", event, properties);
    }
  } catch {
    // Analytics should never break the app
  }
}

export function trackLandingView() {
  trackEvent("landing_view");
}

export function trackOauthStart() {
  trackEvent("oauth_start");
}

export function trackOauthSuccess() {
  trackEvent("oauth_success");
}

export function trackScanStarted() {
  trackEvent("scan_started");
}

export function trackScanCompleted(properties: AnalyticsProperties = {}) {
  trackEvent("scan_completed", properties);
}

export function trackQuietPreviewViewed() {
  trackEvent("quiet_preview_viewed");
}

export function trackQuietActionStarted() {
  trackEvent("quiet_action_started");
}

export function trackQuietActionCompleted(properties: AnalyticsProperties = {}) {
  trackEvent("quiet_action_completed", properties);
}

export function trackUndoClicked() {
  trackEvent("undo_clicked");
}

export function trackPaymentStarted() {
  trackEvent("payment_started");
}

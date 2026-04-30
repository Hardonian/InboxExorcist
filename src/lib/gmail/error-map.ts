import { AppError } from "../errors";

export function mapGmailError(status: number, bodyText = "") {
  if (status === 401 || status === 403) {
    return new AppError({
      code: status === 401 ? "GMAIL_AUTH_EXPIRED" : "INSUFFICIENT_SCOPES",
      message:
        status === 401
          ? "Gmail disconnected. Please reconnect Gmail and retry."
          : "Gmail did not grant enough access to quiet senders.",
      retryable: status === 401,
      status,
      degraded: true,
    });
  }

  if (status === 429 || /quota/i.test(bodyText)) {
    return new AppError({
      code: "GMAIL_QUOTA_LIMITED",
      message: "Gmail quota limited this scan. Retry in a few minutes.",
      retryable: true,
      status: 429,
      degraded: true,
    });
  }

  if (status >= 500) {
    return new AppError({
      code: "GMAIL_UPSTREAM_ERROR",
      message: "Gmail had a temporary issue. No emails were deleted.",
      retryable: true,
      status: 503,
      degraded: true,
    });
  }

  return new AppError({
    code: "GMAIL_REQUEST_FAILED",
    message: "Gmail could not complete the request. No emails were deleted.",
    retryable: false,
    status: 502,
    degraded: true,
  });
}

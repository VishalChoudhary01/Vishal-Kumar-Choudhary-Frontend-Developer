export const MAX_PORTFOLIO_ANALYTICS_BODY_BYTES = 1024;

function requestError(code, message, status = 400) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}

export function isSameOriginPortfolioRequest(request) {
  const origin = request?.headers?.get?.("origin");
  if (typeof origin !== "string" || !origin.trim()) return false;

  try {
    const parsedOrigin = new URL(origin);
    const requestUrl = new URL(request.url);

    return (
      ["http:", "https:"].includes(parsedOrigin.protocol) &&
      parsedOrigin.origin === requestUrl.origin
    );
  } catch {
    return false;
  }
}

/**
 * Reads at most 1 KB from the request stream. Content-Length is an early
 * rejection only; the streamed byte count remains authoritative.
 */
export async function readPortfolioAnalyticsJson(request) {
  const contentType = request.headers.get("content-type")
    ?.split(";")[0]
    ?.trim()
    .toLowerCase();

  if (contentType !== "application/json") {
    throw requestError(
      "UNSUPPORTED_CONTENT_TYPE",
      "Content-Type must be application/json.",
      415,
    );
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    if (!/^\d+$/.test(contentLength)) {
      throw requestError("INVALID_CONTENT_LENGTH", "Invalid request length.");
    }
    if (Number(contentLength) > MAX_PORTFOLIO_ANALYTICS_BODY_BYTES) {
      throw requestError("PAYLOAD_TOO_LARGE", "Request body is too large.", 413);
    }
  }

  if (!request.body) {
    throw requestError("INVALID_REQUEST", "A JSON request body is required.");
  }

  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_PORTFOLIO_ANALYTICS_BODY_BYTES) {
        await reader.cancel().catch(() => {});
        throw requestError("PAYLOAD_TOO_LARGE", "Request body is too large.", 413);
      }

      chunks.push(value);
    }
  } catch (error) {
    if (error?.code) throw error;
    throw requestError("INVALID_REQUEST", "The request body could not be read.");
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let value;
  try {
    value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw requestError("INVALID_JSON", "A valid JSON body is required.");
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw requestError("INVALID_JSON", "A JSON object is required.");
  }

  return value;
}
